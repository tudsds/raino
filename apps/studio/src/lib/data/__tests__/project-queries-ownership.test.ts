import { describe, it, expect, vi, beforeEach } from 'vitest';
import { verifyProjectOwnership, getUserOrgId } from '../project-queries';

vi.mock('@raino/db', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
    },
    project: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
    },
  },
}));

import { prisma } from '@raino/db';

const mockUserFindUnique = vi.mocked(prisma.user.findUnique);
const mockProjectFindUnique = vi.mocked(prisma.project.findUnique);

beforeEach(() => {
  vi.clearAllMocks();
});

function makeUser(overrides: Record<string, unknown> = {}) {
  return {
    id: 'db-user-1',
    supabaseUserId: 'user-123',
    email: 'test@test.com',
    fullName: null,
    avatarUrl: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

function makeProject(overrides: Record<string, unknown> = {}) {
  return {
    id: 'project-1',
    name: 'Test Project',
    description: null,
    status: 'intake',
    organizationId: 'org-1',
    createdAt: new Date(),
    updatedAt: new Date(),
    currentStep: 0,
    totalSteps: 0,
    ...overrides,
  };
}

function makeFullProject(overrides: Record<string, unknown> = {}) {
  return {
    ...makeProject(overrides),
    spec: null,
    architecture: null,
    bom: null,
    quotes: [],
    ingestion: null,
    artifacts: [],
    jobs: [],
    auditEntries: [],
    handoffs: [],
    intakeMessages: [],
  };
}

describe('verifyProjectOwnership', () => {
  const userId = 'supabase-user-123';
  const projectId = 'project-456';
  const orgId = 'org-789';

  it('returns { authorized: false } when user not found', async () => {
    mockUserFindUnique.mockResolvedValueOnce(null);

    const result = await verifyProjectOwnership(projectId, userId);
    expect(result).toEqual({ authorized: false });
  });

  it('returns { authorized: false } when project not in user org', async () => {
    mockUserFindUnique.mockResolvedValueOnce(
      makeUser({
        supabaseUserId: userId,
        memberships: [{ organizationId: 'different-org' }],
      }),
    );
    mockProjectFindUnique.mockResolvedValueOnce(makeProject({ organizationId: 'another-org' }));

    const result = await verifyProjectOwnership(projectId, userId);
    expect(result).toEqual({ authorized: false });
  });

  it('returns { authorized: false } when project not found', async () => {
    mockUserFindUnique.mockResolvedValueOnce(
      makeUser({
        supabaseUserId: userId,
        memberships: [{ organizationId: orgId }],
      }),
    );
    mockProjectFindUnique.mockResolvedValueOnce(null);

    const result = await verifyProjectOwnership(projectId, userId);
    expect(result).toEqual({ authorized: false });
  });

  it('returns { authorized: true, project } when user owns the project', async () => {
    const fullProject = makeFullProject({
      id: projectId,
      organizationId: orgId,
      name: 'Owned Project',
      status: 'intake',
    });

    mockUserFindUnique.mockResolvedValueOnce(
      makeUser({
        supabaseUserId: userId,
        memberships: [{ organizationId: orgId }],
      }),
    );
    mockProjectFindUnique
      .mockResolvedValueOnce(makeProject({ organizationId: orgId }))
      .mockResolvedValueOnce(fullProject);

    const result = await verifyProjectOwnership(projectId, userId);
    if (!result.authorized) {
      throw new Error('Expected authorized to be true');
    }
    expect(result.authorized).toBe(true);
    expect(result.project).toEqual(fullProject);
  });
});

describe('getUserOrgId', () => {
  it('returns org ID when user has membership', async () => {
    mockUserFindUnique.mockResolvedValueOnce(
      makeUser({
        supabaseUserId: 'user-1',
        memberships: [{ organizationId: 'org-abc' }],
      }),
    );

    const result = await getUserOrgId('user-1');
    expect(result).toBe('org-abc');
  });

  it('returns null when user not found', async () => {
    mockUserFindUnique.mockResolvedValueOnce(null);

    const result = await getUserOrgId('nonexistent');
    expect(result).toBeNull();
  });

  it('returns null when user has no memberships', async () => {
    mockUserFindUnique.mockResolvedValueOnce(
      makeUser({
        supabaseUserId: 'user-2',
        memberships: [],
      }),
    );

    const result = await getUserOrgId('user-2');
    expect(result).toBeNull();
  });
});
