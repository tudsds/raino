export type WorkerJobType =
  | 'ingest'
  | 'design_generate'
  | 'design_validate'
  | 'design_export'
  | 'quote_calculate'
  | 'audit_log';

export type WorkerJobStatus = 'pending' | 'running' | 'completed' | 'failed';

export interface WorkerJob {
  id: string;
  type: WorkerJobType;
  projectId: string;
  payload: Record<string, unknown>;
  status: WorkerJobStatus;
  createdAt: number;
  startedAt?: number;
  completedAt?: number;
  result?: Record<string, unknown>;
  error?: string;
}

export interface WorkerJobResult {
  jobId: string;
  status: 'completed' | 'failed';
  result?: Record<string, unknown>;
  error?: string;
  duration: number;
}

export interface WorkerQueueConfig {
  concurrency: number;
  retryLimit: number;
  retryDelayMs: number;
  jobTimeoutMs: number;
}
