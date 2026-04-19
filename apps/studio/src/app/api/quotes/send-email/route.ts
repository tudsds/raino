import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAuth } from '@/lib/auth/require-auth';
import { verifyProjectOwnership } from '@/lib/data/project-queries';
import { sendDesignQuoteEmail } from '@/lib/email';
import { getArtifacts } from '@/lib/data/artifact-queries';
import { createAuditEntry } from '@/lib/data/audit-queries';

const SendEmailRequestSchema = z.object({
  projectId: z.string().min(1),
  artifactUrls: z.array(
    z.object({
      url: z.string().url(),
      filename: z.string().min(1),
    }),
  ),
  userEmail: z.string().email(),
});

export async function POST(request: NextRequest) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;

  try {
    const body = await request.json();
    const parsed = SendEmailRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const { projectId, artifactUrls, userEmail } = parsed.data;

    const ownership = await verifyProjectOwnership(projectId, auth.user.id);
    if (!ownership.authorized) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const project = ownership.project;

    const artifacts = await getArtifacts(projectId);
    const validArtifactUrls = new Set(
      artifacts
        .filter((a) => a.storageBucket && a.storageKey)
        .map((a) => {
          const url = process.env.NEXT_PUBLIC_SUPABASE_URL
            ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${a.storageBucket}/${a.storageKey}`
            : a.filePath;
          return url;
        }),
    );

    const validFilePaths = new Set(artifacts.map((a) => a.filePath));

    const filteredArtifacts = artifactUrls.filter((artifact) => {
      return validArtifactUrls.has(artifact.url) || validFilePaths.has(artifact.url);
    });

    if (filteredArtifacts.length === 0) {
      return NextResponse.json(
        { error: 'No valid artifacts selected for email' },
        { status: 400 },
      );
    }

    const result = await sendDesignQuoteEmail({
      to: userEmail,
      projectName: project.name,
      projectId: project.id,
      artifactUrls: filteredArtifacts,
    });

    if (result.degraded) {
      return NextResponse.json(
        {
          success: false,
          error: result.error,
          degraded: true,
        },
        { status: 503 },
      );
    }

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 },
      );
    }

    await createAuditEntry(projectId, {
      category: 'email',
      action: 'quote_email_sent',
      actor: auth.user.id,
      details: {
        emailId: result.emailId,
        recipient: userEmail,
        artifactCount: filteredArtifacts.length,
      },
    });

    return NextResponse.json({
      success: true,
      emailId: result.emailId,
    });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Failed to send email' },
      { status: 500 },
    );
  }
}
