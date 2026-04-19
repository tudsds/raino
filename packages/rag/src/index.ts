// ── @raino/rag — Barrel Exports ───────────────────────────────────────────────

// Storage types
export type {
  SourceType,
  TrustLevel,
  ChunkType,
  DocumentRecord,
  ChunkMetadata,
  ChunkRecord,
  EmbeddingRecord,
  RetrievalResult,
} from './storage/types.js';

// Storage interfaces
export type { DocumentStore, ChunkStore, VectorStore } from './storage/interfaces.js';

// Memory store implementations
export {
  MemoryDocumentStore,
  MemoryChunkStore,
  MemoryVectorStore,
} from './storage/memory-store.js';

// Supabase store implementations
export { SupabaseDocumentStore } from './storage/supabase-document-store.js';
export { SupabaseChunkStore } from './storage/supabase-chunk-store.js';
export { SupabaseVectorStore } from './storage/supabase-vector-store.js';

// Store factory
export { createStoreFactory, createStores } from './storage/factory.js';
export type { StoreFactory, StoreSet } from './storage/factory.js';

// Chunking engine
export { chunkDocument } from './chunking/engine.js';
export type { ChunkingOptions } from './chunking/engine.js';

// Section detection
export { detectSections } from './chunking/section-detector.js';
export type { SectionBoundary } from './chunking/section-detector.js';

// Embedding contracts
export type { EmbeddingGenerator } from './embeddings/contracts.js';

// Mock embedding generator
export { MockEmbeddingGenerator } from './embeddings/mock-generator.js';

// OpenAI embedding generator
export { OpenAIEmbeddingGenerator } from './embeddings/openai-generator.js';
export type { OpenAIEmbeddingConfig } from './embeddings/openai-generator.js';

// Embedding factory
export {
  createEmbeddingGenerator,
  getEmbeddingGenerator,
  resetEmbeddingGenerator,
} from './embeddings/factory.js';
export type { EmbeddingFactoryConfig } from './embeddings/factory.js';

// Retrieval engine
export { RetrievalEngine } from './retrieval/engine.js';
export type { RetrievalOptions, RetrievalDeps } from './retrieval/engine.js';

// Pipeline types
export type {
  PipelineStage,
  PipelineStageStatus,
  PipelineResult,
  PipelineConfig,
  PipelineRunResult,
} from './pipeline/types.js';
