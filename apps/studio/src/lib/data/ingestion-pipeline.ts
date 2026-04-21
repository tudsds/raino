import { getSupabaseAdmin, type Json } from '@/lib/db/supabase-admin';
import type { DocumentRecord, ChunkRecord, EmbeddingRecord } from '@raino/rag';
import {
  discoverCandidates,
  fetchDocuments,
  storeRawDocuments,
  normalizeDocument,
  chunkDocuments,
  enrichMetadata,
  generateEmbeddings,
  storeEmbeddings,
  runSufficiencyGate,
} from '@raino/ingest-worker';
import type {
  SeedConfig,
  CandidateSet,
  PipelineStageResult,
  SufficiencyReport,
} from '@raino/ingest-worker';

// ── Types ──────────────────────────────────────────────────────────────────────

export interface PipelineRunOptions {
  projectId: string;
  candidateFamilies: Array<{
    family: string;
    manufacturer: string;
    mpns: string[];
    documentTypes?: string[];
  }>;
  mode?: 'fixture' | 'live' | 'degraded';
}

export interface PipelineRunResult {
  runId: string;
  status: 'completed' | 'failed';
  stages: PipelineStageResult[];
  candidates: number;
  documents: number;
  chunks: number;
  embeddings: number;
  sufficiencyPassCount: number;
  sufficiencyFailCount: number;
  duration: number;
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function makeRunId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).slice(2, 8);
  return `run_${timestamp}_${random}`;
}

function buildSeedConfig(candidateFamilies: PipelineRunOptions['candidateFamilies']): SeedConfig {
  return {
    version: '0.1.0',
    description: 'Project-specific seed for ingestion pipeline',
    families: candidateFamilies.map((cf) => ({
      family: cf.family,
      manufacturer: cf.manufacturer,
      mpns: cf.mpns,
      requiredDocTypes: (cf.documentTypes ?? ['datasheet']).map((dt) => {
        switch (dt) {
          case 'application_note':
            return 'app_note' as const;
          case 'reference_design':
            return 'ref_design' as const;
          case 'package_documentation':
            return 'package_doc' as const;
          default:
            return dt as 'datasheet' | 'errata' | 'app_note' | 'ref_design' | 'package_doc';
        }
      }),
      expectsErrata: false,
      requiresPackageDocs: false,
      requiresAlternates: true,
      retrievalLabels: [cf.family, cf.manufacturer],
    })),
    sourcePreferences: [
      { domain: 'st.com', trustLevel: 'canonical' },
      { domain: 'espressif.com', trustLevel: 'canonical' },
      { domain: 'ti.com', trustLevel: 'canonical' },
      { domain: 'nxp.com', trustLevel: 'canonical' },
      { domain: 'abracon.com', trustLevel: 'canonical' },
    ],
  };
}

function toManifestStage(s: PipelineStageResult) {
  return {
    name: s.stage,
    status: s.status === 'success' ? 'completed' : s.status === 'failure' ? 'failed' : 'pending',
    inputCount: s.inputCount,
    outputCount: s.outputCount,
    errors: s.errors,
    duration: s.duration,
  };
}

async function updateManifestStages(projectId: string, stages: PipelineStageResult[]) {
  const db = getSupabaseAdmin();
  await db
    .from('ingestion_manifests')
    .update({
      stages: stages.map(toManifestStage),
      status: stages.some((s) => s.status === 'failure') ? 'failed' : 'running',
      updated_at: new Date().toISOString(),
    })
    .eq('project_id', projectId);
}

// ── Pipeline Runner ────────────────────────────────────────────────────────────

export async function runIngestionPipeline(
  options: PipelineRunOptions,
): Promise<PipelineRunResult> {
  const runId = makeRunId();
  const startedAt = Date.now();
  const mode = options.mode ?? 'fixture';

  const seed = buildSeedConfig(options.candidateFamilies);

  let candidates: CandidateSet[] = [];
  let documents: DocumentRecord[] = [];
  let chunks: ChunkRecord[] = [];
  let embeddings: EmbeddingRecord[] = [];
  const stages: PipelineStageResult[] = [];

  // Stage 1: Candidate Discovery
  {
    const start = Date.now();
    try {
      candidates = discoverCandidates(seed);
      stages.push({
        stage: 'candidate_discovery',
        status: 'success',
        inputCount: seed.families.length,
        outputCount: candidates.length,
        errors: [],
        duration: Date.now() - start,
      });
    } catch (err) {
      stages.push({
        stage: 'candidate_discovery',
        status: 'failure',
        inputCount: seed.families.length,
        outputCount: 0,
        errors: [err instanceof Error ? err.message : String(err)],
        duration: Date.now() - start,
      });
    }
    await updateManifestStages(options.projectId, stages);
  }

  // Stage 2: Document Fetch
  if (candidates.length > 0) {
    const start = Date.now();
    try {
      documents = fetchDocuments(candidates, mode, seed.sourcePreferences);
      stages.push({
        stage: 'doc_fetch',
        status: 'success',
        inputCount: candidates.length,
        outputCount: documents.length,
        errors: [],
        duration: Date.now() - start,
      });
    } catch (err) {
      stages.push({
        stage: 'doc_fetch',
        status: 'failure',
        inputCount: candidates.length,
        outputCount: 0,
        errors: [err instanceof Error ? err.message : String(err)],
        duration: Date.now() - start,
      });
    }
    await updateManifestStages(options.projectId, stages);
  }

  // Stage 3: Raw Document Store
  if (documents.length > 0) {
    const start = Date.now();
    try {
      storeRawDocuments(documents);
      stages.push({
        stage: 'raw_store',
        status: 'success',
        inputCount: documents.length,
        outputCount: documents.length,
        errors: [],
        duration: Date.now() - start,
      });
    } catch (err) {
      stages.push({
        stage: 'raw_store',
        status: 'failure',
        inputCount: documents.length,
        outputCount: 0,
        errors: [err instanceof Error ? err.message : String(err)],
        duration: Date.now() - start,
      });
    }
    await updateManifestStages(options.projectId, stages);
  }

  // Stage 4: Normalization
  if (documents.length > 0) {
    const start = Date.now();
    try {
      documents = documents.map((d) => normalizeDocument(d));
      stages.push({
        stage: 'normalization',
        status: 'success',
        inputCount: documents.length,
        outputCount: documents.length,
        errors: [],
        duration: Date.now() - start,
      });
    } catch (err) {
      stages.push({
        stage: 'normalization',
        status: 'failure',
        inputCount: documents.length,
        outputCount: 0,
        errors: [err instanceof Error ? err.message : String(err)],
        duration: Date.now() - start,
      });
    }
    await updateManifestStages(options.projectId, stages);
  }

  // Stage 5: Chunking
  if (documents.length > 0) {
    const start = Date.now();
    try {
      chunks = chunkDocuments(documents);
      stages.push({
        stage: 'chunking',
        status: 'success',
        inputCount: documents.length,
        outputCount: chunks.length,
        errors: [],
        duration: Date.now() - start,
      });
    } catch (err) {
      stages.push({
        stage: 'chunking',
        status: 'failure',
        inputCount: documents.length,
        outputCount: 0,
        errors: [err instanceof Error ? err.message : String(err)],
        duration: Date.now() - start,
      });
    }
    await updateManifestStages(options.projectId, stages);
  }

  // Stage 6: Metadata Enrichment
  if (chunks.length > 0) {
    const start = Date.now();
    try {
      chunks = enrichMetadata(chunks);
      stages.push({
        stage: 'metadata_enrichment',
        status: 'success',
        inputCount: chunks.length,
        outputCount: chunks.length,
        errors: [],
        duration: Date.now() - start,
      });
    } catch (err) {
      stages.push({
        stage: 'metadata_enrichment',
        status: 'failure',
        inputCount: chunks.length,
        outputCount: 0,
        errors: [err instanceof Error ? err.message : String(err)],
        duration: Date.now() - start,
      });
    }
    await updateManifestStages(options.projectId, stages);
  }

  // Stage 7: Embedding (uses getEmbeddingGenerator() internally)
  if (chunks.length > 0) {
    const start = Date.now();
    try {
      embeddings = await generateEmbeddings(chunks);
      stages.push({
        stage: 'embedding',
        status: 'success',
        inputCount: chunks.length,
        outputCount: embeddings.length,
        errors: [],
        duration: Date.now() - start,
      });
    } catch (err) {
      stages.push({
        stage: 'embedding',
        status: 'failure',
        inputCount: chunks.length,
        outputCount: 0,
        errors: [err instanceof Error ? err.message : String(err)],
        duration: Date.now() - start,
      });
    }
    await updateManifestStages(options.projectId, stages);
  }

  // Stage 8: Vector Store
  if (embeddings.length > 0) {
    const start = Date.now();
    try {
      await storeEmbeddings(embeddings, chunks);
      stages.push({
        stage: 'vector_store',
        status: 'success',
        inputCount: embeddings.length,
        outputCount: embeddings.length,
        errors: [],
        duration: Date.now() - start,
      });
    } catch (err) {
      stages.push({
        stage: 'vector_store',
        status: 'failure',
        inputCount: embeddings.length,
        outputCount: 0,
        errors: [err instanceof Error ? err.message : String(err)],
        duration: Date.now() - start,
      });
    }
    await updateManifestStages(options.projectId, stages);
  }

  // Sufficiency Gate
  const sufficiencyReports: SufficiencyReport[] = [];
  {
    const start = Date.now();
    try {
      for (const candidate of candidates) {
        const report = runSufficiencyGate(candidate, documents, [], {}, runId);
        sufficiencyReports.push(report);
      }
      stages.push({
        stage: 'sufficiency_gate',
        status: 'success',
        inputCount: candidates.length,
        outputCount: sufficiencyReports.length,
        errors: [],
        duration: Date.now() - start,
      });
    } catch (err) {
      stages.push({
        stage: 'sufficiency_gate',
        status: 'failure',
        inputCount: candidates.length,
        outputCount: 0,
        errors: [err instanceof Error ? err.message : String(err)],
        duration: Date.now() - start,
      });
    }
    await updateManifestStages(options.projectId, stages);
  }

  const hasFailures = stages.some((s) => s.status === 'failure');
  const finalStatus = hasFailures ? 'failed' : 'completed';

  const db = getSupabaseAdmin();
  await db
    .from('ingestion_manifests')
    .update({
      status: finalStatus,
      sufficiency_report: {
        runId,
        overallPass: sufficiencyReports.every((r) => r.overallPass),
        reports: sufficiencyReports,
        candidateCount: candidates.length,
        documentCount: documents.length,
        chunkCount: chunks.length,
        embeddingCount: embeddings.length,
        duration: Date.now() - startedAt,
      } as unknown as Json,
      updated_at: new Date().toISOString(),
    })
    .eq('project_id', options.projectId);

  return {
    runId,
    status: finalStatus,
    stages,
    candidates: candidates.length,
    documents: documents.length,
    chunks: chunks.length,
    embeddings: embeddings.length,
    sufficiencyPassCount: sufficiencyReports.filter((r) => r.overallPass).length,
    sufficiencyFailCount: sufficiencyReports.filter((r) => !r.overallPass).length,
    duration: Date.now() - startedAt,
  };
}
