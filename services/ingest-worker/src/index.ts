export { BOOTSTRAP_SEED } from './config/seed';

export { discoverCandidates } from './pipeline/candidate-discovery';
export { fetchDocuments } from './pipeline/doc-fetch';
export { storeRawDocuments } from './pipeline/raw-document-store';
export { normalizeDocument } from './pipeline/normalization';
export { chunkDocuments } from './pipeline/chunking';
export { enrichMetadata } from './pipeline/metadata-enrichment';
export { generateEmbeddings } from './pipeline/embedding';
export { storeEmbeddings, getStores, querySimilar } from './pipeline/vector-store';
export { runSufficiencyGate } from './pipeline/sufficiency-gate';
export { bootstrap } from './cli/bootstrap';

export type {
  SeedFamily,
  SeedConfig,
  SourcePreference,
  CandidateSet,
  PipelineStageResult,
  PipelineContext,
  SufficiencyCheckResult,
  SufficiencyReport,
  IngestionManifest,
  FixtureDocument,
} from './pipeline/types';

export {
  writeJson,
  readJson,
  fileExists,
  listFiles,
  writeIngestionManifest,
  writeSufficiencyReport,
  writePipelineSummary,
  readIngestionManifest,
  readSufficiencyReport,
} from './storage/local';
