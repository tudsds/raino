import { describe, it, expect, vi } from 'vitest';
import { executeJob, pollAndExecuteJob, type JobInput, type JobType } from '../queue/worker.js';

interface MockDesignJob {
  id: string;
  projectId: string;
  jobType: string;
  status: string;
  progress: bigint;
  result: Record<string, unknown> | null;
  error: string | null;
  workerId: string | null;
  createdAt: Date;
  startedAt: Date | null;
  completedAt: Date | null;
}

function makeDesignJob(overrides: Partial<MockDesignJob> = {}): MockDesignJob {
  return {
    id: overrides.id ?? 'job-1',
    projectId: overrides.projectId ?? 'project-1',
    jobType: overrides.jobType ?? 'generate',
    status: overrides.status ?? 'pending',
    progress: overrides.progress ?? BigInt(0),
    result: overrides.result ?? null,
    error: overrides.error ?? null,
    workerId: overrides.workerId ?? null,
    createdAt: overrides.createdAt ?? new Date(),
    startedAt: overrides.startedAt ?? null,
    completedAt: overrides.completedAt ?? null,
  };
}

describe('executeJob', () => {
  it('returns error for generate job without request', async () => {
    const input: JobInput = { type: 'generate', projectId: 'test' };
    const result = await executeJob(input);
    expect(result.success).toBe(false);
    expect(result.error).toContain('Missing generateRequest');
  });

  it('returns error for validate job without projectPath', async () => {
    const input: JobInput = { type: 'validate', projectId: 'test' };
    const result = await executeJob(input);
    expect(result.success).toBe(false);
    expect(result.error).toContain('Missing projectPath');
  });

  it('returns error for export job without format', async () => {
    const input: JobInput = { type: 'export', projectId: 'test', projectPath: '/tmp/test' };
    const result = await executeJob(input);
    expect(result.success).toBe(false);
    expect(result.error).toContain('Missing projectPath, format, or outputPath');
  });

  it('returns error for unknown job type', async () => {
    const input = { type: 'bogus' as JobType, projectId: 'test' };
    const result = await executeJob(input);
    expect(result.success).toBe(false);
    expect(result.error).toContain('Unknown job type');
  });
});

describe('pollAndExecuteJob', () => {
  it('does nothing when no pending jobs', async () => {
    const findPending = vi.fn().mockResolvedValue(null);
    const updateJob = vi.fn();

    await pollAndExecuteJob(findPending, updateJob);

    expect(findPending).toHaveBeenCalledOnce();
    expect(updateJob).not.toHaveBeenCalled();
  });

  it('updates job to running then completed for successful generate', async () => {
    const job = makeDesignJob({
      result: {
        type: 'generate',
        projectId: 'test',
        generateRequest: {
          projectId: 'test',
          projectName: 'TestProject',
          bom: [
            {
              reference: 'U1',
              value: 'STM32',
              mpn: 'STM32F407',
              footprint: 'QFP',
              symbol: 'MCU',
              manufacturer: 'ST',
              quantity: 1,
            },
          ],
          architecture: {
            name: 'test',
            processorType: 'arm',
            powerTopology: 'buck',
            interfaceSet: [],
            referenceTopology: {},
          },
        },
      },
    });

    const findPending = vi.fn().mockResolvedValue(job);
    const updates: Array<{ id: string; data: Partial<MockDesignJob> }> = [];
    const updateJob = vi.fn().mockImplementation((id: string, data: Partial<MockDesignJob>) => {
      updates.push({ id, data });
    });

    await pollAndExecuteJob(findPending, updateJob);

    expect(findPending).toHaveBeenCalledOnce();
    expect(updateJob).toHaveBeenCalledTimes(2);
    expect(updates[0]!.data.status).toBe('running');
    expect(updates[1]!.data.status).toBe('completed');
  });

  it('updates job to failed for failed job', async () => {
    const job = makeDesignJob({
      result: { type: 'validate', projectId: 'test' },
    });

    const findPending = vi.fn().mockResolvedValue(job);
    const updates: Array<{ id: string; data: Partial<MockDesignJob> }> = [];
    const updateJob = vi.fn().mockImplementation((id: string, data: Partial<MockDesignJob>) => {
      updates.push({ id, data });
    });

    await pollAndExecuteJob(findPending, updateJob);

    expect(updates[1]!.data.status).toBe('failed');
  });
});
