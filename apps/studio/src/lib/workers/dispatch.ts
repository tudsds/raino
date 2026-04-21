import { getSupabaseAdmin, type Json } from '@/lib/db/supabase-admin';

export interface DispatchResult {
  jobId: string;
  status: 'queued';
}

/**
 * Queue a design job for async processing by inserting a pending record
 * into the `design_jobs` table. The design-worker service polls this table,
 * claims the job, and runs generation/validation/export.
 */
export async function dispatchDesignJob(
  projectId: string,
  jobType: string,
  input?: Record<string, unknown>,
): Promise<DispatchResult> {
  const db = getSupabaseAdmin();
  const { data: job, error } = await db
    .from('design_jobs')
    .insert({
      project_id: projectId,
      job_type: jobType,
      status: 'pending',
      result: (input ?? null) as Json | null,
    })
    .select('id')
    .single();

  if (error) throw new Error(`dispatchDesignJob failed: ${error.message}`);
  return { jobId: job.id, status: 'queued' };
}
