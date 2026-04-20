import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the admin client before importing the queries module so it picks up
// the mock instead of trying to build a real Supabase client at import time.
const mockFrom = vi.fn();
vi.mock('@/lib/db/supabase-admin', () => ({
  getSupabaseAdmin: () => ({ from: mockFrom }),
}));

import { verifyProjectOwnership, getUserOrgId } from '../project-queries';

type QueryResult<T> = { data: T | null; error: { message: string } | null };

function singleResult<T>(value: T | null): QueryResult<T> {
  return { data: value, error: null };
}

function arrayResult<T>(rows: T[]): { data: T[] | null; error: { message: string } | null } {
  return { data: rows, error: null };
}

// Build a chainable query-builder stub that resolves to the provided terminator.
function qb(terminalKey: 'maybeSingle' | 'then', terminalValue: unknown) {
  const chain: any = {
    select: () => chain,
    eq: () => chain,
    in: () => chain,
    order: () => chain,
    limit: () => chain,
  };
  if (terminalKey === 'maybeSingle') {
    chain.maybeSingle = vi.fn().mockResolvedValue(terminalValue);
  } else {
    chain.then = (resolve: any) => Promise.resolve(terminalValue).then(resolve);
  }
  return chain;
}

beforeEach(() => {
  mockFrom.mockReset();
});

describe('verifyProjectOwnership', () => {
  const userId = 'supabase-user-123';
  const projectId = 'project-456';
  const orgId = 'org-789';

  it('returns authorized:false when user not found', async () => {
    mockFrom.mockImplementation((table: string) => {
      if (table === 'users') return qb('maybeSingle', singleResult(null));
      throw new Error('unexpected table ' + table);
    });

    const result = await verifyProjectOwnership(projectId, userId);
    expect(result).toEqual({ authorized: false });
  });

  it('returns authorized:false when user has no memberships', async () => {
    mockFrom.mockImplementation((table: string) => {
      if (table === 'users') return qb('maybeSingle', singleResult({ id: 'db-user-1' }));
      if (table === 'organization_members') return qb('then', arrayResult([]));
      throw new Error('unexpected table ' + table);
    });

    const result = await verifyProjectOwnership(projectId, userId);
    expect(result).toEqual({ authorized: false });
  });

  it('returns authorized:false when project not in user org', async () => {
    mockFrom.mockImplementation((table: string) => {
      if (table === 'users') return qb('maybeSingle', singleResult({ id: 'db-user-1' }));
      if (table === 'organization_members')
        return qb('then', arrayResult([{ organization_id: 'other-org' }]));
      if (table === 'projects') return qb('maybeSingle', singleResult(null));
      throw new Error('unexpected table ' + table);
    });

    const result = await verifyProjectOwnership(projectId, userId);
    expect(result).toEqual({ authorized: false });
  });

  it('returns authorized:true with project when user owns it', async () => {
    const project = {
      id: projectId,
      name: 'Owned Project',
      description: null,
      status: 'intake',
      organization_id: orgId,
      current_step: 1,
      total_steps: 12,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    mockFrom.mockImplementation((table: string) => {
      if (table === 'users') return qb('maybeSingle', singleResult({ id: 'db-user-1' }));
      if (table === 'organization_members')
        return qb('then', arrayResult([{ organization_id: orgId }]));
      if (table === 'projects') return qb('maybeSingle', singleResult(project));
      // fetchProjectRelations follows up with many other tables; all empty is fine.
      return qb('then', arrayResult([]));
    });

    const result = await verifyProjectOwnership(projectId, userId);
    if (!result.authorized) throw new Error('expected authorized:true');
    expect(result.authorized).toBe(true);
    expect(result.project.id).toBe(projectId);
    expect(result.project.organization_id).toBe(orgId);
  });
});

describe('getUserOrgId', () => {
  it('returns the first org id when user has a membership', async () => {
    mockFrom.mockImplementation((table: string) => {
      if (table === 'users') return qb('maybeSingle', singleResult({ id: 'db-user-1' }));
      if (table === 'organization_members')
        return qb('maybeSingle', singleResult({ organization_id: 'org-abc' }));
      throw new Error('unexpected table ' + table);
    });

    const result = await getUserOrgId('supabase-user-1');
    expect(result).toBe('org-abc');
  });

  it('returns null when user not found', async () => {
    mockFrom.mockImplementation((table: string) => {
      if (table === 'users') return qb('maybeSingle', singleResult(null));
      throw new Error('unexpected table ' + table);
    });

    const result = await getUserOrgId('nonexistent');
    expect(result).toBeNull();
  });

  it('returns null when user has no memberships', async () => {
    mockFrom.mockImplementation((table: string) => {
      if (table === 'users') return qb('maybeSingle', singleResult({ id: 'db-user-1' }));
      if (table === 'organization_members') return qb('maybeSingle', singleResult(null));
      throw new Error('unexpected table ' + table);
    });

    const result = await getUserOrgId('supabase-user-2');
    expect(result).toBeNull();
  });
});
