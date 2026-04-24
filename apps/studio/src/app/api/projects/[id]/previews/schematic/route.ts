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

    const artifacts = await getArtifacts(id, 'schematic');

    if (artifacts.length === 0) {
      return NextResponse.json({
        projectId: id,
        type: 'schematic',
        format: 'svg',
        isPlaceholder: true,
        available: false,
        reason: 'no_design_generated',
        message: 'Run KiCad design generation first to create preview assets',
        artifactPersistence: 'not_persisted_to_cloud' as const,
        artifactNote:
          'Design artifacts are generated on the local filesystem and not yet persisted to cloud storage. File paths reference local disk locations only.',
      });
    }

    const latest = artifacts[0]!;
    return NextResponse.json({
      projectId: id,
      type: 'schematic',
      format: latest.mime_type.includes('svg') ? 'svg' : 'pdf',
      isPlaceholder: false,
      available: true,
      artifactId: latest.id,
      fileName: latest.file_name,
      filePath: latest.file_path,
      fileSize: latest.file_size,
      mimeType: latest.mime_type,
      checksum: latest.checksum,
      createdAt: latest.created_at,
      artifactPersistence: 'not_persisted_to_cloud' as const,
      artifactNote:
        'Design artifacts are generated on the local filesystem and not yet persisted to cloud storage. File paths reference local disk locations only.',
    });
  } catch {
    return NextResponse.json({
      projectId: '',
      type: 'schematic',
      format: 'svg',
      available: false,
      isPlaceholder: true,
      meta: { mode: 'degraded', reason: 'Database not configured' },
      artifactPersistence: 'not_persisted_to_cloud' as const,
      artifactNote:
        'Design artifacts are generated on the local filesystem and not yet persisted to cloud storage. File paths reference local disk locations only.',
    });
  }
}
