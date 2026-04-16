import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAuth } from '@/lib/auth/require-auth';
import { verifyProjectOwnership } from '@/lib/data/project-queries';
import { createIngestionManifest } from '@/lib/data/ingestion-queries';
import { createAuditEntry } from '@/lib/data/audit-queries';

const CandidateFamilySchema = z.object({
  family: z.string().min(1),
  manufacturer: z.string().min(1),
  mpns: z.array(z.string().min(1)).min(1),
});

const CandidatesSchema = z.object({
  candidates: z.array(CandidateFamilySchema).min(1),
});

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;

  try {
    const { id } = await params;
    const ownership = await verifyProjectOwnership(id, auth.user.id);
    if (!ownership.authorized) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const body = await request.json();
    const parsed = CandidatesSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const candidates = parsed.data.candidates.map((c) => ({
      ...c,
      documentTypes: ['datasheet', 'application_note'],
    }));

    const manifest = await createIngestionManifest(id, {
      status: 'queued',
      candidateFamilies: candidates,
      stages: [
        { name: 'candidate_discovery', status: 'completed' },
        { name: 'datasheet_fetch', status: 'pending' },
        { name: 'errata_check', status: 'pending' },
        { name: 'app_note_fetch', status: 'pending' },
        { name: 'chunking', status: 'pending' },
        { name: 'embedding', status: 'pending' },
        { name: 'sufficiency_gate', status: 'pending' },
      ],
    });

    await createAuditEntry(id, {
      category: 'ingestion',
      action: 'candidates_saved',
      actor: auth.user.id,
      details: { candidateCount: candidates.length, manifestId: manifest.id },
    });

    return NextResponse.json({
      projectId: id,
      candidates,
      manifestId: manifest.id,
    });
  } catch {
    return NextResponse.json({ error: 'Failed to save ingest candidates' }, { status: 400 });
  }
}
