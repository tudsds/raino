export { BOOTSTRAP_SEED } from './config/seed.js';

export { discoverCandidates } from './pipeline/candidate-discovery.js';
export { fetchDocuments } from './pipeline/doc-fetch.js';
export { storeRawDocuments } from './pipeline/raw-document-store.js';
export { normalizeDocument } from './pipeline/normalization.js';
export { chunkDocuments } from './pipeline/chunking.js';
export { enrichMetadata } from './pipeline/metadata-enrichment.js';
export { generateEmbeddings } from './pipeline/embedding.js';
export { storeEmbeddings, getStores, querySimilar } from './pipeline/vector-store.js';
export { runSufficiencyGate } from './pipeline/sufficiency-gate.js';
export { bootstrap } from './cli/bootstrap.js';

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
} from './pipeline/types.js';

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
} from './storage/local.js';
