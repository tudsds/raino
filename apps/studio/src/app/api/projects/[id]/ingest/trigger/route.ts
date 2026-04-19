import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/require-auth';
import { prisma } from '@raino/db';
import { verifyProjectOwnership, updateProjectStatus } from '@/lib/data/project-queries';
import { createAuditEntry } from '@/lib/data/audit-queries';
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

    const manifest = await prisma.ingestionManifest.findUnique({ where: { projectId: id } });
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

    await prisma.ingestionManifest.update({
      where: { projectId: id },
      data: { status: 'running' },
    });

    await updateProjectStatus(id, 'candidates_discovered');

    await createAuditEntry(id, {
      category: 'ingestion',
      action: 'ingestion_triggered',
      actor: auth.user.id,
      details: { mode },
    });

    const candidateFamilies = Array.isArray(manifest.candidateFamilies)
      ? (manifest.candidateFamilies as Array<{
          family: string;
          manufacturer: string;
          mpns: string[];
          documentTypes?: string[];
        }>)
      : [];

    if (candidateFamilies.length === 0) {
      await prisma.ingestionManifest.update({
        where: { projectId: id },
        data: {
          status: 'failed',
          stages: [
            {
              name: 'candidate_discovery',
              status: 'failed',
              errors: ['No candidate families found in manifest'],
            },
          ],
        },
      });
      return NextResponse.json(
        { error: 'No candidate families found in manifest' },
        { status: 400 },
      );
    }

    const result = await runIngestionPipeline({
      projectId: id,
      candidateFamilies,
      mode,
    });

    await createAuditEntry(id, {
      category: 'ingestion',
      action: 'ingestion_completed',
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
        status:
          s.status === 'success' ? 'completed' : s.status === 'failure' ? 'failed' : 'pending',
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
