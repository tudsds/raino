// ── Storage Interfaces ────────────────────────────────────────────────────────
// Contracts that every storage backend must satisfy. Production implementations
// wrap real databases; in-memory versions exist for tests and fixture mode.

import type { DocumentRecord, ChunkRecord, ChunkMetadata, EmbeddingRecord } from './types';

/** CRUD operations for engineering documents. */
export interface DocumentStore {
  store(doc: DocumentRecord): Promise<void>;
  get(id: string): Promise<DocumentRecord | null>;
  query(filter: Partial<DocumentRecord>): Promise<DocumentRecord[]>;
  delete(id: string): Promise<void>;
}

/** CRUD + lookup operations for document chunks. */
export interface ChunkStore {
  store(chunk: ChunkRecord): Promise<void>;
  get(id: string): Promise<ChunkRecord | null>;
  queryByDocument(documentId: string): Promise<ChunkRecord[]>;
  queryByMpn(mpn: string): Promise<ChunkRecord[]>;
  queryByFilter(filter: Partial<ChunkMetadata>): Promise<ChunkRecord[]>;
  delete(id: string): Promise<void>;
}

/** Vector similarity operations for embedding search. */
export interface VectorStore {
  storeEmbedding(record: EmbeddingRecord): Promise<void>;
  query(
    vector: number[],
    topK: number,
    filter?: Partial<ChunkMetadata>,
  ): Promise<Array<{ chunkId: string; score: number }>>;
  delete(chunkId: string): Promise<void>;
}
