/**
 * Artifact and design job queries using Supabase client directly.
 * Bypasses Prisma ORM to avoid the table name mapping issue.
 */
import { getSupabaseAdmin } from '@/lib/db/supabase-admin';
import type { DbDesignArtifact, DbDesignJob, DbHandoffRequest } from '@/lib/db/supabase-admin';

export async function getArtifacts(projectId: string, artifactType?: string) {
  const db = getSupabaseAdmin();
  let query = db
    .from('design_artifacts')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false });

  if (artifactType) {
    query = query.eq('artifact_type', artifactType);
  }

  const { data, error } = await query;
  if (error) throw new Error(`getArtifacts failed: ${error.message}`);
  return (data ?? []) as DbDesignArtifact[];
}

export async function createDesignJob(
  projectId: string,
  jobType: string,
  input?: Record<string, unknown>,
) {
  const db = getSupabaseAdmin();
  const { data, error } = await db
    .from('design_jobs')
    .insert({
      project_id: projectId,
      job_type: jobType,
      status: 'pending',
      result: input ?? null,
    })
    .select()
    .single();

  if (error) throw new Error(`createDesignJob failed: ${error.message}`);
  return data as DbDesignJob;
}

export async function getDesignJobs(projectId: string) {
  const db = getSupabaseAdmin();
  const { data, error } = await db
    .from('design_jobs')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false });

  if (error) throw new Error(`getDesignJobs failed: ${error.message}`);
  return (data ?? []) as DbDesignJob[];
}

export async function createHandoffRequest(
  projectId: string,
  data: {
    type: string;
    quantity: number;
    quoteId?: string;
    metadata?: Record<string, unknown>;
  },
) {
  const db = getSupabaseAdmin();
  const { data: handoff, error } = await db
    .from('handoff_requests')
    .insert({
      project_id: projectId,
      type: data.type,
      quantity: data.quantity,
      quote_id: data.quoteId ?? null,
      metadata: data.metadata ?? null,
    })
    .select()
    .single();

  if (error) throw new Error(`createHandoffRequest failed: ${error.message}`);
  return handoff as DbHandoffRequest;
}
