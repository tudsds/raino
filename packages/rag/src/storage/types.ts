// ── Storage Types ─────────────────────────────────────────────────────────────
// Core data types for the RAG storage layer: documents, chunks, embeddings,
// and retrieval results with full provenance tracking.

/** Supported document source categories. */
export type SourceType =
  | 'datasheet'
  | 'errata'
  | 'app_note'
  | 'ref_design'
  | 'package_doc'
  | 'programming_manual'
  | 'selection_guide'
  | 'internal_note';

/** Trust classification for a document source. */
export type TrustLevel = 'canonical' | 'secondary';

/** Semantic categories for engineering document chunks. */
export type ChunkType =
  | 'absolute_max_ratings'
  | 'recommended_operating_conditions'
  | 'power_requirements'
  | 'pin_description'
  | 'boot_configuration'
  | 'clock_tree'
  | 'reset_guidelines'
  | 'usb_guidelines'
  | 'adc_considerations'
  | 'recommended_pcb_layout'
  | 'package_outline'
  | 'errata_item'
  | 'reference_circuit'
  | 'general';

/** A fetched and stored engineering document. */
export interface DocumentRecord {
  id: string;
  sourceUrl: string;
  sourceType: SourceType;
  manufacturer: string;
  partFamily?: string;
  mpn?: string;
  revision?: string;
  fetchTimestamp: number;
  checksum?: string;
  trustLevel: TrustLevel;
  normalizedText?: string;
  metadata: Record<string, unknown>;
}

/** Metadata attached to every chunk, inherited from the parent document. */
export interface ChunkMetadata {
  manufacturer: string;
  partFamily?: string;
  mpn?: string;
  package?: string;
  documentType: SourceType;
  revision?: string;
  sourceUrl: string;
  fetchTimestamp: number;
  trustLevel: TrustLevel;
  applicableInterfaces?: string[];
  voltageDomain?: string;
}

/** A semantically-bounded section of a document. */
export interface ChunkRecord {
  id: string;
  documentId: string;
  content: string;
  chunkType: ChunkType;
  metadata: ChunkMetadata;
  embedding?: number[];
}

/** A stored embedding vector with model provenance. */
export interface EmbeddingRecord {
  id: string;
  chunkId: string;
  model: string;
  dimensions: number;
  vector: number[];
  generatedAt: number;
}

/** A retrieval hit combining a chunk with its score and full provenance. */
export interface RetrievalResult {
  chunk: ChunkRecord;
  score: number;
  provenance: {
    documentId: string;
    sourceUrl: string;
    documentType: SourceType;
    manufacturer: string;
    mpn?: string;
    trustLevel: TrustLevel;
  };
}
