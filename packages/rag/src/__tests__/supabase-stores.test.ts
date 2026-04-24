import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { DocumentRecord, ChunkRecord, ChunkMetadata, EmbeddingRecord } from '../storage/types';
import { SupabaseDocumentStore } from '../storage/supabase-document-store';
import { SupabaseChunkStore } from '../storage/supabase-chunk-store';
import { SupabaseVectorStore } from '../storage/supabase-vector-store';

function makeDocument(overrides: Partial<DocumentRecord> = {}): DocumentRecord {
  return {
    id: overrides.id ?? 'doc-1',
    sourceUrl: overrides.sourceUrl ?? 'https://example.com/ds.pdf',
    sourceType: overrides.sourceType ?? 'datasheet',
    manufacturer: overrides.manufacturer ?? 'STMicroelectronics',
    partFamily: overrides.partFamily ?? 'STM32F4',
    mpn: overrides.mpn ?? 'STM32F407VGT6',
    revision: overrides.revision ?? 'rev3',
    fetchTimestamp: Date.now(),
    checksum: 'abc123',
    trustLevel: overrides.trustLevel ?? 'canonical',
    normalizedText: overrides.normalizedText ?? 'Absolute Maximum Ratings: VDD 3.6V',
    metadata: overrides.metadata ?? {},
  };
}

function makeChunkMetadata(overrides: Partial<ChunkMetadata> = {}): ChunkMetadata {
  return {
    manufacturer: overrides.manufacturer ?? 'STMicroelectronics',
    partFamily: overrides.partFamily ?? 'STM32F4',
    mpn: overrides.mpn ?? 'STM32F407VGT6',
    documentType: overrides.documentType ?? 'datasheet',
    sourceUrl: overrides.sourceUrl ?? 'https://example.com/ds.pdf',
    fetchTimestamp: Date.now(),
    trustLevel: overrides.trustLevel ?? 'canonical',
  };
}

function makeChunk(overrides: Partial<ChunkRecord> = {}): ChunkRecord {
  return {
    id: overrides.id ?? 'chunk-1',
    documentId: overrides.documentId ?? 'doc-1',
    content: overrides.content ?? 'Absolute Maximum Ratings: VDD 3.6V',
    chunkType: overrides.chunkType ?? 'absolute_max_ratings',
    metadata: overrides.metadata ?? makeChunkMetadata(),
  };
}

interface MockChain {
  eq: ReturnType<typeof vi.fn>;
  select: ReturnType<typeof vi.fn>;
  delete: ReturnType<typeof vi.fn>;
  upsert: ReturnType<typeof vi.fn>;
  contains: ReturnType<typeof vi.fn>;
  maybeSingle: ReturnType<typeof vi.fn>;
}

function mockChain(): MockChain {
  const chain = {} as MockChain;
  chain.eq = vi.fn().mockReturnValue(chain);
  chain.select = vi.fn().mockReturnValue(chain);
  chain.delete = vi.fn().mockReturnValue(chain);
  chain.upsert = vi.fn().mockReturnValue(chain);
  chain.contains = vi.fn().mockReturnValue(chain);
  chain.maybeSingle = vi.fn().mockResolvedValue({ data: null, error: null });
  return chain;
}

function mockClient(chain: MockChain): SupabaseClient {
  return {
    from: vi.fn().mockReturnValue(chain),
    rpc: vi.fn().mockResolvedValue({ data: null, error: null }),
  } as unknown as SupabaseClient;
}

describe('SupabaseDocumentStore', () => {
  let chain: MockChain;
  let client: SupabaseClient;
  let store: SupabaseDocumentStore;

  beforeEach(() => {
    chain = mockChain();
    client = mockClient(chain);
    store = new SupabaseDocumentStore(client);
  });

  it('stores a document via upsert', async () => {
    const doc = makeDocument();
    chain.upsert.mockResolvedValue({ data: null, error: null });

    await store.store(doc);

    expect(client.from).toHaveBeenCalledWith('documents');
    expect(chain.upsert).toHaveBeenCalledTimes(1);
    const upsertArg = chain.upsert.mock.calls[0]![0];
    expect(upsertArg.id).toBe('doc-1');
    expect(upsertArg.manufacturer).toBe('STMicroelectronics');
    expect(upsertArg.source_type).toBe('datasheet');
  });

  it('throws on store error', async () => {
    chain.upsert.mockResolvedValue({ data: null, error: { message: 'DB error' } });
    await expect(store.store(makeDocument())).rejects.toThrow('SupabaseDocumentStore.store failed');
  });

  it('gets a document by id', async () => {
    const row = {
      id: 'doc-1',
      project_id: null,
      source_url: 'https://example.com/ds.pdf',
      source_type: 'datasheet',
      manufacturer: 'STMicroelectronics',
      part_family: 'STM32F4',
      mpn: 'STM32F407VGT6',
      revision: 'rev3',
      fetch_timestamp: Date.now(),
      checksum: 'abc123',
      trust_level: 'canonical',
      normalized_text: 'some text',
      metadata: {},
    };
    chain.maybeSingle.mockResolvedValue({ data: row, error: null });

    const result = await store.get('doc-1');
    expect(result).not.toBeNull();
    expect(result!.id).toBe('doc-1');
    expect(result!.manufacturer).toBe('STMicroelectronics');
    expect(result!.sourceUrl).toBe('https://example.com/ds.pdf');
  });

  it('returns null for non-existent document', async () => {
    chain.maybeSingle.mockResolvedValue({ data: null, error: null });
    expect(await store.get('missing')).toBeNull();
  });

  it('throws on get error', async () => {
    chain.maybeSingle.mockResolvedValue({ data: null, error: { message: 'fail' } });
    await expect(store.get('doc-1')).rejects.toThrow('SupabaseDocumentStore.get failed');
  });

  it('queries documents by manufacturer', async () => {
    const rows = [
      {
        id: 'doc-1',
        project_id: null,
        source_url: 'https://a.com',
        source_type: 'datasheet',
        manufacturer: 'STMicroelectronics',
        part_family: null,
        mpn: null,
        revision: null,
        fetch_timestamp: Date.now(),
        checksum: null,
        trust_level: 'canonical',
        normalized_text: null,
        metadata: {},
      },
    ];
    chain.select.mockReturnValue(chain);
    chain.eq.mockReturnValue(Promise.resolve({ data: rows, error: null }));

    const results = await store.query({ manufacturer: 'STMicroelectronics' });
    expect(results).toHaveLength(1);
    expect(results[0]!.manufacturer).toBe('STMicroelectronics');
  });

  it('deletes a document', async () => {
    chain.delete.mockReturnValue(chain);
    chain.eq.mockReturnValue({
      then: (cb: (v: unknown) => unknown) => Promise.resolve({ data: null, error: null }).then(cb),
    });

    await store.delete('doc-1');
    expect(client.from).toHaveBeenCalledWith('documents');
  });

  it('throws on delete error', async () => {
    chain.delete.mockReturnValue(chain);
    chain.eq.mockReturnValue({
      then: (cb: (v: unknown) => unknown) =>
        Promise.resolve({ data: null, error: { message: 'fail' } }).then(cb),
    });

    await expect(store.delete('doc-1')).rejects.toThrow('SupabaseDocumentStore.delete failed');
  });
});

describe('SupabaseChunkStore', () => {
  let chain: MockChain;
  let client: SupabaseClient;
  let store: SupabaseChunkStore;

  beforeEach(() => {
    chain = mockChain();
    client = mockClient(chain);
    store = new SupabaseChunkStore(client);
  });

  it('stores a chunk via upsert', async () => {
    const chunk = makeChunk();
    chain.upsert.mockResolvedValue({ data: null, error: null });

    await store.store(chunk);
    expect(chain.upsert).toHaveBeenCalledTimes(1);
    const upsertArg = chain.upsert.mock.calls[0]![0];
    expect(upsertArg.id).toBe('chunk-1');
    expect(upsertArg.document_id).toBe('doc-1');
    expect(upsertArg.chunk_type).toBe('absolute_max_ratings');
  });

  it('throws on store error', async () => {
    chain.upsert.mockResolvedValue({ data: null, error: { message: 'DB error' } });
    await expect(store.store(makeChunk())).rejects.toThrow('SupabaseChunkStore.store failed');
  });

  it('gets a chunk by id', async () => {
    const row = {
      id: 'chunk-1',
      document_id: 'doc-1',
      content: 'some content',
      chunk_type: 'absolute_max_ratings',
      metadata: makeChunkMetadata() as unknown as Record<string, unknown>,
      embedding: null,
    };
    chain.maybeSingle.mockResolvedValue({ data: row, error: null });

    const result = await store.get('chunk-1');
    expect(result).not.toBeNull();
    expect(result!.id).toBe('chunk-1');
    expect(result!.documentId).toBe('doc-1');
  });

  it('returns null for non-existent chunk', async () => {
    chain.maybeSingle.mockResolvedValue({ data: null, error: null });
    expect(await store.get('missing')).toBeNull();
  });

  it('queries chunks by document id', async () => {
    const rows = [
      {
        id: 'c1',
        document_id: 'doc-A',
        content: 'content 1',
        chunk_type: 'general',
        metadata: makeChunkMetadata() as unknown as Record<string, unknown>,
        embedding: null,
      },
    ];
    chain.select.mockReturnValue(chain);
    chain.eq.mockReturnValue(Promise.resolve({ data: rows, error: null }));

    const results = await store.queryByDocument('doc-A');
    expect(results).toHaveLength(1);
    expect(results[0]!.documentId).toBe('doc-A');
  });

  it('queries chunks by mpn via metadata filter', async () => {
    const rows = [
      {
        id: 'c1',
        document_id: 'doc-1',
        content: 'content',
        chunk_type: 'general',
        metadata: { ...makeChunkMetadata(), mpn: 'STM32F407VGT6' },
        embedding: null,
      },
      {
        id: 'c2',
        document_id: 'doc-1',
        content: 'content 2',
        chunk_type: 'general',
        metadata: { ...makeChunkMetadata(), mpn: 'ESP32-S3' },
        embedding: null,
      },
    ];
    // queryByMpn does .select('*') then awaits the result directly (no .eq for non-projectId)
    chain.select.mockReturnValue(Promise.resolve({ data: rows, error: null }));

    const results = await store.queryByMpn('STM32F407VGT6');
    expect(results).toHaveLength(1);
    expect(results[0]!.id).toBe('c1');
  });

  it('queries chunks by metadata filter', async () => {
    const rows = [
      {
        id: 'c1',
        document_id: 'doc-1',
        content: 'content',
        chunk_type: 'general',
        metadata: { ...makeChunkMetadata(), manufacturer: 'STMicroelectronics' },
        embedding: null,
      },
    ];
    chain.select.mockReturnValue(chain);
    chain.contains.mockReturnValue(Promise.resolve({ data: rows, error: null }));

    const results = await store.queryByFilter({ manufacturer: 'STMicroelectronics' });
    expect(results).toHaveLength(1);
  });

  it('deletes a chunk', async () => {
    chain.delete.mockReturnValue(chain);
    chain.eq.mockReturnValue({
      then: (cb: (v: unknown) => unknown) => Promise.resolve({ data: null, error: null }).then(cb),
    });

    await store.delete('chunk-1');
    expect(client.from).toHaveBeenCalledWith('chunks');
  });

  it('throws on delete error', async () => {
    chain.delete.mockReturnValue(chain);
    chain.eq.mockReturnValue({
      then: (cb: (v: unknown) => unknown) =>
        Promise.resolve({ data: null, error: { message: 'fail' } }).then(cb),
    });

    await expect(store.delete('chunk-1')).rejects.toThrow('SupabaseChunkStore.delete failed');
  });
});

describe('SupabaseVectorStore', () => {
  let chain: MockChain;
  let client: SupabaseClient;
  let store: SupabaseVectorStore;
  let rpcSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    chain = mockChain();
    rpcSpy = vi.fn().mockResolvedValue({ data: null, error: null });
    client = {
      from: vi.fn().mockReturnValue(chain),
      rpc: rpcSpy,
    } as unknown as SupabaseClient;
    store = new SupabaseVectorStore(client);
  });

  it('stores an embedding via upsert', async () => {
    const record: EmbeddingRecord = {
      id: 'emb-1',
      chunkId: 'c1',
      model: 'mock-hash-384',
      dimensions: 384,
      vector: [0.1, 0.2, 0.3],
      generatedAt: Date.now(),
    };
    chain.upsert.mockResolvedValue({ data: null, error: null });

    await store.storeEmbedding(record);
    expect(chain.upsert).toHaveBeenCalledTimes(1);
    const upsertArg = chain.upsert.mock.calls[0]![0];
    expect(upsertArg.id).toBe('emb-1');
    expect(upsertArg.chunk_id).toBe('c1');
    expect(upsertArg.model).toBe('mock-hash-384');
  });

  it('throws on store error', async () => {
    chain.upsert.mockResolvedValue({ data: null, error: { message: 'DB error' } });
    await expect(
      store.storeEmbedding({
        id: 'emb-1',
        chunkId: 'c1',
        model: 'test',
        dimensions: 4,
        vector: [1, 0, 0, 0],
        generatedAt: Date.now(),
      }),
    ).rejects.toThrow('SupabaseVectorStore.storeEmbedding failed');
  });

  it('queries via match_documents RPC', async () => {
    const rpcData = [
      { chunk_id: 'c1', similarity: 0.95 },
      { chunk_id: 'c2', similarity: 0.8 },
    ];
    rpcSpy.mockResolvedValue({ data: rpcData, error: null });

    const results = await store.query([0.1, 0.2], 5);
    expect(results).toHaveLength(2);
    expect(results[0]!.chunkId).toBe('c1');
    expect(results[0]!.score).toBe(0.95);
    expect(results[1]!.chunkId).toBe('c2');
    expect(results[1]!.score).toBe(0.8);
  });

  it('passes filter params to RPC', async () => {
    rpcSpy.mockResolvedValue({ data: [], error: null });

    await store.query([0.1, 0.2], 5, { manufacturer: 'ST', mpn: 'STM32' });

    expect(rpcSpy).toHaveBeenCalledWith(
      'match_documents',
      expect.objectContaining({
        query_embedding: [0.1, 0.2],
        match_count: 5,
        filter_manufacturer: 'ST',
        filter_mpn: 'STM32',
      }),
    );
  });

  it('returns empty array when RPC returns null data', async () => {
    rpcSpy.mockResolvedValue({ data: null, error: null });
    const results = await store.query([0.1], 5);
    expect(results).toHaveLength(0);
  });

  it('throws on query error', async () => {
    rpcSpy.mockResolvedValue({ data: null, error: { message: 'RPC fail' } });
    await expect(store.query([0.1], 5)).rejects.toThrow('SupabaseVectorStore.query failed');
  });

  it('deletes an embedding by chunkId', async () => {
    chain.delete.mockReturnValue(chain);
    chain.eq.mockReturnValue({
      then: (cb: (v: unknown) => unknown) => Promise.resolve({ data: null, error: null }).then(cb),
    });

    await store.delete('c1');
    expect(client.from).toHaveBeenCalledWith('embeddings');
  });

  it('throws on delete error', async () => {
    chain.delete.mockReturnValue(chain);
    chain.eq.mockReturnValue({
      then: (cb: (v: unknown) => unknown) =>
        Promise.resolve({ data: null, error: { message: 'fail' } }).then(cb),
    });

    await expect(store.delete('c1')).rejects.toThrow('SupabaseVectorStore.delete failed');
  });
});

describe('createStoreFactory', () => {
  it('returns memory stores when no config or env vars', { timeout: 15000 }, async () => {
    const originalUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const originalKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;

    const { createStoreFactory } = await import('../storage/factory.js');
    const factory = createStoreFactory();
    const stores = factory.create();

    const { MemoryDocumentStore, MemoryChunkStore, MemoryVectorStore } =
      await import('../storage/memory-store.js');
    expect(stores.documents).toBeInstanceOf(MemoryDocumentStore);
    expect(stores.chunks).toBeInstanceOf(MemoryChunkStore);
    expect(stores.vectors).toBeInstanceOf(MemoryVectorStore);

    process.env.NEXT_PUBLIC_SUPABASE_URL = originalUrl;
    process.env.SUPABASE_SERVICE_ROLE_KEY = originalKey;
  });

  it('returns Supabase stores when config provided', async () => {
    const { createStoreFactory } = await import('../storage/factory.js');
    const { SupabaseDocumentStore } = await import('../storage/supabase-document-store.js');
    const { SupabaseChunkStore } = await import('../storage/supabase-chunk-store.js');
    const { SupabaseVectorStore } = await import('../storage/supabase-vector-store.js');

    const factory = createStoreFactory({
      supabaseUrl: 'https://test.supabase.co',
      supabaseKey: 'test-key',
      projectId: 'proj-1',
    });
    const stores = factory.create();

    expect(stores.documents).toBeInstanceOf(SupabaseDocumentStore);
    expect(stores.chunks).toBeInstanceOf(SupabaseChunkStore);
    expect(stores.vectors).toBeInstanceOf(SupabaseVectorStore);
  });
});

describe('createStores', () => {
  it('returns memory stores without config', async () => {
    const originalUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const originalKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;

    const { createStores } = await import('../storage/factory.js');
    const stores = createStores();

    const { MemoryDocumentStore } = await import('../storage/memory-store.js');
    expect(stores.documents).toBeInstanceOf(MemoryDocumentStore);

    process.env.NEXT_PUBLIC_SUPABASE_URL = originalUrl;
    process.env.SUPABASE_SERVICE_ROLE_KEY = originalKey;
  });
});
