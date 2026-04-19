import { generateKiCadProject } from '../generator/project';
import { runValidationAsync } from '../validator/engine';
import { runExportAsync } from '../exporter/engine';
import { generateArtifactManifest, uploadArtifactsToStorage } from '../artifacts/manifest';
import type { ArtifactManifest } from '../artifacts/manifest';
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
  manifest?: ArtifactManifest;
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

const STORAGE_BUCKET = 'design-artifacts';

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
      let manifest: ArtifactManifest | undefined;
      if (result.success && result.outputFiles.length > 0) {
        try {
          manifest = await generateArtifactManifest(input.projectId, result.outputFiles);
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
        manifest,
      };
    }

    default:
      return { success: false, error: `Unknown job type: ${String(input.type)}` };
  }
}

async function persistArtifactsToStorage(
  projectId: string,
  manifest: ArtifactManifest,
): Promise<void> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  const hasCredentials = supabaseUrl && supabaseKey;

  let uploadEntries: Array<{ fileName: string; storagePath: string; success: boolean }> = [];
  if (hasCredentials) {
    try {
      const uploadResult = await uploadArtifactsToStorage(
        manifest,
        STORAGE_BUCKET,
        supabaseUrl,
        supabaseKey,
      );
      uploadEntries = uploadResult.entries;
    } catch {
      // Upload failed entirely — artifacts will be stored as local-only
    }
  }

  const { prisma } = await import('@raino/db');

  const uploadSuccessMap = new Map(uploadEntries.map((e) => [e.fileName, e.success]));

  for (const entry of manifest.entries) {
    const wasUploaded = uploadSuccessMap.get(entry.fileName) ?? false;
    const storagePath = `${projectId}/${entry.fileName}`;

    await prisma.designArtifact.create({
      data: {
        projectId,
        artifactType: entry.artifactType,
        filePath: entry.filePath,
        fileName: entry.fileName,
        fileSize: entry.fileSize,
        checksum: entry.checksum,
        mimeType: entry.mimeType,
        storageBucket: wasUploaded ? STORAGE_BUCKET : '',
        storageKey: wasUploaded ? storagePath : '',
        metadata: {
          manifestId: manifest.id,
          checksumAlgorithm: entry.checksumAlgorithm,
          generatedAt: entry.generatedAt,
          ...entry.metadata,
        },
      },
    });
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

    if (result.success && result.manifest) {
      try {
        await persistArtifactsToStorage(job.projectId, result.manifest);
      } catch {
        // Artifact persistence is best-effort and must not fail the overall job.
        // The design was generated successfully; storage upload can be retried later.
      }
    }

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
