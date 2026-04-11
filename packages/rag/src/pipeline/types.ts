// ── Pipeline Stage Types ──────────────────────────────────────────────────────
// Defines the stages of the RAG ingestion pipeline and result types for
// tracking progress, auditing, and sufficiency gating.

/** The ordered stages of the RAG ingestion pipeline. */
export type PipelineStage =
  | 'candidate_discovery'
  | 'doc_fetch'
  | 'raw_store'
  | 'normalization'
  | 'chunking'
  | 'metadata_enrichment'
  | 'embedding'
  | 'vector_store'
  | 'sufficiency_gate';

/** Status of an individual pipeline stage execution. */
export type PipelineStageStatus = 'success' | 'failure' | 'skipped';

/** Result from executing a single pipeline stage. */
export interface PipelineResult {
  /** Which stage was executed. */
  stage: PipelineStage;
  /** Outcome of the stage. */
  status: PipelineStageStatus;
  /** Number of items fed into this stage. */
  inputCount: number;
  /** Number of items produced by this stage. */
  outputCount: number;
  /** Error messages collected during execution. */
  errors: string[];
  /** Wall-clock duration in milliseconds. */
  duration: number;
}

/** Configuration for the full ingestion pipeline. */
export interface PipelineConfig {
  /** MPNs or families to target for discovery. */
  targets: string[];
  /** Maximum number of documents to fetch per target. */
  maxDocumentsPerTarget?: number;
  /** Maximum chunks per document before warning. */
  maxChunksPerDocument?: number;
  /** Whether to skip the sufficiency gate. */
  skipSufficiencyGate?: boolean;
  /** Whether to run in fixture/degraded mode. */
  fixtureMode?: boolean;
}

/** Aggregate result from a complete pipeline run. */
export interface PipelineRunResult {
  /** Unique identifier for this pipeline execution. */
  runId: string;
  /** Individual stage results in execution order. */
  stages: PipelineResult[];
  /** Overall pipeline status derived from stage results. */
  overallStatus: PipelineStageStatus;
  /** Total wall-clock duration in milliseconds. */
  totalDuration: number;
  /** Total documents successfully ingested. */
  documentsIngested: number;
  /** Total chunks generated. */
  chunksGenerated: number;
  /** Total embeddings stored. */
  embeddingsStored: number;
}
