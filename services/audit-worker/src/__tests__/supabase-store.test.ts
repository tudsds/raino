import { describe, it, expect, beforeEach } from 'vitest';
import { SupabaseAuditTraceStore, createAuditTraceStore } from '../traces/supabase-store';
import { InMemoryAuditTraceStore } from '../traces/logger';
import type { AuditTrace } from '../traces/logger';

function makeTrace(overrides: Partial<AuditTrace> = {}): AuditTrace {
  return {
    id: overrides.id ?? 'trace-1',
    projectId: overrides.projectId ?? 'project-1',
    timestamp: overrides.timestamp ?? Date.now(),
    category: overrides.category ?? 'spec',
    action: overrides.action ?? 'spec_created',
    actor: overrides.actor ?? 'system',
    details: overrides.details ?? {},
    source: overrides.source ?? 'agent',
    duration: overrides.duration,
  };
}

describe('SupabaseAuditTraceStore', () => {
  let store: SupabaseAuditTraceStore;

  beforeEach(() => {
    store = new SupabaseAuditTraceStore();
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  });

  it('appends and retrieves a trace via memory fallback', async () => {
    const trace = makeTrace();
    await store.append(trace);

    const retrieved = await store.getTrace('trace-1');
    expect(retrieved).not.toBeNull();
    expect(retrieved!.action).toBe('spec_created');
  });

  it('returns null for non-existent trace', async () => {
    const result = await store.getTrace('nonexistent');
    expect(result).toBeNull();
  });

  it('queries traces by projectId', async () => {
    await store.append(makeTrace({ id: 't1', projectId: 'proj-A' }));
    await store.append(makeTrace({ id: 't2', projectId: 'proj-A' }));
    await store.append(makeTrace({ id: 't3', projectId: 'proj-B' }));

    const results = await store.query('proj-A');
    expect(results).toHaveLength(2);
  });

  it('returns empty array for unknown projectId', async () => {
    const results = await store.query('nonexistent');
    expect(results).toHaveLength(0);
  });

  it('filters by category', async () => {
    await store.append(makeTrace({ id: 't1', projectId: 'p1', category: 'spec' }));
    await store.append(makeTrace({ id: 't2', projectId: 'p1', category: 'bom' }));

    const results = await store.query('p1', { category: 'spec' });
    expect(results).toHaveLength(1);
    expect(results[0]!.category).toBe('spec');
  });

  it('filters by time range', async () => {
    const now = Date.now();
    await store.append(makeTrace({ id: 't1', projectId: 'p1', timestamp: now - 2000 }));
    await store.append(makeTrace({ id: 't2', projectId: 'p1', timestamp: now - 1000 }));
    await store.append(makeTrace({ id: 't3', projectId: 'p1', timestamp: now }));

    const results = await store.query('p1', { from: now - 1500, to: now - 500 });
    expect(results).toHaveLength(1);
    expect(results[0]!.id).toBe('t2');
  });
});

describe('createAuditTraceStore', () => {
  beforeEach(() => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  });

  it('returns InMemoryAuditTraceStore when Supabase not configured', () => {
    const store = createAuditTraceStore();
    expect(store).toBeInstanceOf(InMemoryAuditTraceStore);
  });

  it('returns SupabaseAuditTraceStore when Supabase env vars are set', () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-key';

    const store = createAuditTraceStore();
    expect(store).toBeInstanceOf(SupabaseAuditTraceStore);

    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  });
});
