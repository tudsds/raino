import { prisma } from '@raino/db';
import type { Prisma } from '@raino/db';

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
  const job = await prisma.designJob.create({
    data: {
      projectId,
      jobType,
      status: 'pending',
      result: input as Prisma.InputJsonValue | undefined,
    },
  });

  return { jobId: job.id, status: 'queued' };
}
