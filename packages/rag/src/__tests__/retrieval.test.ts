import { describe, it, expect } from 'vitest';
import { MemoryDocumentStore, MemoryChunkStore, MemoryVectorStore } from '../storage/memory-store';
import { MockEmbeddingGenerator } from '../embeddings/mock-generator';
import { RetrievalEngine } from '../retrieval/engine';
import { chunkDocument } from '../chunking/engine';
import { detectSections } from '../chunking/section-detector';
import type { DocumentRecord, ChunkRecord } from '../storage/types';

function makeDocument(overrides: Partial<DocumentRecord> = {}): DocumentRecord {
  return {
    id: overrides.id ?? 'doc-1',
    sourceUrl: overrides.sourceUrl ?? 'https://example.com/datasheet.pdf',
    sourceType: overrides.sourceType ?? 'datasheet',
    manufacturer: overrides.manufacturer ?? 'STMicroelectronics',
    partFamily: overrides.partFamily ?? 'STM32F4',
    mpn: overrides.mpn ?? 'STM32F407VGT6',
    revision: overrides.revision ?? 'rev3',
    fetchTimestamp: Date.now(),
    checksum: 'abc123',
    trustLevel: overrides.trustLevel ?? 'canonical',
    normalizedText:
      overrides.normalizedText ??
      'Absolute Maximum Ratings\nSupply voltage: 3.6V\nOperating temperature: -40 to 85°C\n\nPin Description\nPin 1: VDD\nPin 2: GND\nPin 3: PA0',
    metadata: overrides.metadata ?? {},
  };
}

function makeChunkRecord(overrides: Partial<ChunkRecord> = {}): ChunkRecord {
  return {
    id: overrides.id ?? 'chunk-1',
    documentId: overrides.documentId ?? 'doc-1',
    content: overrides.content ?? 'Absolute Maximum Ratings: Supply voltage 3.6V',
    chunkType: overrides.chunkType ?? 'absolute_max_ratings',
    metadata: {
      manufacturer: overrides.metadata?.manufacturer ?? 'STMicroelectronics',
      partFamily: overrides.metadata?.partFamily ?? 'STM32F4',
      mpn: overrides.metadata?.mpn ?? 'STM32F407VGT6',
      documentType: overrides.metadata?.documentType ?? 'datasheet',
      sourceUrl: overrides.metadata?.sourceUrl ?? 'https://example.com/datasheet.pdf',
      fetchTimestamp: Date.now(),
      trustLevel: overrides.metadata?.trustLevel ?? 'canonical',
    },
  };
}

describe('MemoryDocumentStore', () => {
  it('stores and retrieves a document', async () => {
    const store = new MemoryDocumentStore();
    const doc = makeDocument();
    await store.store(doc);
    const retrieved = await store.get('doc-1');
    expect(retrieved).not.toBeNull();
    expect(retrieved!.id).toBe('doc-1');
    expect(retrieved!.manufacturer).toBe('STMicroelectronics');
  });

  it('returns null for non-existent document', async () => {
    const store = new MemoryDocumentStore();
    expect(await store.get('nonexistent')).toBeNull();
  });

  it('queries documents by manufacturer', async () => {
    const store = new MemoryDocumentStore();
    await store.store(makeDocument({ id: 'doc-1', manufacturer: 'STMicroelectronics' }));
    await store.store(makeDocument({ id: 'doc-2', manufacturer: 'Espressif Systems' }));
    await store.store(makeDocument({ id: 'doc-3', manufacturer: 'STMicroelectronics' }));
    const results = await store.query({ manufacturer: 'STMicroelectronics' });
    expect(results).toHaveLength(2);
  });

  it('queries documents by mpn', async () => {
    const store = new MemoryDocumentStore();
    await store.store(makeDocument({ id: 'doc-1', mpn: 'STM32F407VGT6' }));
    await store.store(makeDocument({ id: 'doc-2', mpn: 'ESP32-S3' }));
    const results = await store.query({ mpn: 'STM32F407VGT6' });
    expect(results).toHaveLength(1);
  });

  it('deletes a document', async () => {
    const store = new MemoryDocumentStore();
    await store.store(makeDocument({ id: 'doc-1' }));
    await store.delete('doc-1');
    expect(store.size).toBe(0);
    expect(await store.get('doc-1')).toBeNull();
  });

  it('clears all documents', async () => {
    const store = new MemoryDocumentStore();
    await store.store(makeDocument({ id: 'doc-1' }));
    await store.store(makeDocument({ id: 'doc-2' }));
    store.clear();
    expect(store.size).toBe(0);
  });
});

describe('MemoryChunkStore', () => {
  it('stores and retrieves a chunk', async () => {
    const store = new MemoryChunkStore();
    const chunk = makeChunkRecord();
    await store.store(chunk);
    const retrieved = await store.get('chunk-1');
    expect(retrieved).not.toBeNull();
    expect(retrieved!.content).toBe(chunk.content);
  });

  it('returns null for non-existent chunk', async () => {
    const store = new MemoryChunkStore();
    expect(await store.get('nonexistent')).toBeNull();
  });

  it('queries chunks by document ID', async () => {
    const store = new MemoryChunkStore();
    await store.store(makeChunkRecord({ id: 'c1', documentId: 'doc-A' }));
    await store.store(makeChunkRecord({ id: 'c2', documentId: 'doc-A' }));
    await store.store(makeChunkRecord({ id: 'c3', documentId: 'doc-B' }));
    expect(await store.queryByDocument('doc-A')).toHaveLength(2);
  });

  it('queries chunks by MPN', async () => {
    const store = new MemoryChunkStore();
    await store.store(
      makeChunkRecord({
        id: 'c1',
        metadata: {
          manufacturer: 'ST',
          documentType: 'datasheet',
          sourceUrl: 'https://x.com',
          fetchTimestamp: Date.now(),
          trustLevel: 'canonical',
          mpn: 'STM32F407VGT6',
        },
      }),
    );
    await store.store(
      makeChunkRecord({
        id: 'c2',
        metadata: {
          manufacturer: 'Espressif',
          documentType: 'datasheet',
          sourceUrl: 'https://y.com',
          fetchTimestamp: Date.now(),
          trustLevel: 'canonical',
          mpn: 'ESP32-S3',
        },
      }),
    );
    const results = await store.queryByMpn('STM32F407VGT6');
    expect(results).toHaveLength(1);
    expect(results[0]!.id).toBe('c1');
  });

  it('deletes a chunk', async () => {
    const store = new MemoryChunkStore();
    await store.store(makeChunkRecord({ id: 'chunk-1' }));
    await store.delete('chunk-1');
    expect(store.size).toBe(0);
  });
});

describe('MemoryVectorStore', () => {
  it('stores and queries embeddings by cosine similarity', async () => {
    const store = new MemoryVectorStore();
    const dim = 10;

    const aligned = new Array(dim).fill(0);
    aligned[0] = 1;
    const orthogonal = new Array(dim).fill(0);
    orthogonal[1] = 1;
    const query = new Array(dim).fill(0);
    query[0] = 1;

    await store.storeEmbedding({
      id: 'e1',
      chunkId: 'c1',
      model: 'test',
      dimensions: dim,
      vector: aligned,
      generatedAt: Date.now(),
    });
    await store.storeEmbedding({
      id: 'e2',
      chunkId: 'c2',
      model: 'test',
      dimensions: dim,
      vector: orthogonal,
      generatedAt: Date.now(),
    });

    const results = await store.query(query, 10);
    expect(results).toHaveLength(2);
    expect(results[0]!.chunkId).toBe('c1');
    expect(results[0]!.score).toBeGreaterThan(results[1]!.score);
  });

  it('respects topK limit', async () => {
    const store = new MemoryVectorStore();
    const dim = 4;
    for (let i = 0; i < 5; i++) {
      const vec = [Math.random(), Math.random(), Math.random(), Math.random()];
      await store.storeEmbedding({
        id: `e${i}`,
        chunkId: `c${i}`,
        model: 'test',
        dimensions: dim,
        vector: vec,
        generatedAt: Date.now(),
      });
    }
    const results = await store.query([1, 0, 0, 0], 3);
    expect(results).toHaveLength(3);
  });

  it('deletes an embedding by chunkId', async () => {
    const store = new MemoryVectorStore();
    await store.storeEmbedding({
      id: 'e1',
      chunkId: 'c1',
      model: 'test',
      dimensions: 4,
      vector: [1, 0, 0, 0],
      generatedAt: Date.now(),
    });
    expect(store.size).toBe(1);
    await store.delete('c1');
    expect(store.size).toBe(0);
  });

  it('returns empty results when store is empty', async () => {
    const store = new MemoryVectorStore();
    expect(await store.query([0], 10)).toHaveLength(0);
  });
});

describe('MockEmbeddingGenerator', () => {
  it('returns vectors of consistent length', async () => {
    const gen = new MockEmbeddingGenerator();
    const v1 = await gen.generate('hello');
    const v2 = await gen.generate('world');
    expect(v1).toHaveLength(gen.dimensions);
    expect(v2).toHaveLength(gen.dimensions);
  });

  it('produces deterministic vectors for same input', async () => {
    const gen = new MockEmbeddingGenerator();
    expect(await gen.generate('test input')).toEqual(await gen.generate('test input'));
  });

  it('produces different vectors for different inputs', async () => {
    const gen = new MockEmbeddingGenerator();
    expect(await gen.generate('input one')).not.toEqual(await gen.generate('input two'));
  });

  it('generates batch embeddings', async () => {
    const gen = new MockEmbeddingGenerator();
    const vectors = await gen.generateBatch(['a', 'b', 'c']);
    expect(vectors).toHaveLength(3);
    for (const v of vectors) {
      expect(v).toHaveLength(gen.dimensions);
    }
  });

  it('exposes correct model name', () => {
    expect(new MockEmbeddingGenerator().modelName).toBe('mock-hash-384');
  });

  it('produces L2-normalized vectors', async () => {
    const gen = new MockEmbeddingGenerator();
    const v = await gen.generate('normalization test');
    const norm = Math.sqrt(v.reduce((sum, x) => sum + x * x, 0));
    expect(norm).toBeCloseTo(1, 5);
  });
});

describe('RetrievalEngine', () => {
  it('retrieves results with provenance', async () => {
    const chunkStore = new MemoryChunkStore();
    const vectorStore = new MemoryVectorStore();
    const embeddingGen = new MockEmbeddingGenerator();

    const chunk = makeChunkRecord({
      id: 'chunk-1',
      content: 'Absolute Maximum Ratings for STM32F407',
      metadata: {
        manufacturer: 'STMicroelectronics',
        partFamily: 'STM32F4',
        mpn: 'STM32F407VGT6',
        documentType: 'datasheet',
        sourceUrl: 'https://example.com/ds.pdf',
        fetchTimestamp: Date.now(),
        trustLevel: 'canonical',
      },
    });
    await chunkStore.store(chunk);

    const vector = await embeddingGen.generate(chunk.content);
    await vectorStore.storeEmbedding({
      id: 'emb-1',
      chunkId: 'chunk-1',
      model: 'mock-hash-384',
      dimensions: 384,
      vector,
      generatedAt: Date.now(),
    });

    const engine = new RetrievalEngine({
      embeddingGenerator: embeddingGen,
      chunkStore,
      vectorStore,
    });
    const results = await engine.retrieve('maximum ratings STM32F407', { minScore: -1 });

    expect(results.length).toBeGreaterThan(0);
    expect(results[0]!.chunk.id).toBe('chunk-1');
    expect(results[0]!.provenance.manufacturer).toBe('STMicroelectronics');
    expect(results[0]!.provenance.mpn).toBe('STM32F407VGT6');
    expect(results[0]!.provenance.documentType).toBe('datasheet');
    expect(results[0]!.provenance.trustLevel).toBe('canonical');
  });

  it('respects topK limit', async () => {
    const chunkStore = new MemoryChunkStore();
    const vectorStore = new MemoryVectorStore();
    const embeddingGen = new MockEmbeddingGenerator();

    for (let i = 0; i < 3; i++) {
      const chunk = makeChunkRecord({
        id: `chunk-${i}`,
        content: `chunk content ${i}`,
        metadata: {
          manufacturer: 'ST',
          documentType: 'datasheet',
          sourceUrl: 'https://example.com',
          fetchTimestamp: Date.now(),
          trustLevel: 'canonical',
        },
      });
      await chunkStore.store(chunk);
      const vector = await embeddingGen.generate(chunk.content);
      await vectorStore.storeEmbedding({
        id: `emb-${i}`,
        chunkId: `chunk-${i}`,
        model: 'mock-hash-384',
        dimensions: 384,
        vector,
        generatedAt: Date.now(),
      });
    }

    const engine = new RetrievalEngine({
      embeddingGenerator: embeddingGen,
      chunkStore,
      vectorStore,
    });
    const results = await engine.retrieve('test query', { topK: 2, minScore: -1 });
    expect(results.length).toBeLessThanOrEqual(2);
  });

  it('returns empty results when no chunks are stored', async () => {
    const engine = new RetrievalEngine({
      embeddingGenerator: new MockEmbeddingGenerator(),
      chunkStore: new MemoryChunkStore(),
      vectorStore: new MemoryVectorStore(),
    });
    expect(await engine.retrieve('nonexistent')).toHaveLength(0);
  });

  it('applies minScore filter', async () => {
    const chunkStore = new MemoryChunkStore();
    const vectorStore = new MemoryVectorStore();
    const embeddingGen = new MockEmbeddingGenerator();

    const chunk = makeChunkRecord({ id: 'c1', content: 'test content' });
    await chunkStore.store(chunk);
    const vec = await embeddingGen.generate(chunk.content);
    await vectorStore.storeEmbedding({
      id: 'e1',
      chunkId: 'c1',
      model: 'mock',
      dimensions: 384,
      vector: vec,
      generatedAt: Date.now(),
    });

    const engine = new RetrievalEngine({
      embeddingGenerator: embeddingGen,
      chunkStore,
      vectorStore,
    });
    const results = await engine.retrieve('completely different unrelated query', {
      minScore: 0.999,
    });
    expect(results).toHaveLength(0);
  });
});

describe('chunkDocument', () => {
  it('chunks a document with semantic sections', () => {
    const doc = makeDocument({
      normalizedText:
        'Absolute Maximum Ratings\nVDD: 3.6V\n\nPin Description\nPA0: GPIO\n\nRecommended Operating Conditions\nVDD: 1.8-3.6V',
    });
    const chunks = chunkDocument(doc);
    expect(chunks.length).toBeGreaterThan(0);
    expect(chunks.every((c) => c.documentId === 'doc-1')).toBe(true);
    expect(chunks.every((c) => c.content.length > 0)).toBe(true);
  });

  it('returns empty array for empty text', () => {
    expect(chunkDocument(makeDocument({ normalizedText: '' }))).toHaveLength(0);
  });

  it('produces deterministic chunk IDs', () => {
    const doc = makeDocument({ normalizedText: 'Absolute Maximum Ratings\nVDD: 3.6V' });
    const chunks1 = chunkDocument(doc);
    const chunks2 = chunkDocument(doc);
    expect(chunks1.map((c) => c.id)).toEqual(chunks2.map((c) => c.id));
  });

  it('inherits metadata from parent document', () => {
    const doc = makeDocument({
      mpn: 'STM32F407VGT6',
      manufacturer: 'STMicroelectronics',
      normalizedText: 'Absolute Maximum Ratings\nVDD: 3.6V',
    });
    const chunks = chunkDocument(doc);
    expect(chunks.length).toBeGreaterThan(0);
    expect(chunks[0]!.metadata.manufacturer).toBe('STMicroelectronics');
    expect(chunks[0]!.metadata.mpn).toBe('STM32F407VGT6');
  });
});

describe('detectSections', () => {
  it('detects absolute maximum ratings section', () => {
    const sections = detectSections(
      'Some intro\n\nAbsolute Maximum Ratings\nVDD: 3.6V\nTA: -40 to 85°C',
    );
    expect(sections.some((s) => s.type === 'absolute_max_ratings')).toBe(true);
  });

  it('detects pin description section', () => {
    const sections = detectSections('Pin Description\nPA0: GPIO pin\nPA1: ADC input');
    expect(sections.some((s) => s.type === 'pin_description')).toBe(true);
  });

  it('returns general section for unrecognized text', () => {
    const sections = detectSections('Some random text that does not match any section pattern');
    expect(sections).toHaveLength(1);
    expect(sections[0]!.type).toBe('general');
  });

  it('detects multiple sections', () => {
    const text =
      'Absolute Maximum Ratings\nVDD: 3.6V\n\nPin Description\nPA0: GPIO\n\nRecommended Operating Conditions\nVDD: 1.8-3.6V';
    expect(detectSections(text).length).toBeGreaterThanOrEqual(3);
  });

  it('detects errata sections', () => {
    const sections = detectSections(
      'Errata\n2.1 ADC calibration issue\nWorkaround: recalibrate at startup',
    );
    expect(sections.some((s) => s.type === 'errata_item')).toBe(true);
  });
});
