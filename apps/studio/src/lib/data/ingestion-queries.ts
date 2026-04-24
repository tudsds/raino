/**
 * Ingestion manifest queries using Supabase client directly.
 * Bypasses Prisma ORM to avoid the table name mapping issue.
 */
import { getSupabaseAdmin } from '@/lib/db/supabase-admin';
import type { DbIngestionManifest, Json } from '@/lib/db/supabase-admin';

export async function getIngestionManifest(projectId: string) {
  const db = getSupabaseAdmin();
  const { data, error } = await db
    .from('ingestion_manifests')
    .select('*')
    .eq('project_id', projectId)
    .maybeSingle();

  if (error) throw new Error(`getIngestionManifest failed: ${error.message}`);
  return data as DbIngestionManifest | null;
}

export async function createIngestionManifest(
  projectId: string,
  data: {
    status: string;
    candidateFamilies: Record<string, unknown>[];
    stages: Record<string, unknown>[];
  },
) {
  const db = getSupabaseAdmin();

  const existing = await getIngestionManifest(projectId);
  if (existing) {
    const { data: updated, error } = await db
      .from('ingestion_manifests')
      .update({
        status: data.status,
        candidate_families: data.candidateFamilies as unknown as Json,
        stages: data.stages as unknown as Json,
        updated_at: new Date().toISOString(),
      })
      .eq('id', existing.id)
      .select()
      .single();

    if (error) throw new Error(`updateIngestionManifest failed: ${error.message}`);
    return updated as DbIngestionManifest;
  }

  const { data: manifest, error } = await db
    .from('ingestion_manifests')
    .insert({
      project_id: projectId,
      status: data.status,
      candidate_families: data.candidateFamilies as unknown as Json,
      stages: data.stages as unknown as Json,
    })
    .select()
    .single();

  if (error) throw new Error(`createIngestionManifest failed: ${error.message}`);
  return manifest as DbIngestionManifest;
}

export async function updateIngestionStatus(projectId: string, status: string) {
  const db = getSupabaseAdmin();
  const { data, error } = await db
    .from('ingestion_manifests')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('project_id', projectId)
    .select()
    .single();

  if (error) throw new Error(`updateIngestionStatus failed: ${error.message}`);
  return data as DbIngestionManifest;
}

export async function updateIngestionSufficiencyReport(
  projectId: string,
  report: Record<string, unknown>,
) {
  const db = getSupabaseAdmin();
  const { data, error } = await db
    .from('ingestion_manifests')
    .update({ sufficiency_report: report as unknown as Json, updated_at: new Date().toISOString() })
    .eq('project_id', projectId)
    .select()
    .single();

  if (error) throw new Error(`updateIngestionSufficiencyReport failed: ${error.message}`);
  return data as DbIngestionManifest;
}
