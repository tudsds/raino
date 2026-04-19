import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryChunkStore, MemoryVectorStore } from '../storage/memory-store';
import { OpenAIEmbeddingGenerator } from '../embeddings/openai-generator';
import { RetrievalEngine } from '../retrieval/engine';
import type { ChunkRecord, ChunkMetadata } from '../storage/types';

const MOCK_DIMENSIONS = 10;

const TOPIC_DIMENSIONS: Record<string, number> = {
  'absolute maximum ratings': 0,
  'supply voltage': 0,
  'pin description': 1,
  gpio: 1,
  'power requirements': 2,
  'current consumption': 2,
  'clock tree': 3,
  oscillator: 3,
  adc: 4,
  calibration: 4,
  drift: 4,
  errata: 5,
  'pcb layout': 6,
  decoupling: 6,
};

function textToSemanticVector(text: string): number[] {
  const lower = text.toLowerCase();
  const vec = new Array(MOCK_DIMENSIONS).fill(0);

  for (const [topic, dim] of Object.entries(TOPIC_DIMENSIONS)) {
    if (lower.includes(topic)) {
      vec[dim] += 1;
    }
  }

  if (vec.every((v) => v === 0)) {
    let hash = 0;
    for (let i = 0; i < lower.length; i++) {
      hash = (hash * 31 + lower.charCodeAt(i)) & 0xffff;
    }
    for (let i = 0; i < MOCK_DIMENSIONS; i++) {
      vec[i] = ((hash + i * 137) % 100) / 1000;
    }
  }

  const norm = Math.sqrt(vec.reduce((sum, x) => sum + x * x, 0));
  if (norm > 0) {
    for (let i = 0; i < vec.length; i++) {
      vec[i] = vec[i]! / norm;
    }
  }

  return vec;
}

vi.mock('openai', () => {
  return {
    default: class MockOpenAI {
      embeddings = {
        create: vi.fn(async ({ input }: { input: string | string[] }) => {
          const texts = Array.isArray(input) ? input : [input];
          const data = texts.map((text, index) => ({
            index,
            embedding: textToSemanticVector(text),
          }));
          return { data };
        }),
      };
    },
  };
});

function makeChunkRecord(overrides: Partial<ChunkRecord> = {}): ChunkRecord {
  const metadata: ChunkMetadata = {
    manufacturer: overrides.metadata?.manufacturer ?? 'STMicroelectronics',
    partFamily: overrides.metadata?.partFamily ?? 'STM32F4',
    mpn: overrides.metadata?.mpn ?? 'STM32F407VGT6',
    documentType: overrides.metadata?.documentType ?? 'datasheet',
    sourceUrl: overrides.metadata?.sourceUrl ?? 'https://example.com/ds.pdf',
    fetchTimestamp: overrides.metadata?.fetchTimestamp ?? Date.now(),
    trustLevel: overrides.metadata?.trustLevel ?? 'canonical',
  };

  return {
    id: overrides.id ?? 'chunk-1',
    documentId: overrides.documentId ?? 'doc-1',
    content: overrides.content ?? 'Absolute Maximum Ratings: Supply voltage 3.6V',
    chunkType: overrides.chunkType ?? 'absolute_max_ratings',
    metadata,
  };
}

describe('OpenAIEmbeddingGenerator (mocked)', () => {
  it('produces vectors of the configured dimension', async () => {
    const gen = new OpenAIEmbeddingGenerator({
      apiKey: 'test-key',
      dimensions: MOCK_DIMENSIONS,
    });
    const vec = await gen.generate('test text');
    expect(vec).toHaveLength(MOCK_DIMENSIONS);
  });

  it('produces deterministic vectors for identical input', async () => {
    const gen = new OpenAIEmbeddingGenerator({
      apiKey: 'test-key',
      dimensions: MOCK_DIMENSIONS,
    });
    const v1 = await gen.generate('identical text');
    const v2 = await gen.generate('identical text');
    expect(v1).toEqual(v2);
  });

  it('produces different vectors for different topics', async () => {
    const gen = new OpenAIEmbeddingGenerator({
      apiKey: 'test-key',
      dimensions: MOCK_DIMENSIONS,
    });
    const v1 = await gen.generate('absolute maximum ratings');
    const v2 = await gen.generate('pin description');
    const dot = v1.reduce((sum, x, i) => sum + x * v2[i]!, 0);
    expect(dot).toBeLessThan(0.9);
  });

  it('batch generation preserves order and count', async () => {
    const gen = new OpenAIEmbeddingGenerator({
      apiKey: 'test-key',
      dimensions: MOCK_DIMENSIONS,
    });
    const texts = ['alpha', 'beta', 'gamma'];
    const vectors = await gen.generateBatch(texts);
    expect(vectors).toHaveLength(3);
    vectors.forEach((v) => expect(v).toHaveLength(MOCK_DIMENSIONS));
  });

  it('exposes the configured model name', () => {
    const gen = new OpenAIEmbeddingGenerator({
      apiKey: 'test-key',
      model: 'text-embedding-3-small',
    });
    expect(gen.modelName).toBe('text-embedding-3-small');
  });

  it('produces L2-normalized vectors', async () => {
    const gen = new OpenAIEmbeddingGenerator({
      apiKey: 'test-key',
      dimensions: MOCK_DIMENSIONS,
    });
    const vec = await gen.generate('normalization check');
    const norm = Math.sqrt(vec.reduce((sum, x) => sum + x * x, 0));
    expect(norm).toBeCloseTo(1, 5);
  });
});

describe('Semantic similarity with OpenAIEmbeddingGenerator', () => {
  it('ranks similar texts higher than dissimilar texts', async () => {
    const gen = new OpenAIEmbeddingGenerator({
      apiKey: 'test-key',
      dimensions: MOCK_DIMENSIONS,
    });
    const chunkStore = new MemoryChunkStore();
    const vectorStore = new MemoryVectorStore();

    const chunks: ChunkRecord[] = [
      makeChunkRecord({
        id: 'c1',
        content: 'Absolute Maximum Ratings: supply voltage must not exceed 3.6V',
        chunkType: 'absolute_max_ratings',
      }),
      makeChunkRecord({
        id: 'c2',
        content: 'Pin Description: PA0 is a GPIO pin with 5V tolerant input',
        chunkType: 'pin_description',
      }),
      makeChunkRecord({
        id: 'c3',
        content: 'Power Requirements: typical current consumption is 50mA at 3.3V',
        chunkType: 'power_requirements',
      }),
    ];

    for (const chunk of chunks) {
      await chunkStore.store(chunk);
      const vector = await gen.generate(chunk.content);
      await vectorStore.storeEmbedding({
        id: `emb-${chunk.id}`,
        chunkId: chunk.id,
        model: gen.modelName,
        dimensions: gen.dimensions,
        vector,
        generatedAt: Date.now(),
      });
    }

    const query = 'What is the maximum supply voltage allowed?';
    const queryVector = await gen.generate(query);
    const hits = await vectorStore.query(queryVector, 10);

    expect(hits.length).toBe(3);
    expect(hits[0]!.chunkId).toBe('c1');
    expect(hits[0]!.score).toBeGreaterThan(hits[1]!.score);
  });

  it('finds semantically related content even with different wording', async () => {
    const gen = new OpenAIEmbeddingGenerator({
      apiKey: 'test-key',
      dimensions: MOCK_DIMENSIONS,
    });
    const chunkStore = new MemoryChunkStore();
    const vectorStore = new MemoryVectorStore();

    const chunk = makeChunkRecord({
      id: 'c-gpio',
      content: 'Pin Description: PA0 serves as a general-purpose input/output',
      chunkType: 'pin_description',
    });
    await chunkStore.store(chunk);
    const vector = await gen.generate(chunk.content);
    await vectorStore.storeEmbedding({
      id: 'emb-gpio',
      chunkId: 'c-gpio',
      model: gen.modelName,
      dimensions: gen.dimensions,
      vector,
      generatedAt: Date.now(),
    });

    const queryVector = await gen.generate('What are the GPIO pins?');
    const hits = await vectorStore.query(queryVector, 10);

    expect(hits.length).toBe(1);
    expect(hits[0]!.chunkId).toBe('c-gpio');
    expect(hits[0]!.score).toBeGreaterThan(0.5);
  });
});

describe('RetrievalEngine provenance with OpenAIEmbeddingGenerator', () => {
  let chunkStore: MemoryChunkStore;
  let vectorStore: MemoryVectorStore;
  let engine: RetrievalEngine;

  beforeEach(() => {
    chunkStore = new MemoryChunkStore();
    vectorStore = new MemoryVectorStore();
    engine = new RetrievalEngine({
      embeddingGenerator: new OpenAIEmbeddingGenerator({
        apiKey: 'test-key',
        dimensions: MOCK_DIMENSIONS,
      }),
      chunkStore,
      vectorStore,
    });
  });

  it('returns provenance with manufacturer, MPN, and trust level', async () => {
    const chunk = makeChunkRecord({
      id: 'chunk-provenance',
      content: 'Absolute Maximum Ratings: VDD max 3.6V',
      metadata: {
        manufacturer: 'Texas Instruments',
        partFamily: 'MSP430',
        mpn: 'MSP430FR5969',
        documentType: 'datasheet',
        sourceUrl: 'https://ti.com/datasheet.pdf',
        fetchTimestamp: Date.now(),
        trustLevel: 'canonical',
      },
    });

    await chunkStore.store(chunk);
    const gen = new OpenAIEmbeddingGenerator({
      apiKey: 'test-key',
      dimensions: MOCK_DIMENSIONS,
    });
    const vector = await gen.generate(chunk.content);
    await vectorStore.storeEmbedding({
      id: 'emb-prov',
      chunkId: chunk.id,
      model: gen.modelName,
      dimensions: gen.dimensions,
      vector,
      generatedAt: Date.now(),
    });

    const results = await engine.retrieve('maximum voltage rating', { minScore: -1 });

    expect(results.length).toBeGreaterThan(0);
    expect(results[0]!.chunk.id).toBe('chunk-provenance');
    expect(results[0]!.provenance.manufacturer).toBe('Texas Instruments');
    expect(results[0]!.provenance.mpn).toBe('MSP430FR5969');
    expect(results[0]!.provenance.documentType).toBe('datasheet');
    expect(results[0]!.provenance.trustLevel).toBe('canonical');
    expect(results[0]!.provenance.sourceUrl).toBe('https://ti.com/datasheet.pdf');
  });

  it('returns provenance with secondary trust level', async () => {
    const chunk = makeChunkRecord({
      id: 'chunk-secondary',
      content: 'Application Note: Best practices for low-power design',
      chunkType: 'general',
      metadata: {
        manufacturer: 'Silicon Labs',
        partFamily: 'EFM32',
        mpn: 'EFM32ZG110',
        documentType: 'app_note',
        sourceUrl: 'https://silabs.com/an001.pdf',
        fetchTimestamp: Date.now(),
        trustLevel: 'secondary',
      },
    });

    await chunkStore.store(chunk);
    const gen = new OpenAIEmbeddingGenerator({
      apiKey: 'test-key',
      dimensions: MOCK_DIMENSIONS,
    });
    const vector = await gen.generate(chunk.content);
    await vectorStore.storeEmbedding({
      id: 'emb-secondary',
      chunkId: chunk.id,
      model: gen.modelName,
      dimensions: gen.dimensions,
      vector,
      generatedAt: Date.now(),
    });

    const results = await engine.retrieve('low power design', { minScore: -1 });

    expect(results.length).toBeGreaterThan(0);
    expect(results[0]!.provenance.trustLevel).toBe('secondary');
    expect(results[0]!.provenance.documentType).toBe('app_note');
  });

  it('filters results below minScore', async () => {
    const chunk = makeChunkRecord({
      id: 'c-filter',
      content: 'Clock Tree: external crystal oscillator 32.768kHz',
      chunkType: 'clock_tree',
    });

    await chunkStore.store(chunk);
    const gen = new OpenAIEmbeddingGenerator({
      apiKey: 'test-key',
      dimensions: MOCK_DIMENSIONS,
    });
    const vector = await gen.generate(chunk.content);
    await vectorStore.storeEmbedding({
      id: 'emb-filter',
      chunkId: chunk.id,
      model: gen.modelName,
      dimensions: gen.dimensions,
      vector,
      generatedAt: Date.now(),
    });

    const results = await engine.retrieve('USB enumeration failure workaround', {
      minScore: 0.95,
    });

    expect(results).toHaveLength(0);
  });

  it('respects topK limit', async () => {
    const gen = new OpenAIEmbeddingGenerator({
      apiKey: 'test-key',
      dimensions: MOCK_DIMENSIONS,
    });

    for (let i = 0; i < 5; i++) {
      const chunk = makeChunkRecord({
        id: `c-topk-${i}`,
        content: `Topic ${i}: some content about topic ${i}`,
      });
      await chunkStore.store(chunk);
      const vector = await gen.generate(chunk.content);
      await vectorStore.storeEmbedding({
        id: `emb-topk-${i}`,
        chunkId: chunk.id,
        model: gen.modelName,
        dimensions: gen.dimensions,
        vector,
        generatedAt: Date.now(),
      });
    }

    const results = await engine.retrieve('Topic 0 content', { topK: 2, minScore: -1 });
    expect(results.length).toBeLessThanOrEqual(2);
  });
});

describe('Full retrieval pipeline with mocked OpenAI embeddings', () => {
  it('end-to-end: chunk embed store retrieve provenance', async () => {
    const gen = new OpenAIEmbeddingGenerator({
      apiKey: 'test-key',
      dimensions: MOCK_DIMENSIONS,
    });
    const chunkStore = new MemoryChunkStore();
    const vectorStore = new MemoryVectorStore();
    const engine = new RetrievalEngine({ embeddingGenerator: gen, chunkStore, vectorStore });

    const docs: ChunkRecord[] = [
      makeChunkRecord({
        id: 'c-errata',
        content: 'Errata: ADC calibration may drift above 85C. Workaround: recalibrate at startup.',
        chunkType: 'errata_item',
        metadata: {
          manufacturer: 'Microchip',
          partFamily: 'SAM D21',
          mpn: 'ATSAMD21G18A',
          documentType: 'errata',
          sourceUrl: 'https://microchip.com/errata.pdf',
          fetchTimestamp: Date.now(),
          trustLevel: 'canonical',
        },
      }),
      makeChunkRecord({
        id: 'c-pcb',
        content: 'Recommended PCB Layout: keep decoupling capacitors within 2mm of VDD pins.',
        chunkType: 'recommended_pcb_layout',
        metadata: {
          manufacturer: 'Microchip',
          partFamily: 'SAM D21',
          mpn: 'ATSAMD21G18A',
          documentType: 'datasheet',
          sourceUrl: 'https://microchip.com/ds.pdf',
          fetchTimestamp: Date.now(),
          trustLevel: 'canonical',
        },
      }),
    ];

    for (const chunk of docs) {
      await chunkStore.store(chunk);
      const vector = await gen.generate(chunk.content);
      await vectorStore.storeEmbedding({
        id: `emb-${chunk.id}`,
        chunkId: chunk.id,
        model: gen.modelName,
        dimensions: gen.dimensions,
        vector,
        generatedAt: Date.now(),
      });
    }

    const results = await engine.retrieve('ADC temperature drift issue', { minScore: -1 });

    expect(results.length).toBeGreaterThan(0);
    expect(results[0]!.chunk.id).toBe('c-errata');
    expect(results[0]!.provenance.manufacturer).toBe('Microchip');
    expect(results[0]!.provenance.mpn).toBe('ATSAMD21G18A');
    expect(results[0]!.provenance.documentType).toBe('errata');
  });
});
