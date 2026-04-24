import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/require-auth';
import { verifyProjectOwnership } from '@/lib/data/project-queries';
import { getArtifacts } from '@/lib/data/artifact-queries';

const SIGNED_URL_EXPIRY_SECONDS = 3600;

function createStorageClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

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
        artifactPersistence: 'not_persisted_to_cloud' as const,
        warning:
          'Artifacts are generated on the local filesystem during design worker execution and are not yet persisted to Supabase Storage. Download links reference local paths only.',
      });
    }

    // Use snake_case field names from DbDesignArtifact (Supabase direct)
    const hasPersistedArtifacts = artifacts.some((a) => a.storage_bucket && a.storage_key);
    const storageClient = hasPersistedArtifacts ? createStorageClient() : null;

    const downloads = await Promise.all(
      artifacts.map(async (a) => {
        const base = {
          id: a.id,
          name: a.file_name,
          type: a.artifact_type,
          sizeBytes: a.file_size,
          checksum: a.checksum,
          generatedAt: a.created_at,
          mimeType: a.mime_type,
          filePath: a.file_path,
          storageBucket: a.storage_bucket,
          storageKey: a.storage_key,
        };

        if (!a.storage_bucket || !a.storage_key || !storageClient) {
          return { ...base, downloadUrl: null, persisted: false as const };
        }

        const { data, error } = await storageClient.storage
          .from(a.storage_bucket)
          .createSignedUrl(a.storage_key, SIGNED_URL_EXPIRY_SECONDS);

        if (error || !data?.signedUrl) {
          return { ...base, downloadUrl: null, persisted: false as const };
        }

        return { ...base, downloadUrl: data.signedUrl, persisted: true as const };
      }),
    );

    const allPersisted = downloads.every((d) => d.persisted);
    const somePersisted = downloads.some((d) => d.persisted);

    const artifactPersistence = allPersisted
      ? ('persisted_to_cloud' as const)
      : somePersisted
        ? ('partially_persisted' as const)
        : ('not_persisted_to_cloud' as const);

    return NextResponse.json({
      projectId: id,
      downloads,
      isPlaceholder: false,
      artifactPersistence,
      ...(artifactPersistence === 'not_persisted_to_cloud'
        ? {
            warning:
              'Artifacts are generated on the local filesystem during design worker execution and are not yet persisted to Supabase Storage. Download links reference local paths only.',
          }
        : {}),
      ...(artifactPersistence === 'partially_persisted'
        ? {
            warning:
              'Some artifacts failed to persist to Supabase Storage. Only successfully uploaded files have download URLs.',
          }
        : {}),
    });
  } catch {
    return NextResponse.json({
      projectId: '',
      downloads: [],
      isPlaceholder: true,
      meta: { mode: 'degraded', reason: 'Database not configured' },
      artifactPersistence: 'not_persisted_to_cloud' as const,
      warning:
        'Artifacts are generated on the local filesystem during design worker execution and are not yet persisted to Supabase Storage. Download links reference local paths only.',
    });
  }
}
