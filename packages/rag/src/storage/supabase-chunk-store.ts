// ── Supabase Chunk Store ───────────────────────────────────────────────────────
// Production ChunkStore backed by Supabase Postgres. Supports lookups by
// document ID, MPN, and arbitrary metadata filters.

import type { SupabaseClient } from '@supabase/supabase-js';
import type { ChunkRecord, ChunkMetadata } from './types.js';
import type { ChunkStore } from './interfaces.js';

interface ChunkRow {
  id: string;
  document_id: string;
  content: string;
  chunk_type: string;
  metadata: Record<string, unknown>;
  embedding: number[] | null;
}

function toRow(chunk: ChunkRecord): Omit<ChunkRow, 'embedding'> & { embedding: number[] | null } {
  return {
    id: chunk.id,
    document_id: chunk.documentId,
    content: chunk.content,
    chunk_type: chunk.chunkType,
    metadata: chunk.metadata as unknown as Record<string, unknown>,
    embedding: chunk.embedding ?? null,
  };
}

function toRecord(row: ChunkRow): ChunkRecord {
  const meta = row.metadata as unknown as ChunkMetadata;
  return {
    id: row.id,
    documentId: row.document_id,
    content: row.content,
    chunkType: row.chunk_type as ChunkRecord['chunkType'],
    metadata: meta,
    embedding: row.embedding ?? undefined,
  };
}

export class SupabaseChunkStore implements ChunkStore {
  constructor(
    private readonly client: SupabaseClient,
    private readonly projectId?: string,
  ) {}

  async store(chunk: ChunkRecord): Promise<void> {
    const row = toRow(chunk);
    const payload = {
      ...row,
      project_id: this.projectId ?? null,
    };
    const { error } = await this.client.from('chunks').upsert(payload, { onConflict: 'id' });
    if (error) {
      throw new Error(`SupabaseChunkStore.store failed: ${error.message}`);
    }
  }

  async get(id: string): Promise<ChunkRecord | null> {
    let query = this.client.from('chunks').select('*').eq('id', id);
    if (this.projectId) {
      query = query.eq('project_id', this.projectId);
    }
    const { data, error } = await query.maybeSingle();
    if (error) {
      throw new Error(`SupabaseChunkStore.get failed: ${error.message}`);
    }
    if (!data) return null;
    return toRecord(data as ChunkRow);
  }

  async queryByDocument(documentId: string): Promise<ChunkRecord[]> {
    let query = this.client.from('chunks').select('*').eq('document_id', documentId);
    if (this.projectId) {
      query = query.eq('project_id', this.projectId);
    }
    const { data, error } = await query;
    if (error) {
      throw new Error(`SupabaseChunkStore.queryByDocument failed: ${error.message}`);
    }
    if (!data) return [];
    return (data as ChunkRow[]).map(toRecord);
  }

  async queryByMpn(mpn: string): Promise<ChunkRecord[]> {
    let query = this.client.from('chunks').select('*');
    if (this.projectId) {
      query = query.eq('project_id', this.projectId);
    }
    const { data, error } = await query;
    if (error) {
      throw new Error(`SupabaseChunkStore.queryByMpn failed: ${error.message}`);
    }
    if (!data) return [];
    return (data as ChunkRow[])
      .filter((row) => (row.metadata as Record<string, unknown>).mpn === mpn)
      .map(toRecord);
  }

  async queryByFilter(filter: Partial<ChunkMetadata>): Promise<ChunkRecord[]> {
    let query = this.client.from('chunks').select('*');
    if (this.projectId) {
      query = query.eq('project_id', this.projectId);
    }
    // Apply column-backed filters directly
    if (filter.manufacturer !== undefined) {
      query = query.contains('metadata', { manufacturer: filter.manufacturer });
    }
    if (filter.mpn !== undefined) {
      query = query.contains('metadata', { mpn: filter.mpn });
    }
    if (filter.documentType !== undefined) {
      query = query.contains('metadata', { documentType: filter.documentType });
    }
    if (filter.trustLevel !== undefined) {
      query = query.contains('metadata', { trustLevel: filter.trustLevel });
    }
    const { data, error } = await query;
    if (error) {
      throw new Error(`SupabaseChunkStore.queryByFilter failed: ${error.message}`);
    }
    if (!data) return [];
    return (data as ChunkRow[]).map(toRecord);
  }

  async delete(id: string): Promise<void> {
    let query = this.client.from('chunks').delete().eq('id', id);
    if (this.projectId) {
      query = query.eq('project_id', this.projectId);
    }
    const { error } = await query;
    if (error) {
      throw new Error(`SupabaseChunkStore.delete failed: ${error.message}`);
    }
  }
}
