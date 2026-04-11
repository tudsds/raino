export interface AuditTrace {
  id: string;
  projectId: string;
  timestamp: number;
  category:
    | 'intake'
    | 'spec'
    | 'architecture'
    | 'bom'
    | 'design'
    | 'validation'
    | 'export'
    | 'quote'
    | 'ingestion';
  action: string;
  actor: 'user' | 'system' | 'agent';
  details: Record<string, unknown>;
  source?: string;
  duration?: number;
}

export interface AuditTraceStore {
  append(trace: AuditTrace): Promise<void>;
  query(
    projectId: string,
    options?: { category?: string; from?: number; to?: number },
  ): Promise<AuditTrace[]>;
  getTrace(id: string): Promise<AuditTrace | null>;
}

export class InMemoryAuditTraceStore implements AuditTraceStore {
  private traces: Map<string, AuditTrace> = new Map();
  private projectIndex: Map<string, Set<string>> = new Map();

  async append(trace: AuditTrace): Promise<void> {
    this.traces.set(trace.id, trace);

    const existing = this.projectIndex.get(trace.projectId);
    if (existing) {
      existing.add(trace.id);
    } else {
      this.projectIndex.set(trace.projectId, new Set([trace.id]));
    }
  }

  async query(
    projectId: string,
    options?: { category?: string; from?: number; to?: number },
  ): Promise<AuditTrace[]> {
    const traceIds = this.projectIndex.get(projectId);
    if (!traceIds) return [];

    const results: AuditTrace[] = [];
    for (const id of traceIds) {
      const trace = this.traces.get(id);
      if (!trace) continue;

      if (options?.category && trace.category !== options.category) continue;
      if (options?.from && trace.timestamp < options.from) continue;
      if (options?.to && trace.timestamp > options.to) continue;

      results.push(trace);
    }

    return results.sort((a, b) => a.timestamp - b.timestamp);
  }

  async getTrace(id: string): Promise<AuditTrace | null> {
    return this.traces.get(id) ?? null;
  }
}
