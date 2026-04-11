// ── In-Memory Store Implementations ───────────────────────────────────────────
// Simple map-backed stores for testing, development, and fixture mode.
// Vector search uses brute-force cosine similarity — no external dependencies.

import type { DocumentRecord, ChunkRecord, ChunkMetadata, EmbeddingRecord } from './types.js';
import type { DocumentStore, ChunkStore, VectorStore } from './interfaces.js';

// ── Helpers ───────────────────────────────────────────────────────────────────

function matchesPartial<T extends Record<string, unknown>>(record: T, filter: Partial<T>): boolean {
  return (Object.entries(filter) as [string, unknown][]).every(([key, value]) => {
    if (value === undefined) return true;
    const recordValue = record[key];
    if (recordValue === undefined) return false;
    return recordValue === value;
  });
}

function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0;
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    const ai = a[i]!;
    const bi = b[i]!;
    dot += ai * bi;
    normA += ai * ai;
    normB += bi * bi;
  }
  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  if (denom === 0) return 0;
  return dot / denom;
}

// ── MemoryDocumentStore ──────────────────────────────────────────────────────

export class MemoryDocumentStore implements DocumentStore {
  private readonly docs = new Map<string, DocumentRecord>();

  async store(doc: DocumentRecord): Promise<void> {
    this.docs.set(doc.id, { ...doc });
  }

  async get(id: string): Promise<DocumentRecord | null> {
    const doc = this.docs.get(id);
    return doc ? { ...doc } : null;
  }

  async query(filter: Partial<DocumentRecord>): Promise<DocumentRecord[]> {
    const results: DocumentRecord[] = [];
    for (const doc of this.docs.values()) {
      if (matchesPartial(doc as unknown as Record<string, unknown>, filter)) {
        results.push({ ...doc });
      }
    }
    return results;
  }

  async delete(id: string): Promise<void> {
    this.docs.delete(id);
  }

  /** Clear all stored documents (test utility). */
  clear(): void {
    this.docs.clear();
  }

  /** Number of stored documents. */
  get size(): number {
    return this.docs.size;
  }
}

// ── MemoryChunkStore ──────────────────────────────────────────────────────────

export class MemoryChunkStore implements ChunkStore {
  private readonly chunks = new Map<string, ChunkRecord>();

  async store(chunk: ChunkRecord): Promise<void> {
    this.chunks.set(chunk.id, { ...chunk });
  }

  async get(id: string): Promise<ChunkRecord | null> {
    const chunk = this.chunks.get(id);
    return chunk ? { ...chunk } : null;
  }

  async queryByDocument(documentId: string): Promise<ChunkRecord[]> {
    const results: ChunkRecord[] = [];
    for (const chunk of this.chunks.values()) {
      if (chunk.documentId === documentId) {
        results.push({ ...chunk });
      }
    }
    return results;
  }

  async queryByMpn(mpn: string): Promise<ChunkRecord[]> {
    const results: ChunkRecord[] = [];
    for (const chunk of this.chunks.values()) {
      if (chunk.metadata.mpn === mpn) {
        results.push({ ...chunk });
      }
    }
    return results;
  }

  async queryByFilter(filter: Partial<ChunkMetadata>): Promise<ChunkRecord[]> {
    const results: ChunkRecord[] = [];
    for (const chunk of this.chunks.values()) {
      if (matchesPartial(chunk.metadata as unknown as Record<string, unknown>, filter)) {
        results.push({ ...chunk });
      }
    }
    return results;
  }

  async delete(id: string): Promise<void> {
    this.chunks.delete(id);
  }

  /** Clear all stored chunks (test utility). */
  clear(): void {
    this.chunks.clear();
  }

  /** Number of stored chunks. */
  get size(): number {
    return this.chunks.size;
  }
}

// ── MemoryVectorStore ─────────────────────────────────────────────────────────

export class MemoryVectorStore implements VectorStore {
  private readonly embeddings = new Map<string, EmbeddingRecord>();
  private readonly chunkIndex = new Map<string, string>(); // chunkId → embeddingId

  async storeEmbedding(record: EmbeddingRecord): Promise<void> {
    this.embeddings.set(record.id, { ...record });
    this.chunkIndex.set(record.chunkId, record.id);
  }

  async query(
    vector: number[],
    topK: number,
    filter?: Partial<ChunkMetadata>,
  ): Promise<Array<{ chunkId: string; score: number }>> {
    // NOTE: filter is accepted for interface compatibility but actual filtering
    // against ChunkMetadata requires a ChunkStore cross-reference. In the
    // memory implementation we score all stored vectors and return top-K.
    // Production implementations push the filter into the vector DB query.
    void filter; // used for interface compat; real impls push into DB query

    const scored: Array<{ chunkId: string; score: number }> = [];
    for (const record of this.embeddings.values()) {
      const score = cosineSimilarity(vector, record.vector);
      scored.push({ chunkId: record.chunkId, score });
    }
    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, topK);
  }

  async delete(chunkId: string): Promise<void> {
    const embeddingId = this.chunkIndex.get(chunkId);
    if (embeddingId) {
      this.embeddings.delete(embeddingId);
      this.chunkIndex.delete(chunkId);
    }
  }

  /** Clear all stored embeddings (test utility). */
  clear(): void {
    this.embeddings.clear();
    this.chunkIndex.clear();
  }

  /** Number of stored embeddings. */
  get size(): number {
    return this.embeddings.size;
  }
}
