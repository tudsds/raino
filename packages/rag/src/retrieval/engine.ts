// ── Retrieval Engine ──────────────────────────────────────────────────────────
// Combines embedding generation, vector search, and provenance lookup into a
// single retrieval pipeline. Returns scored results with full document lineage.

import type { ChunkRecord, ChunkMetadata, RetrievalResult } from '../storage/types.js';
import type { ChunkStore, VectorStore } from '../storage/interfaces.js';
import type { EmbeddingGenerator } from '../embeddings/contracts.js';

/** Options controlling retrieval behavior. */
export interface RetrievalOptions {
  /** Maximum number of results to return. Defaults to 10. */
  topK?: number;
  /** Optional filter to narrow results by chunk metadata. */
  filter?: Partial<ChunkMetadata>;
  /** Minimum similarity score threshold (0-1). Results below this are excluded. */
  minScore?: number;
}

const DEFAULT_TOP_K = 10;
const DEFAULT_MIN_SCORE = 0.0;

/**
 * Dependencies required by the retrieval engine.
 * Injected via constructor to allow different backends in test vs production.
 */
export interface RetrievalDeps {
  embeddingGenerator: EmbeddingGenerator;
  chunkStore: ChunkStore;
  vectorStore: VectorStore;
}

/**
 * Search engine that combines embedding generation, vector similarity search,
 * and chunk provenance lookup into a single retrieval operation.
 *
 * Design: Dependencies are injected through the constructor, making it easy
 * to swap in-memory stores for tests or real vector DBs in production.
 */
export class RetrievalEngine {
  constructor(private readonly deps: RetrievalDeps) {}

  /**
   * Retrieve chunks relevant to a natural-language query.
   *
   * Pipeline:
   * 1. Generate embedding for the query text.
   * 2. Search the vector store for top-K similar embeddings.
   * 3. Fetch the corresponding chunks from the chunk store.
   * 4. Attach full provenance from chunk metadata.
   * 5. Filter out results below minScore.
   *
   * @param query - Natural language search query.
   * @param options - Retrieval configuration.
   * @returns Scored results sorted by descending similarity.
   */
  async retrieve(query: string, options?: RetrievalOptions): Promise<RetrievalResult[]> {
    const topK = options?.topK ?? DEFAULT_TOP_K;
    const minScore = options?.minScore ?? DEFAULT_MIN_SCORE;
    const filter = options?.filter;

    // Step 1: Embed the query
    const queryVector = await this.deps.embeddingGenerator.generate(query);

    // Step 2: Vector search
    const hits = await this.deps.vectorStore.query(queryVector, topK, filter);

    // Step 3-4: Fetch chunks and build provenance
    const results: RetrievalResult[] = [];

    for (const hit of hits) {
      if (hit.score < minScore) continue;

      const chunk: ChunkRecord | null = await this.deps.chunkStore.get(hit.chunkId);
      if (chunk === null) continue;

      // Apply metadata filter if provided
      if (filter && !matchesChunkFilter(chunk.metadata, filter)) {
        continue;
      }

      results.push({
        chunk,
        score: hit.score,
        provenance: {
          documentId: chunk.documentId,
          sourceUrl: chunk.metadata.sourceUrl,
          documentType: chunk.metadata.documentType,
          manufacturer: chunk.metadata.manufacturer,
          mpn: chunk.metadata.mpn,
          trustLevel: chunk.metadata.trustLevel,
        },
      });
    }

    // Step 5: Sort by descending score (should already be sorted, but ensure)
    results.sort((a, b) => b.score - a.score);

    return results.slice(0, topK);
  }
}

/**
 * Check whether a chunk's metadata matches all provided filter criteria.
 */
function matchesChunkFilter(metadata: ChunkMetadata, filter: Partial<ChunkMetadata>): boolean {
  const entries = Object.entries(filter) as [string, unknown][];
  return entries.every(([key, value]) => {
    if (value === undefined) return true;
    const metaValue = (metadata as unknown as Record<string, unknown>)[key];
    return metaValue === value;
  });
}
