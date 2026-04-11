// ── Retrieval Smoke Test ─────────────────────────────────────────────────────────
// Integration test that runs the full 8-stage ingestion pipeline against fixture
// data and then queries the in-memory stores to verify provenance-preserving
// retrieval works end-to-end.

import { describe, it, expect, beforeAll } from 'vitest';
import { BOOTSTRAP_SEED } from '../config/seed.js';
import { discoverCandidates } from '../pipeline/candidate-discovery.js';
import { fetchDocuments } from '../pipeline/doc-fetch.js';
import { normalizeDocument } from '../pipeline/normalization.js';
import { chunkDocuments } from '../pipeline/chunking.js';
import { enrichMetadata } from '../pipeline/metadata-enrichment.js';
import { generateEmbeddings } from '../pipeline/embedding.js';
import { storeEmbeddings, getStores, querySimilar } from '../pipeline/vector-store.js';
import type { CandidateSet } from '../pipeline/types.js';
import type { DocumentRecord, ChunkRecord, EmbeddingRecord } from '@raino/rag';

describe('Retrieval smoke test — full pipeline + query', () => {
  let candidates: CandidateSet[];
  let docs: DocumentRecord[];
  let chunks: ChunkRecord[];
  let embeddings: EmbeddingRecord[];

  beforeAll(async () => {
    // Stage 1: Candidate Discovery
    candidates = discoverCandidates(BOOTSTRAP_SEED);

    // Stage 2: Document Fetch (fixture mode)
    docs = fetchDocuments(candidates, 'fixture', BOOTSTRAP_SEED.sourcePreferences);

    // Stage 3-4: Normalization
    docs = docs.map((d) => normalizeDocument(d));

    // Stage 5: Chunking
    chunks = chunkDocuments(docs);

    // Stage 6: Metadata Enrichment
    chunks = enrichMetadata(chunks);

    // Stage 7: Embedding
    embeddings = await generateEmbeddings(chunks);

    // Stage 8: Vector Store (also populates document + chunk stores)
    await storeEmbeddings(embeddings, chunks);
  });

  it('discovers candidates from seed config', () => {
    expect(candidates.length).toBeGreaterThan(0);
    const mpns = candidates.map((c) => c.mpn);
    expect(mpns).toContain('STM32F407VGT6');
    expect(mpns).toContain('ESP32-S3-WROOM-1-N8R8');
    expect(mpns).toContain('LM7805CT');
  });

  it('fetches fixture documents for each candidate', () => {
    expect(docs.length).toBeGreaterThanOrEqual(candidates.length);
    const stm32Docs = docs.filter((d) => d.mpn === 'STM32F407VGT6');
    expect(stm32Docs.length).toBeGreaterThan(0);
  });

  it('chunks documents with non-zero content', () => {
    expect(chunks.length).toBeGreaterThan(0);
    for (const chunk of chunks) {
      expect(chunk.content.length).toBeGreaterThan(0);
    }
  });

  it('generates embeddings for every chunk', () => {
    expect(embeddings.length).toBe(chunks.length);
    for (const emb of embeddings) {
      expect(emb.vector.length).toBeGreaterThan(0);
      expect(emb.chunkId).toBeDefined();
    }
  });

  it('returns scored results from vector store for STM32F407 query', async () => {
    const results = await querySimilar('STM32F407 absolute maximum ratings', 3);
    expect(results.length).toBeGreaterThan(0);
    expect(results.length).toBeLessThanOrEqual(3);

    const stores = getStores();
    for (const hit of results) {
      expect(typeof hit.score).toBe('number');
      expect(hit.score).toBeGreaterThanOrEqual(-1);
      expect(hit.score).toBeLessThanOrEqual(1);
      const chunk = await stores.chunkStore.get(hit.chunkId);
      expect(chunk).toBeDefined();
      expect(chunk!.content.length).toBeGreaterThan(0);
    }
  });

  it('returns scored results from vector store for ESP32-S3 query', async () => {
    const results = await querySimilar('ESP32-S3 boot strapping GPIO0', 3);
    expect(results.length).toBeGreaterThan(0);
    expect(results.length).toBeLessThanOrEqual(3);

    const stores = getStores();
    for (const hit of results) {
      expect(typeof hit.score).toBe('number');
      const chunk = await stores.chunkStore.get(hit.chunkId);
      expect(chunk).toBeDefined();
    }
  });

  it('preserves provenance on retrieved chunks', async () => {
    const stores = getStores();
    const stm32Chunks = await stores.chunkStore.queryByMpn('STM32F407VGT6');
    expect(stm32Chunks.length).toBeGreaterThan(0);

    for (const chunk of stm32Chunks) {
      // Every chunk must have manufacturer and document type
      expect(chunk.metadata.manufacturer).toBeDefined();
      expect(chunk.metadata.manufacturer.length).toBeGreaterThan(0);
      expect(chunk.metadata.documentType).toBeDefined();
      // Source URL must exist (even in fixture mode it's fixture://...)
      expect(chunk.metadata.sourceUrl).toBeDefined();
      // Trust level must be set
      expect(chunk.metadata.trustLevel).toBeDefined();
    }
  });

  it('reports correct totals across the pipeline', () => {
    // Consistent with the bootstrap run: 8 candidates, 13+ docs, 100+ chunks
    expect(candidates.length).toBeGreaterThanOrEqual(8);
    expect(docs.length).toBeGreaterThanOrEqual(8);
    expect(chunks.length).toBeGreaterThan(50);
    expect(embeddings.length).toBe(chunks.length);
  });
});
