import type { KicadWorkerClient } from './interface';
import type { DesignJob, DesignJobResult, DesignJobType } from '../contracts/jobs';

const SIMULATED_DURATION_MS = 150;

function generateId(): string {
  return `job_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

function mockOutputFiles(type: DesignJobType, outputPath?: string): string[] {
  const base = outputPath ?? '/tmp/kicad-output';
  switch (type) {
    case 'export_schematic_pdf':
      return [`${base}/schematic.pdf`];
    case 'export_schematic_svg':
      return [`${base}/schematic.svg`];
    case 'export_netlist':
      return [`${base}/netlist.net`];
    case 'export_pcb_svg':
      return [`${base}/pcb.svg`];
    case 'export_pcb_glb':
      return [`${base}/pcb.glb`];
    case 'export_gerbers':
      return [
        `${base}/front.gbr`,
        `${base}/back.gbr`,
        `${base}/silkscreen-front.gbr`,
        `${base}/silkscreen-back.gbr`,
        `${base}/soldermask-front.gbr`,
        `${base}/soldermask-back.gbr`,
      ];
    case 'export_pos':
      return [`${base}/pos.csv`];
    case 'export_ipc2581':
      return [`${base}/ipc2581.xml`];
    case 'export_odb':
      return [`${base}/odb/`];
    case 'export_bom':
      return [`${base}/bom.csv`];
    default:
      return [];
  }
}

function mockStdout(type: DesignJobType): string {
  switch (type) {
    case 'run_erc':
      return 'ERC report: 0 errors, 0 warnings\n ERC OK';
    case 'run_drc':
      return 'DRC report: 0 errors, 0 unconnected pads\n DRC OK';
    case 'generate_project':
      return 'Project generated successfully';
    default:
      return `Export completed: ${type}`;
  }
}

export class MockKicadWorkerClient implements KicadWorkerClient {
  private jobs = new Map<string, DesignJob>();

  async submitJob(job: Omit<DesignJob, 'id' | 'status' | 'createdAt'>): Promise<DesignJob> {
    const now = Date.now();
    const id = generateId();

    const result: DesignJobResult = {
      exitCode: 0,
      stdout: mockStdout(job.type),
      stderr: '',
      outputFiles: mockOutputFiles(job.type, job.outputPath),
      duration: SIMULATED_DURATION_MS,
    };

    const designJob: DesignJob = {
      ...job,
      id,
      status: 'completed',
      createdAt: now,
      startedAt: now,
      completedAt: now + SIMULATED_DURATION_MS,
      result,
    };

    this.jobs.set(id, designJob);
    return designJob;
  }

  async getJobStatus(jobId: string): Promise<DesignJob> {
    const job = this.jobs.get(jobId);
    if (!job) {
      throw new Error(`Job not found: ${jobId}`);
    }
    return job;
  }

  async getJobResult(jobId: string): Promise<DesignJobResult> {
    const job = await this.getJobStatus(jobId);
    if (!job.result) {
      throw new Error(`Job has no result: ${jobId}`);
    }
    return job.result;
  }

  async listJobs(projectId: string): Promise<DesignJob[]> {
    const all = Array.from(this.jobs.values());
    return all.filter((j) => j.projectId === projectId);
  }

  async cancelJob(jobId: string): Promise<void> {
    const job = this.jobs.get(jobId);
    if (!job) {
      throw new Error(`Job not found: ${jobId}`);
    }
    if (job.status === 'completed') {
      throw new Error(`Cannot cancel completed job: ${jobId}`);
    }
    this.jobs.set(jobId, {
      ...job,
      status: 'failed',
      error: 'Cancelled by user',
      completedAt: Date.now(),
    });
  }

  async isAvailable(): Promise<boolean> {
    return true;
  }
}
