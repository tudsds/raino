import type { DesignJob, DesignJobResult } from '../contracts/jobs';

export interface KicadWorkerClient {
  submitJob(job: Omit<DesignJob, 'id' | 'status' | 'createdAt'>): Promise<DesignJob>;
  getJobStatus(jobId: string): Promise<DesignJob>;
  getJobResult(jobId: string): Promise<DesignJobResult>;
  listJobs(projectId: string): Promise<DesignJob[]>;
  cancelJob(jobId: string): Promise<void>;
  isAvailable(): Promise<boolean>;
}
