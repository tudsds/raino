import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/require-auth';
import { updateIngestionStatus } from '@/lib/data/ingestion-queries';
import { createAuditEntry } from '@/lib/data/audit-queries';
import { updateProjectStatus } from '@/lib/data/project-queries';

export async function POST(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;

  try {
    const { id } = await params;

    await updateIngestionStatus(id, 'completed');
    await updateProjectStatus(id, 'ingested');

    await createAuditEntry(id, {
      category: 'ingestion',
      action: 'candidates_promoted',
      actor: auth.user.id,
    });

    return NextResponse.json({
      projectId: id,
      promoted: true,
      status: 'completed',
    });
  } catch {
    return NextResponse.json({ error: 'Failed to promote ingest candidates' }, { status: 400 });
  }
}
