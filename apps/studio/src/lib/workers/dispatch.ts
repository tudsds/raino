import { getSupabaseAdmin, type Json } from '@/lib/db/supabase-admin';

export interface DispatchResult {
  jobId: string;
  status: 'queued';
  triggered: boolean;
}

/**
 * Queue a design job by inserting a pending row into `design_jobs`, then
 * (best-effort) fire a GitHub `repository_dispatch` so the
 * `design-worker.yml` workflow claims and runs it on a runner with
 * `kicad-cli` installed.
 *
 * Env required for the dispatch:
 *   GITHUB_DISPATCH_TOKEN  — PAT with `repo` scope (or fine-grained with
 *                             Actions: Write + Contents: Read)
 *   GITHUB_REPO            — `owner/repo`, defaults to `tudsds/raino`
 *
 * If the env vars aren't set we still queue the row — the job can be
 * dispatched manually via `workflow_dispatch` from the Actions UI.
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

  const triggered = await triggerGitHubWorkflow(job.id, projectId, jobType);

  return { jobId: job.id, status: 'queued', triggered };
}

async function triggerGitHubWorkflow(
  jobId: string,
  projectId: string,
  jobType: string,
): Promise<boolean> {
  const token = process.env.GITHUB_DISPATCH_TOKEN;
  const repo = process.env.GITHUB_REPO ?? 'tudsds/raino';
  if (!token) {
    console.warn(
      '[dispatch] GITHUB_DISPATCH_TOKEN not set — job queued but not dispatched',
    );
    return false;
  }

  try {
    const res = await fetch(`https://api.github.com/repos/${repo}/dispatches`, {
      method: 'POST',
      headers: {
        Accept: 'application/vnd.github+json',
        Authorization: `Bearer ${token}`,
        'X-GitHub-Api-Version': '2022-11-28',
      },
      body: JSON.stringify({
        event_type: 'design-job',
        client_payload: { job_id: jobId, project_id: projectId, job_type: jobType },
      }),
    });
    if (!res.ok) {
      const body = await res.text();
      console.error('[dispatch] GitHub dispatch failed', res.status, body);
      return false;
    }
    return true;
  } catch (err) {
    console.error('[dispatch] GitHub dispatch threw', err);
    return false;
  }
}
