import { BOOTSTRAP_SEED } from '../config/seed.js';
import { discoverCandidates } from '../pipeline/candidate-discovery.js';
import { fetchDocuments } from '../pipeline/doc-fetch.js';
import { storeRawDocuments } from '../pipeline/raw-document-store.js';
import { normalizeDocument } from '../pipeline/normalization.js';
import { chunkDocuments } from '../pipeline/chunking.js';
import { enrichMetadata } from '../pipeline/metadata-enrichment.js';
import { generateEmbeddings } from '../pipeline/embedding.js';
import { storeEmbeddings } from '../pipeline/vector-store.js';
import { runSufficiencyGate } from '../pipeline/sufficiency-gate.js';
import {
  writeIngestionManifest,
  writeSufficiencyReport,
  writePipelineSummary,
} from '../storage/local.js';
import type {
  PipelineContext,
  PipelineStageResult,
  IngestionManifest,
  SufficiencyReport,
  CandidateSet,
} from '../pipeline/types.js';
import type { DocumentRecord, ChunkRecord, EmbeddingRecord } from '@raino/rag';

function makeRunId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).slice(2, 8);
  return `run_${timestamp}_${random}`;
}

function runStage<T>(
  stageName: string,
  input: T[],
  fn: (input: T[]) => unknown,
): { result: unknown; stageResult: PipelineStageResult } {
  const start = Date.now();
  try {
    const result = fn(input);
    const duration = Date.now() - start;
    const outputCount = Array.isArray(result) ? result.length : 0;
    return {
      result,
      stageResult: {
        stage: stageName,
        status: 'success',
        inputCount: input.length,
        outputCount,
        errors: [],
        duration,
      },
    };
  } catch (err) {
    const duration = Date.now() - start;
    const message = err instanceof Error ? err.message : String(err);
    return {
      result: [],
      stageResult: {
        stage: stageName,
        status: 'failure',
        inputCount: input.length,
        outputCount: 0,
        errors: [message],
        duration,
      },
    };
  }
}

async function runAsyncStage<T>(
  stageName: string,
  input: T[],
  fn: (input: T[]) => Promise<unknown>,
): Promise<{ result: unknown; stageResult: PipelineStageResult }> {
  const start = Date.now();
  try {
    const result = await fn(input);
    const duration = Date.now() - start;
    const outputCount = Array.isArray(result) ? result.length : 0;
    return {
      result,
      stageResult: {
        stage: stageName,
        status: 'success',
        inputCount: input.length,
        outputCount,
        errors: [],
        duration,
      },
    };
  } catch (err) {
    const duration = Date.now() - start;
    const message = err instanceof Error ? err.message : String(err);
    return {
      result: [],
      stageResult: {
        stage: stageName,
        status: 'failure',
        inputCount: input.length,
        outputCount: 0,
        errors: [message],
        duration,
      },
    };
  }
}

export async function bootstrap(): Promise<PipelineContext> {
  const runId = makeRunId();
  const startedAt = Date.now();

  const ctx: PipelineContext = {
    runId,
    seedConfig: BOOTSTRAP_SEED,
    stages: [],
    candidates: [],
    documents: [],
    chunks: [],
    embeddings: [],
    startedAt,
    status: 'running',
  };

  console.log(`[ingest:bootstrap] Run ${runId} starting...`);
  console.log(`[ingest:bootstrap] Seed version: ${BOOTSTRAP_SEED.version}`);
  console.log(`[ingest:bootstrap] Families: ${BOOTSTRAP_SEED.families.length}`);

  // Stage 1: Candidate Discovery
  const s1 = runStage('candidate_discovery', BOOTSTRAP_SEED.families, () =>
    discoverCandidates(BOOTSTRAP_SEED),
  );
  ctx.stages.push(s1.stageResult);
  ctx.candidates = s1.result as CandidateSet[];
  console.log(`[stage:candidate_discovery] ${ctx.candidates.length} candidates discovered`);

  // Stage 2: Document Fetch (fixture mode)
  const s2 = runStage('doc_fetch', ctx.candidates, (candidates) =>
    fetchDocuments(candidates as CandidateSet[], 'fixture', BOOTSTRAP_SEED.sourcePreferences),
  );
  ctx.stages.push(s2.stageResult);
  ctx.documents = s2.result as DocumentRecord[];
  console.log(`[stage:doc_fetch] ${ctx.documents.length} documents fetched (fixture mode)`);

  // Stage 3: Raw Document Store
  const s3 = runStage('raw_store', ctx.documents, (docs) => {
    storeRawDocuments(docs as DocumentRecord[]);
    return docs;
  });
  ctx.stages.push(s3.stageResult);
  console.log(`[stage:raw_store] ${ctx.documents.length} documents stored`);

  // Stage 4: Normalization
  const s4 = runStage('normalization', ctx.documents, (docs) =>
    (docs as DocumentRecord[]).map((d) => normalizeDocument(d)),
  );
  ctx.stages.push(s4.stageResult);
  ctx.documents = s4.result as DocumentRecord[];
  console.log(`[stage:normalization] ${ctx.documents.length} documents normalized`);

  // Stage 5: Chunking
  const s5 = runStage('chunking', ctx.documents, (docs) =>
    chunkDocuments(docs as DocumentRecord[]),
  );
  ctx.stages.push(s5.stageResult);
  ctx.chunks = s5.result as ChunkRecord[];
  console.log(`[stage:chunking] ${ctx.chunks.length} chunks generated`);

  // Stage 6: Metadata Enrichment
  const s6 = runStage('metadata_enrichment', ctx.chunks, (chunks) =>
    enrichMetadata(chunks as ChunkRecord[]),
  );
  ctx.stages.push(s6.stageResult);
  ctx.chunks = s6.result as ChunkRecord[];
  console.log(`[stage:metadata_enrichment] ${ctx.chunks.length} chunks enriched`);

  // Stage 7: Embedding
  const s7 = await runAsyncStage('embedding', ctx.chunks, (chunks) =>
    generateEmbeddings(chunks as ChunkRecord[]),
  );
  ctx.stages.push(s7.stageResult);
  ctx.embeddings = s7.result as EmbeddingRecord[];
  console.log(`[stage:embedding] ${ctx.embeddings.length} embeddings generated`);

  // Stage 8: Vector Store
  const s8 = await runAsyncStage('vector_store', ctx.embeddings, async () => {
    await storeEmbeddings(ctx.embeddings, ctx.chunks);
    return ctx.embeddings;
  });
  ctx.stages.push(s8.stageResult);
  console.log(`[stage:vector_store] ${ctx.embeddings.length} embeddings stored`);

  // Sufficiency Gate
  const sufficiencyReports: SufficiencyReport[] = [];
  for (const candidate of ctx.candidates) {
    const report = runSufficiencyGate(candidate, ctx.documents, [], {}, ctx.runId);
    sufficiencyReports.push(report);
  }

  ctx.completedAt = Date.now();
  const hasFailures = ctx.stages.some((s) => s.status === 'failure');
  ctx.status = hasFailures ? 'failed' : 'completed';

  // Write artifacts
  const manifest: IngestionManifest = {
    runId: ctx.runId,
    seedVersion: BOOTSTRAP_SEED.version,
    mode: 'fixture',
    candidates: ctx.candidates,
    documents: ctx.documents,
    chunks: ctx.chunks,
    embeddings: ctx.embeddings,
    sufficiencyReports,
    stages: ctx.stages,
    startedAt: ctx.startedAt,
    completedAt: ctx.completedAt,
    status: ctx.status,
  };

  writeIngestionManifest(manifest as unknown as Record<string, unknown>);

  for (const report of sufficiencyReports) {
    writeSufficiencyReport(report as unknown as Record<string, unknown>);
  }

  writePipelineSummary({
    runId: ctx.runId,
    seedVersion: BOOTSTRAP_SEED.version,
    mode: 'fixture',
    status: ctx.status,
    totalDuration: ctx.completedAt - ctx.startedAt,
    candidateCount: ctx.candidates.length,
    documentCount: ctx.documents.length,
    chunkCount: ctx.chunks.length,
    embeddingCount: ctx.embeddings.length,
    sufficiencyPassCount: sufficiencyReports.filter((r) => r.overallPass).length,
    sufficiencyFailCount: sufficiencyReports.filter((r) => !r.overallPass).length,
    stages: ctx.stages.map((s) => ({
      stage: s.stage,
      status: s.status,
      inputCount: s.inputCount,
      outputCount: s.outputCount,
      duration: s.duration,
    })),
  });

  // Console summary
  console.log('');
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`  Ingestion Complete — Run ${ctx.runId}`);
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`  Status:      ${ctx.status}`);
  console.log(`  Duration:    ${ctx.completedAt - ctx.startedAt} ms`);
  console.log(`  Candidates:  ${ctx.candidates.length}`);
  console.log(`  Documents:   ${ctx.documents.length}`);
  console.log(`  Chunks:      ${ctx.chunks.length}`);
  console.log(`  Embeddings:  ${ctx.embeddings.length}`);
  console.log(
    `  Sufficiency: ${sufficiencyReports.filter((r) => r.overallPass).length}/${sufficiencyReports.length} passed`,
  );
  console.log('───────────────────────────────────────────────────────────');

  for (const report of sufficiencyReports) {
    const status = report.overallPass ? '✓ PASS' : '✗ FAIL';
    console.log(`  ${status} ${report.candidateId} (${report.gaps.length} gaps)`);
  }

  console.log('═══════════════════════════════════════════════════════════');
  console.log(`  Artifacts written to data/ingestion/`);
  console.log('═══════════════════════════════════════════════════════════');

  return ctx;
}

bootstrap().catch((err) => {
  console.error('[ingest:bootstrap] Fatal error:', err);
  process.exit(1);
});
