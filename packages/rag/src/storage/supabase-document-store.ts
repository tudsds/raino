// ── Supabase Document Store ────────────────────────────────────────────────────
// Production DocumentStore backed by Supabase Postgres. Scopes queries by
// project_id when provided, enabling multi-tenant isolation.

import type { SupabaseClient } from '@supabase/supabase-js';
import type { DocumentRecord } from './types';
import type { DocumentStore } from './interfaces';

/** Row shape stored in the `documents` Supabase table. */
interface DocumentRow {
  id: string;
  project_id: string | null;
  source_url: string;
  source_type: string;
  manufacturer: string;
  part_family: string | null;
  mpn: string | null;
  revision: string | null;
  fetch_timestamp: number;
  checksum: string | null;
  trust_level: string;
  normalized_text: string | null;
  metadata: Record<string, unknown>;
}

function toRow(doc: DocumentRecord, projectId?: string): DocumentRow {
  return {
    id: doc.id,
    project_id: projectId ?? null,
    source_url: doc.sourceUrl,
    source_type: doc.sourceType,
    manufacturer: doc.manufacturer,
    part_family: doc.partFamily ?? null,
    mpn: doc.mpn ?? null,
    revision: doc.revision ?? null,
    fetch_timestamp: doc.fetchTimestamp,
    checksum: doc.checksum ?? null,
    trust_level: doc.trustLevel,
    normalized_text: doc.normalizedText ?? null,
    metadata: doc.metadata,
  };
}

function toRecord(row: DocumentRow): DocumentRecord {
  return {
    id: row.id,
    sourceUrl: row.source_url,
    sourceType: row.source_type as DocumentRecord['sourceType'],
    manufacturer: row.manufacturer,
    partFamily: row.part_family ?? undefined,
    mpn: row.mpn ?? undefined,
    revision: row.revision ?? undefined,
    fetchTimestamp: row.fetch_timestamp,
    checksum: row.checksum ?? undefined,
    trustLevel: row.trust_level as DocumentRecord['trustLevel'],
    normalizedText: row.normalized_text ?? undefined,
    metadata: row.metadata,
  };
}

export class SupabaseDocumentStore implements DocumentStore {
  constructor(
    private readonly client: SupabaseClient,
    private readonly projectId?: string,
  ) {}

  async store(doc: DocumentRecord): Promise<void> {
    const row = toRow(doc, this.projectId);
    const { error } = await this.client.from('documents').upsert(row, { onConflict: 'id' });
    if (error) {
      throw new Error(`SupabaseDocumentStore.store failed: ${error.message}`);
    }
  }

  async get(id: string): Promise<DocumentRecord | null> {
    let query = this.client.from('documents').select('*').eq('id', id);
    if (this.projectId) {
      query = query.eq('project_id', this.projectId);
    }
    const { data, error } = await query.maybeSingle();
    if (error) {
      throw new Error(`SupabaseDocumentStore.get failed: ${error.message}`);
    }
    if (!data) return null;
    return toRecord(data as DocumentRow);
  }

  async query(filter: Partial<DocumentRecord>): Promise<DocumentRecord[]> {
    let query = this.client.from('documents').select('*');
    if (this.projectId) {
      query = query.eq('project_id', this.projectId);
    }
    if (filter.id !== undefined) query = query.eq('id', filter.id);
    if (filter.sourceType !== undefined) query = query.eq('source_type', filter.sourceType);
    if (filter.manufacturer !== undefined) query = query.eq('manufacturer', filter.manufacturer);
    if (filter.mpn !== undefined) query = query.eq('mpn', filter.mpn);
    if (filter.partFamily !== undefined) query = query.eq('part_family', filter.partFamily);
    if (filter.trustLevel !== undefined) query = query.eq('trust_level', filter.trustLevel);
    if (filter.sourceUrl !== undefined) query = query.eq('source_url', filter.sourceUrl);

    const { data, error } = await query;
    if (error) {
      throw new Error(`SupabaseDocumentStore.query failed: ${error.message}`);
    }
    if (!data) return [];
    return (data as DocumentRow[]).map(toRecord);
  }

  async delete(id: string): Promise<void> {
    let query = this.client.from('documents').delete().eq('id', id);
    if (this.projectId) {
      query = query.eq('project_id', this.projectId);
    }
    const { error } = await query;
    if (error) {
      throw new Error(`SupabaseDocumentStore.delete failed: ${error.message}`);
    }
  }
}
