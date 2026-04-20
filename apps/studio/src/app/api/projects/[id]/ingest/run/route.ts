import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/require-auth';
import { getSupabaseAdmin } from '@/lib/db/supabase-admin';
import { createAuditEntry } from '@/lib/data/audit-queries';
import { verifyProjectOwnership, updateProjectStatus } from '@/lib/data/project-queries';
import { runIngestionPipeline } from '@/lib/data/ingestion-pipeline';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;

  try {
    const { id } = await params;
    const ownership = await verifyProjectOwnership(id, auth.user.id);
    if (!ownership.authorized) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const body = await request.json().catch(() => ({}));
    const mode = body.mode ?? 'fixture';

    const db = getSupabaseAdmin();
    const { data: manifest, error: manifestError } = await db
      .from('ingestion_manifests')
      .select('*')
      .eq('project_id', id)
      .maybeSingle();

    if (manifestError) throw manifestError;

    if (!manifest) {
      return NextResponse.json(
        { error: 'No ingestion manifest found. Submit candidates first.' },
        { status: 400 },
      );
    }

    if (manifest.status === 'running') {
      return NextResponse.json(
        { error: 'Ingestion is already running for this project' },
        { status: 409 },
      );
    }

    await db
      .from('ingestion_manifests')
      .update({ status: 'running', updated_at: new Date().toISOString() })
      .eq('project_id', id);

    await updateProjectStatus(id, 'candidates_discovered');
    await createAuditEntry(id, {
      category: 'ingestion',
      action: 'ingestion_run_started',
      actor: auth.user.id,
      details: { mode },
    });

    const candidateFamilies = Array.isArray(manifest.candidate_families)
      ? (manifest.candidate_families as Array<{
          family: string;
          manufacturer: string;
          mpns: string[];
          documentTypes?: string[];
        }>)
      : [];

    if (candidateFamilies.length === 0) {
      await db
        .from('ingestion_manifests')
        .update({
          status: 'failed',
          stages: [{ name: 'candidate_discovery', status: 'failed', errors: ['No candidate families found in manifest'] }],
          updated_at: new Date().toISOString(),
        })
        .eq('project_id', id);

      return NextResponse.json(
        { error: 'No candidate families found in manifest' },
        { status: 400 },
      );
    }

    const result = await runIngestionPipeline({ projectId: id, candidateFamilies, mode });

    await createAuditEntry(id, {
      category: 'ingestion',
      action: 'ingestion_run_completed',
      actor: 'system',
      details: {
        runId: result.runId,
        status: result.status,
        candidateCount: result.candidates,
        documentCount: result.documents,
        chunkCount: result.chunks,
        embeddingCount: result.embeddings,
        duration: result.duration,
      },
    });

    return NextResponse.json({
      projectId: id,
      runId: result.runId,
      status: result.status,
      progress: 100,
      stages: result.stages.map((s) => ({
        name: s.stage,
        status: s.status === 'success' ? 'completed' : s.status === 'failure' ? 'failed' : 'pending',
        inputCount: s.inputCount,
        outputCount: s.outputCount,
        errors: s.errors,
        duration: s.duration,
      })),
      summary: {
        candidates: result.candidates,
        documents: result.documents,
        chunks: result.chunks,
        embeddings: result.embeddings,
        sufficiencyPassCount: result.sufficiencyPassCount,
        sufficiencyFailCount: result.sufficiencyFailCount,
        duration: result.duration,
      },
    });
  } catch (err) {
    const error = err instanceof Error ? err.message : 'Ingestion pipeline failed';
    return NextResponse.json({ error }, { status: 500 });
  }
}
