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

    const artifacts = await getArtifacts(id);

    if (artifacts.length === 0) {
      return NextResponse.json({
        projectId: id,
        downloads: [],
        isPlaceholder: true,
        reason: 'no_design_generated',
        message: 'Run KiCad design generation first to create downloadable artifacts',
      });
    }

    const downloads = artifacts.map((a) => ({
      id: a.id,
      name: a.fileName,
      type: a.artifactType,
      sizeBytes: a.fileSize,
      checksum: a.checksum,
      generatedAt: a.createdAt.toISOString(),
      mimeType: a.mimeType,
      filePath: a.filePath,
      storageBucket: a.storageBucket,
      storageKey: a.storageKey,
    }));

    return NextResponse.json({
      projectId: id,
      downloads,
      isPlaceholder: false,
    });
  } catch {
    return NextResponse.json({
      projectId: '',
      downloads: [],
      isPlaceholder: true,
      meta: { mode: 'degraded', reason: 'Database not configured' },
    });
  }
}
