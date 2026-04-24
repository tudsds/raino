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
} from './storage/types';

// Storage interfaces
export type { DocumentStore, ChunkStore, VectorStore } from './storage/interfaces';

// Memory store implementations
export { MemoryDocumentStore, MemoryChunkStore, MemoryVectorStore } from './storage/memory-store';

// Supabase store implementations
export { SupabaseDocumentStore } from './storage/supabase-document-store';
export { SupabaseChunkStore } from './storage/supabase-chunk-store';
export { SupabaseVectorStore } from './storage/supabase-vector-store';

// Store factory
export { createStoreFactory, createStores } from './storage/factory';
export type { StoreFactory, StoreSet } from './storage/factory';

// Chunking engine
export { chunkDocument } from './chunking/engine';
export type { ChunkingOptions } from './chunking/engine';

// Section detection
export { detectSections } from './chunking/section-detector';
export type { SectionBoundary } from './chunking/section-detector';

// Embedding contracts
export type { EmbeddingGenerator } from './embeddings/contracts';

// Mock embedding generator
export { MockEmbeddingGenerator } from './embeddings/mock-generator';

// OpenAI embedding generator
export { OpenAIEmbeddingGenerator } from './embeddings/openai-generator';
export type { OpenAIEmbeddingConfig } from './embeddings/openai-generator';

// Voyage AI embedding generator
export { VoyageEmbeddingGenerator } from './embeddings/voyage-generator';
export type { VoyageEmbeddingConfig } from './embeddings/voyage-generator';

// Embedding factory
export {
  createEmbeddingGenerator,
  getEmbeddingGenerator,
  resetEmbeddingGenerator,
} from './embeddings/factory';
export type { EmbeddingFactoryConfig } from './embeddings/factory';

// Retrieval engine
export { RetrievalEngine } from './retrieval/engine';
export type { RetrievalOptions, RetrievalDeps } from './retrieval/engine';

// Pipeline types
export type {
  PipelineStage,
  PipelineStageStatus,
  PipelineResult,
  PipelineConfig,
  PipelineRunResult,
} from './pipeline/types';
