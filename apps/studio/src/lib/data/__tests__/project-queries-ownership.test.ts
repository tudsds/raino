import { describe, it, expect, vi, beforeEach } from 'vitest';

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

// Chainable stub that terminates on either `.maybeSingle()` or thenable await.
// fetchProjectRelations awaits `db.from(...).select().eq(...).order(...)` directly
// and sometimes `...maybeSingle()`, so both must be supported.
function qb(
  maybeSingleValue: unknown | null = null,
  thenValue: unknown = arrayResult([]),
) {
  const chain: any = {};
  const passthrough = () => chain;
  chain.select = passthrough;
  chain.eq = passthrough;
  chain.in = passthrough;
  chain.order = passthrough;
  chain.limit = passthrough;
  chain.maybeSingle = vi.fn().mockResolvedValue(maybeSingleValue);
  chain.then = (resolve: any) => Promise.resolve(thenValue).then(resolve);
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
      if (table === 'users') return qb(singleResult(null));
      return qb(singleResult(null), arrayResult([]));
    });

    const result = await verifyProjectOwnership(projectId, userId);
    expect(result).toEqual({ authorized: false });
  });

  it('returns authorized:false when user has no memberships', async () => {
    mockFrom.mockImplementation((table: string) => {
      if (table === 'users') return qb(singleResult({ id: 'db-user-1' }));
      if (table === 'organization_members') return qb(null, arrayResult([]));
      return qb(singleResult(null), arrayResult([]));
    });

    const result = await verifyProjectOwnership(projectId, userId);
    expect(result).toEqual({ authorized: false });
  });

  it('returns authorized:false when project not in user org', async () => {
    mockFrom.mockImplementation((table: string) => {
      if (table === 'users') return qb(singleResult({ id: 'db-user-1' }));
      if (table === 'organization_members')
        return qb(null, arrayResult([{ organization_id: 'other-org' }]));
      if (table === 'projects') return qb(singleResult(null));
      return qb(singleResult(null), arrayResult([]));
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
      if (table === 'users') return qb(singleResult({ id: 'db-user-1' }));
      if (table === 'organization_members')
        return qb(null, arrayResult([{ organization_id: orgId }]));
      if (table === 'projects') return qb(singleResult(project));
      // fetchProjectRelations queries specs/architectures/boms/... — all empty is fine.
      return qb(singleResult(null), arrayResult([]));
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
      if (table === 'users') return qb(singleResult({ id: 'db-user-1' }));
      if (table === 'organization_members')
        return qb(singleResult({ organization_id: 'org-abc' }));
      return qb(singleResult(null));
    });

    const result = await getUserOrgId('supabase-user-1');
    expect(result).toBe('org-abc');
  });

  it('returns null when user not found', async () => {
    mockFrom.mockImplementation((table: string) => {
      if (table === 'users') return qb(singleResult(null));
      return qb(singleResult(null));
    });

    const result = await getUserOrgId('nonexistent');
    expect(result).toBeNull();
  });

  it('returns null when user has no memberships', async () => {
    mockFrom.mockImplementation((table: string) => {
      if (table === 'users') return qb(singleResult({ id: 'db-user-1' }));
      if (table === 'organization_members') return qb(singleResult(null));
      return qb(singleResult(null));
    });

    const result = await getUserOrgId('supabase-user-2');
    expect(result).toBeNull();
  });
});
