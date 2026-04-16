import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/require-auth';
import { verifyProjectOwnership } from '@/lib/data/project-queries';
import { getArtifacts } from '@/lib/data/artifact-queries';

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;

  try {
    const { id } = await params;
    const ownership = await verifyProjectOwnership(id, auth.user.id);
    if (!ownership.authorized) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const artifacts = await getArtifacts(id, 'pcb_2d');

    if (artifacts.length === 0) {
      return NextResponse.json({
        projectId: id,
        type: 'pcb2d',
        format: 'svg',
        isPlaceholder: true,
        available: false,
        reason: 'no_design_generated',
        message: 'Run KiCad design generation first to create preview assets',
      });
    }

    const latest = artifacts[0]!;
    return NextResponse.json({
      projectId: id,
      type: 'pcb2d',
      format: 'svg',
      isPlaceholder: false,
      available: true,
      artifactId: latest.id,
      fileName: latest.fileName,
      filePath: latest.filePath,
      fileSize: latest.fileSize,
      mimeType: latest.mimeType,
      checksum: latest.checksum,
      createdAt: latest.createdAt.toISOString(),
    });
  } catch {
    return NextResponse.json({
      projectId: '',
      type: 'pcb2d',
      format: 'svg',
      available: false,
      isPlaceholder: true,
      meta: { mode: 'degraded', reason: 'Database not configured' },
    });
  }
}
