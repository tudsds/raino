import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/require-auth';
import { verifyProjectOwnership } from '@/lib/data/project-queries';
import { getIngestionManifest } from '@/lib/data/ingestion-queries';

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;

  try {
    const { id } = await params;
    const ownership = await verifyProjectOwnership(id, auth.user.id);
    if (!ownership.authorized) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const manifest = await getIngestionManifest(id);

    if (!manifest) {
      return NextResponse.json({
        projectId: id,
        runId: null,
        status: 'not_started',
        progress: 0,
        stages: [],
        meta: { mode: 'degraded', reason: 'No ingestion manifest found' },
      });
    }

    const stages = Array.isArray(manifest.stages)
      ? (manifest.stages as Array<Record<string, unknown>>)
      : [];
    const completedStages = stages.filter((s) => s.status === 'completed').length;
    const progress = stages.length > 0 ? Math.round((completedStages / stages.length) * 100) : 0;

    return NextResponse.json({
      projectId: id,
      runId: manifest.id,
      status: manifest.status,
      progress,
      stages,
    });
  } catch {
    return NextResponse.json({
      projectId: '',
      runId: null,
      status: 'unknown',
      progress: 0,
      stages: [],
      meta: { mode: 'degraded', reason: 'Database not configured' },
    });
  }
}
