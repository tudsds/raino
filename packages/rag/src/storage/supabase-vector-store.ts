// ── Supabase Vector Store ──────────────────────────────────────────────────────
// Production VectorStore backed by Supabase pgvector. Uses match_documents()
// RPC for HNSW similarity search instead of brute-force cosine.

import type { SupabaseClient } from '@supabase/supabase-js';
import type { EmbeddingRecord, ChunkMetadata } from './types';
import type { VectorStore } from './interfaces';

interface EmbeddingRow {
  id: string;
  chunk_id: string;
  model: string;
  dimensions: number;
  embedding: number[];
  generated_at: number;
  project_id: string | null;
}

function toRow(record: EmbeddingRecord, projectId?: string): EmbeddingRow {
  return {
    id: record.id,
    chunk_id: record.chunkId,
    model: record.model,
    dimensions: record.dimensions,
    embedding: record.vector,
    generated_at: record.generatedAt,
    project_id: projectId ?? null,
  };
}

interface MatchResult {
  chunk_id: string;
  similarity: number;
}

export class SupabaseVectorStore implements VectorStore {
  constructor(
    private readonly client: SupabaseClient,
    private readonly projectId?: string,
  ) {}

  async storeEmbedding(record: EmbeddingRecord): Promise<void> {
    const row = toRow(record, this.projectId);
    const { error } = await this.client.from('embeddings').upsert(row, { onConflict: 'id' });
    if (error) {
      throw new Error(`SupabaseVectorStore.storeEmbedding failed: ${error.message}`);
    }
  }

  async query(
    vector: number[],
    topK: number,
    filter?: Partial<ChunkMetadata>,
  ): Promise<Array<{ chunkId: string; score: number }>> {
    const rpcArgs: Record<string, unknown> = {
      query_embedding: vector,
      match_count: topK,
    };
    if (this.projectId) {
      rpcArgs.project_id = this.projectId;
    }
    if (filter) {
      if (filter.manufacturer !== undefined) {
        rpcArgs.filter_manufacturer = filter.manufacturer;
      }
      if (filter.mpn !== undefined) {
        rpcArgs.filter_mpn = filter.mpn;
      }
      if (filter.documentType !== undefined) {
        rpcArgs.filter_document_type = filter.documentType;
      }
    }

    const { data, error } = await this.client.rpc('match_documents', rpcArgs);
    if (error) {
      throw new Error(`SupabaseVectorStore.query failed: ${error.message}`);
    }
    if (!data) return [];

    return (data as MatchResult[]).map((row) => ({
      chunkId: row.chunk_id,
      score: row.similarity,
    }));
  }

  async delete(chunkId: string): Promise<void> {
    let query = this.client.from('embeddings').delete().eq('chunk_id', chunkId);
    if (this.projectId) {
      query = query.eq('project_id', this.projectId);
    }
    const { error } = await query;
    if (error) {
      throw new Error(`SupabaseVectorStore.delete failed: ${error.message}`);
    }
  }
}
