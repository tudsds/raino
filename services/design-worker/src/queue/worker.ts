import { generateKiCadProject } from '../generator/project';
import { runValidationAsync } from '../validator/engine';
import { runExportAsync } from '../exporter/engine';
import { generateArtifactManifest } from '../artifacts/manifest';
import type { ProjectGenerationRequest, ExportFormat } from '../index';

export type JobType = 'generate' | 'validate' | 'export';

export interface JobInput {
  type: JobType;
  projectId: string;
  generateRequest?: ProjectGenerationRequest;
  projectPath?: string;
  checks?: ('erc' | 'drc')[];
  format?: ExportFormat;
  outputPath?: string;
}

export interface JobResult {
  success: boolean;
  output?: unknown;
  error?: string;
  artifactCount?: number;
}

interface PendingJob {
  id: string;
  projectId: string;
  result: Record<string, unknown> | null;
  [key: string]: unknown;
}

interface JobUpdate {
  status?: string;
  startedAt?: Date | null;
  completedAt?: Date | null;
  progress?: number;
  result?: unknown;
  error?: string | null;
  [key: string]: unknown;
}

async function executeJob(input: JobInput): Promise<JobResult> {
  switch (input.type) {
    case 'generate': {
      if (!input.generateRequest) {
        return { success: false, error: 'Missing generateRequest for generate job' };
      }
      const result = generateKiCadProject(input.generateRequest);
      return {
        success: result.success,
        output: result,
        error: result.errors.join('; ') || undefined,
      };
    }

    case 'validate': {
      if (!input.projectPath) {
        return { success: false, error: 'Missing projectPath for validate job' };
      }
      const checks = input.checks ?? ['erc', 'drc'];
      const results = await runValidationAsync({
        projectId: input.projectId,
        projectPath: input.projectPath,
        checks,
      });
      const allPassed = results.every((r) => r.passed);
      return {
        success: allPassed,
        output: results,
        error: allPassed
          ? undefined
          : results.flatMap((r) => r.violations.map((v) => v.message)).join('; '),
      };
    }

    case 'export': {
      if (!input.projectPath || !input.format || !input.outputPath) {
        return {
          success: false,
          error: 'Missing projectPath, format, or outputPath for export job',
        };
      }
      const result = await runExportAsync({
        projectId: input.projectId,
        projectPath: input.projectPath,
        format: input.format,
        outputPath: input.outputPath,
      });

      let artifactCount = 0;
      if (result.success && result.outputFiles.length > 0) {
        try {
          const manifest = await generateArtifactManifest(input.projectId, result.outputFiles);
          artifactCount = manifest.totalFiles;
        } catch {
          artifactCount = result.outputFiles.length;
        }
      }

      return {
        success: result.success,
        output: result,
        error: result.errors.join('; ') || undefined,
        artifactCount,
      };
    }

    default:
      return { success: false, error: `Unknown job type: ${String(input.type)}` };
  }
}

export async function pollAndExecuteJob(
  findPending: () => Promise<PendingJob | null>,
  updateJob: (id: string, data: JobUpdate) => Promise<void>,
): Promise<void> {
  const job = await findPending();
  if (!job) return;

  await updateJob(job.id, {
    status: 'running',
    startedAt: new Date(),
  });

  try {
    const input = (job.result ?? {}) as unknown as JobInput;
    input.projectId = job.projectId;
    const result = await executeJob(input);

    await updateJob(job.id, {
      status: result.success ? 'completed' : 'failed',
      progress: result.success ? 100 : 0,
      result,
      error: result.error ?? null,
      completedAt: new Date(),
    });
  } catch (error) {
    await updateJob(job.id, {
      status: 'failed',
      error: error instanceof Error ? error.message : String(error),
      completedAt: new Date(),
    });
  }
}

export async function pollAndExecuteWithPrisma(): Promise<void> {
  const { prisma } = await import('@raino/db');

  const job = await prisma.designJob.findFirst({
    where: { status: 'pending' },
    orderBy: { createdAt: 'asc' },
  });

  if (!job) return;

  await prisma.designJob.update({
    where: { id: job.id },
    data: { status: 'running', startedAt: new Date() },
  });

  try {
    const input = (job.result ?? {}) as unknown as JobInput;
    input.projectId = job.projectId;
    const result = await executeJob(input);

    await prisma.designJob.update({
      where: { id: job.id },
      data: {
        status: result.success ? 'completed' : 'failed',
        progress: result.success ? 100 : 0,
        result: JSON.parse(JSON.stringify(result)),
        error: result.error ?? null,
        completedAt: new Date(),
      },
    });
  } catch (error) {
    await prisma.designJob.update({
      where: { id: job.id },
      data: {
        status: 'failed',
        error: error instanceof Error ? error.message : String(error),
        completedAt: new Date(),
      },
    });
  }
}

export { executeJob };
