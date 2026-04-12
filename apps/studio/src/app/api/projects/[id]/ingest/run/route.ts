import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/require-auth';
import { prisma } from '@raino/db';
import { createAuditEntry } from '@/lib/data/audit-queries';
import { updateProjectStatus } from '@/lib/data/project-queries';
import { updateIngestionStatus } from '@/lib/data/ingestion-queries';

export async function POST(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;

  try {
    const { id } = await params;

    const manifest = await prisma.ingestionManifest.findUnique({ where: { projectId: id } });

    if (!manifest) {
      await prisma.ingestionManifest.create({
        data: {
          projectId: id,
          status: 'running',
          candidateFamilies: [],
          stages: [
            { name: 'datasheet_fetch', status: 'in_progress' },
            { name: 'errata_check', status: 'pending' },
            { name: 'app_note_fetch', status: 'pending' },
            { name: 'chunking', status: 'pending' },
            { name: 'embedding', status: 'pending' },
            { name: 'sufficiency_gate', status: 'pending' },
          ],
        },
      });
    } else {
      await updateIngestionStatus(id, 'running');
    }

    await updateProjectStatus(id, 'candidates_discovered');

    await createAuditEntry(id, {
      category: 'ingestion',
      action: 'ingestion_run_started',
      actor: auth.user.id,
    });

    const runId = manifest?.id ?? `run-${Date.now()}`;

    return NextResponse.json({
      projectId: id,
      runId,
      status: 'started',
      message: 'Ingestion pipeline started',
    });
  } catch {
    return NextResponse.json({ error: 'Failed to start ingestion run' }, { status: 400 });
  }
}
