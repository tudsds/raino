// ── Pipeline Types ─────────────────────────────────────────────────────────────
// Core types for the ingest-worker pipeline: seed configuration, candidate sets,
// pipeline context, stage results, and sufficiency gate outputs.

import type {
  DocumentRecord,
  ChunkRecord,
  EmbeddingRecord,
  SourceType,
  TrustLevel,
} from '@raino/rag';

// ── Seed Configuration ─────────────────────────────────────────────────────────

/** A single part family in the bootstrap seed. */
export interface SeedFamily {
  family: string;
  manufacturer: string;
  mpns: string[];
  requiredDocTypes: Array<'datasheet' | 'errata' | 'app_note' | 'ref_design' | 'package_doc'>;
  expectsErrata: boolean;
  requiresPackageDocs: boolean;
  requiresAlternates: boolean;
  retrievalLabels: string[];
}

/** Source domain trust preference. */
export interface SourcePreference {
  domain: string;
  trustLevel: TrustLevel;
}

/** Top-level seed configuration driving the ingestion pipeline. */
export interface SeedConfig {
  version: string;
  description: string;
  families: SeedFamily[];
  sourcePreferences: SourcePreference[];
}

// ── Candidate Set ──────────────────────────────────────────────────────────────

/** A single candidate discovered from the seed, with required document types. */
export interface CandidateSet {
  candidateId: string;
  family: string;
  manufacturer: string;
  mpn: string;
  requiredDocTypes: SourceType[];
  expectsErrata: boolean;
  requiresPackageDocs: boolean;
  requiresAlternates: boolean;
  retrievalLabels: string[];
}

// ── Pipeline Execution ─────────────────────────────────────────────────────────

/** Result from a single pipeline stage. */
export interface PipelineStageResult {
  stage: string;
  status: 'success' | 'failure' | 'skipped';
  inputCount: number;
  outputCount: number;
  errors: string[];
  duration: number;
}

/** Mutable context carried through the entire pipeline run. */
export interface PipelineContext {
  runId: string;
  seedConfig: SeedConfig;
  stages: PipelineStageResult[];
  candidates: CandidateSet[];
  documents: DocumentRecord[];
  chunks: ChunkRecord[];
  embeddings: EmbeddingRecord[];
  startedAt: number;
  completedAt?: number;
  status: 'running' | 'completed' | 'failed';
}

// ── Sufficiency Gate ───────────────────────────────────────────────────────────

/** A single check within a sufficiency report. */
export interface SufficiencyCheckResult {
  category: string;
  check: string;
  passed: boolean;
  details: string;
  requiredAction?: string;
}

/** Full sufficiency report for a candidate. */
export interface SufficiencyReport {
  runId: string;
  candidateId: string;
  checks: SufficiencyCheckResult[];
  overallPass: boolean;
  gaps: string[];
  generatedAt: number;
}

// ── Ingestion Manifest ─────────────────────────────────────────────────────────

/** Artifact produced at the end of a pipeline run. */
export interface IngestionManifest {
  runId: string;
  seedVersion: string;
  mode: 'fixture' | 'live' | 'degraded';
  candidates: CandidateSet[];
  documents: DocumentRecord[];
  chunks: ChunkRecord[];
  embeddings: EmbeddingRecord[];
  sufficiencyReports: SufficiencyReport[];
  stages: PipelineStageResult[];
  startedAt: number;
  completedAt: number;
  status: 'completed' | 'failed' | 'partial';
}

// ── Fixture Mode ───────────────────────────────────────────────────────────────

/** A fixture document embedded for testing without live API calls. */
export interface FixtureDocument {
  family: string;
  manufacturer: string;
  mpn: string;
  sourceType: SourceType;
  trustLevel: TrustLevel;
  content: string;
  revision?: string;
}
