import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAuth } from '@/lib/auth/require-auth';
import { getProjectsForUser, createProject, getUserOrgId } from '@/lib/data/project-queries';
import { createAuditEntry } from '@/lib/data/audit-queries';

const CreateProjectSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  organizationId: z.string().uuid().optional(),
});

export async function GET() {
  const auth = await requireAuth();
  if (auth.error) return auth.error;

  try {
    const projects = await getProjectsForUser(auth.user.id);
    return NextResponse.json({ projects });
  } catch {
    return NextResponse.json({
      projects: [],
      meta: { mode: 'degraded', reason: 'Database not configured' },
    });
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;

  try {
    const body = await request.json();
    const parsed = CreateProjectSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const { name, description, organizationId } = parsed.data;

    const orgId = organizationId ?? (await getUserOrgId(auth.user.id));

    if (!orgId) {
      return NextResponse.json(
        { error: 'No organization found for user. Please complete sign-up first.' },
        { status: 403 },
      );
    }

    const project = await createProject({
      name,
      description,
      organizationId: orgId,
    });

    await createAuditEntry(project.id, {
      category: 'project',
      action: 'project_created',
      actor: auth.user.id,
      details: { name, description },
    });

    return NextResponse.json({ project, message: 'Project created successfully' }, { status: 201 });
  } catch (error) {
    console.error('[api/projects] Project creation failed:', error);
    return NextResponse.json(
      { error: 'Failed to create project', details: error instanceof Error ? error.message : String(error) },
      { status: 400 }
    );
  }
}
