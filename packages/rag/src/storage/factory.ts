// ── Store Factory ──────────────────────────────────────────────────────────────
// Returns Supabase-backed or in-memory stores based on environment config.
// Supabase client is loaded lazily so test environments never need the dep.

import { createClient } from '@supabase/supabase-js';
import type { DocumentStore, ChunkStore, VectorStore } from './interfaces';
import { MemoryDocumentStore, MemoryChunkStore, MemoryVectorStore } from './memory-store';
import { SupabaseDocumentStore } from './supabase-document-store';
import { SupabaseChunkStore } from './supabase-chunk-store';
import { SupabaseVectorStore } from './supabase-vector-store';

export interface StoreSet {
  documents: DocumentStore;
  chunks: ChunkStore;
  vectors: VectorStore;
}

export interface StoreFactory {
  create(): StoreSet;
}

class MemoryStoreFactory implements StoreFactory {
  create(): StoreSet {
    return {
      documents: new MemoryDocumentStore(),
      chunks: new MemoryChunkStore(),
      vectors: new MemoryVectorStore(),
    };
  }
}

class SupabaseStoreFactory implements StoreFactory {
  private readonly client;
  private readonly projectId?: string;

  constructor(url: string, key: string, projectId?: string) {
    this.client = createClient(url, key);
    this.projectId = projectId;
  }

  create(): StoreSet {
    return {
      documents: new SupabaseDocumentStore(this.client, this.projectId),
      chunks: new SupabaseChunkStore(this.client, this.projectId),
      vectors: new SupabaseVectorStore(this.client, this.projectId),
    };
  }
}

export function createStoreFactory(config?: {
  supabaseUrl?: string;
  supabaseKey?: string;
  projectId?: string;
}): StoreFactory {
  const url = config?.supabaseUrl ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = config?.supabaseKey ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
  const projectId = config?.projectId;

  if (url && key) {
    return new SupabaseStoreFactory(url, key, projectId);
  }

  return new MemoryStoreFactory();
}

export function createStores(config?: {
  supabaseUrl?: string;
  supabaseKey?: string;
  projectId?: string;
}): StoreSet {
  return createStoreFactory(config).create();
}
