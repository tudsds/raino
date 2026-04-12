import type { AuditTrace, AuditTraceStore } from './logger';
import { InMemoryAuditTraceStore } from './logger';

function mapTraceToRow(trace: AuditTrace): Record<string, unknown> {
  return {
    id: trace.id,
    project_id: trace.projectId,
    category: trace.category,
    action: trace.action,
    actor: trace.actor,
    details: trace.details,
    severity: 'info',
    source: trace.source ?? null,
    created_at: new Date(trace.timestamp).toISOString(),
  };
}

function mapRowToTrace(row: Record<string, unknown>): AuditTrace {
  return {
    id: row.id as string,
    projectId: row.project_id as string,
    timestamp: new Date(row.created_at as string).getTime(),
    category: row.category as AuditTrace['category'],
    action: row.action as string,
    actor: ((row.actor as string) ?? 'system') as AuditTrace['actor'],
    details: (row.details as Record<string, unknown>) ?? {},
    source: (row.source as string) ?? undefined,
  };
}

export class SupabaseAuditTraceStore implements AuditTraceStore {
  private memoryFallback = new InMemoryAuditTraceStore();
  private supabaseUrl: string;
  private supabaseKey: string;
  private available: boolean;

  constructor() {
    this.supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
    this.supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';
    this.available = !!(this.supabaseUrl && this.supabaseKey);
  }

  private headers(): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      apikey: this.supabaseKey,
      Authorization: `Bearer ${this.supabaseKey}`,
    };
  }

  async append(trace: AuditTrace): Promise<void> {
    await this.memoryFallback.append(trace);
    if (!this.available) return;

    try {
      await fetch(`${this.supabaseUrl}/rest/v1/audit_entries`, {
        method: 'POST',
        headers: { ...this.headers(), Prefer: 'return=representation' },
        body: JSON.stringify([mapTraceToRow(trace)]),
      });
    } catch {
      // Memory fallback already has the trace — Supabase write is best-effort
    }
  }

  async query(
    projectId: string,
    options?: { category?: string; from?: number; to?: number },
  ): Promise<AuditTrace[]> {
    if (!this.available) {
      return this.memoryFallback.query(projectId, options);
    }

    try {
      const params = new URLSearchParams({
        select: '*',
        project_id: `eq.${projectId}`,
        order: 'created_at.asc',
      });
      if (options?.category) params.set('category', `eq.${options.category}`);
      if (options?.from) params.set('created_at', `gte.${new Date(options.from).toISOString()}`);
      if (options?.to) {
        const existing = params.get('created_at');
        const ltePart = `lte.${new Date(options.to).toISOString()}`;
        params.set('created_at', existing ? `${existing},${ltePart}` : ltePart);
      }

      const response = await fetch(`${this.supabaseUrl}/rest/v1/audit_entries?${params}`, {
        headers: this.headers(),
      });

      if (!response.ok) return this.memoryFallback.query(projectId, options);

      const data = await response.json();
      const rows: Record<string, unknown>[] = Array.isArray(data) ? data : [];
      if (rows.length === 0) return this.memoryFallback.query(projectId, options);

      return rows.map(mapRowToTrace).sort((a, b) => a.timestamp - b.timestamp);
    } catch {
      return this.memoryFallback.query(projectId, options);
    }
  }

  async getTrace(id: string): Promise<AuditTrace | null> {
    if (!this.available) {
      return this.memoryFallback.getTrace(id);
    }

    try {
      const params = new URLSearchParams({ select: '*', id: `eq.${id}`, limit: '1' });
      const response = await fetch(`${this.supabaseUrl}/rest/v1/audit_entries?${params}`, {
        headers: this.headers(),
      });

      if (!response.ok) return this.memoryFallback.getTrace(id);

      const data = await response.json();
      const rows: Record<string, unknown>[] = Array.isArray(data) ? data : [];
      if (rows.length === 0) return this.memoryFallback.getTrace(id);

      return mapRowToTrace(rows[0]!);
    } catch {
      return this.memoryFallback.getTrace(id);
    }
  }
}

export function createAuditTraceStore(): AuditTraceStore {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return url && key ? new SupabaseAuditTraceStore() : new InMemoryAuditTraceStore();
}
