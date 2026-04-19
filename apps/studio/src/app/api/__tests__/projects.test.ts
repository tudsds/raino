import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

const {
  mockRequireAuth,
  mockGetProjectsForUser,
  mockCreateProject,
  mockGetUserOrgId,
  mockCreateAuditEntry,
} = vi.hoisted(() => ({
  mockRequireAuth: vi.fn(),
  mockGetProjectsForUser: vi.fn(),
  mockCreateProject: vi.fn(),
  mockGetUserOrgId: vi.fn(),
  mockCreateAuditEntry: vi.fn(),
}));

vi.mock('@/lib/auth/require-auth', () => ({
  requireAuth: mockRequireAuth,
}));

vi.mock('@/lib/data/project-queries', () => ({
  getProjectsForUser: mockGetProjectsForUser,
  createProject: mockCreateProject,
  getUserOrgId: mockGetUserOrgId,
  verifyProjectOwnership: vi.fn(),
  updateProjectStatus: vi.fn(),
}));

vi.mock('@/lib/data/audit-queries', () => ({
  createAuditEntry: mockCreateAuditEntry,
}));

import { GET, POST } from '../projects/route';

beforeEach(() => {
  vi.clearAllMocks();
});

function makeAuthUser(userId = 'user-123') {
  return { user: { id: userId, email: 'test@test.com' }, error: null };
}

function makeAuthError() {
  return {
    user: null,
    error: new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    }),
  };
}

describe('GET /api/projects', () => {
  it('returns projects for authenticated user', async () => {
    mockRequireAuth.mockResolvedValue(makeAuthUser());
    const projects = [
      { id: 'p1', name: 'Project 1', organizationId: 'org-1' },
      { id: 'p2', name: 'Project 2', organizationId: 'org-1' },
    ];
    mockGetProjectsForUser.mockResolvedValue(projects);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.projects).toEqual(projects);
    expect(mockGetProjectsForUser).toHaveBeenCalledWith('user-123');
  });

  it('returns degraded mode when DB fails', async () => {
    mockRequireAuth.mockResolvedValue(makeAuthUser());
    mockGetProjectsForUser.mockRejectedValue(new Error('DB connection lost'));

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.projects).toEqual([]);
    expect(data.meta.mode).toBe('degraded');
    expect(data.meta.reason).toBe('Database not configured');
  });

  it('fails without auth', async () => {
    mockRequireAuth.mockResolvedValue(makeAuthError());

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Unauthorized');
  });
});

describe('POST /api/projects', () => {
  it('creates project with auth', async () => {
    mockRequireAuth.mockResolvedValue(makeAuthUser());
    mockGetUserOrgId.mockResolvedValue('org-123');
    mockCreateProject.mockResolvedValue({
      id: 'proj-1',
      name: 'Test Project',
      description: 'A test project',
      organizationId: 'org-123',
      status: 'intake',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    mockCreateAuditEntry.mockResolvedValue({ id: 'audit-1' });

    const request = new NextRequest('http://localhost:3001/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Test Project', description: 'A test project' }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.project.id).toBe('proj-1');
    expect(data.message).toBe('Project created successfully');
    expect(mockCreateProject).toHaveBeenCalledWith({
      name: 'Test Project',
      description: 'A test project',
      organizationId: 'org-123',
    });
    expect(mockCreateAuditEntry).toHaveBeenCalledOnce();
    const auditCall = mockCreateAuditEntry.mock.calls[0]!;
    expect(auditCall[0]).toBe('proj-1');
    expect(auditCall[1].category).toBe('project');
    expect(auditCall[1].action).toBe('project_created');
    expect(auditCall[1].actor).toBe('user-123');
  });

  it('fails without auth', async () => {
    mockRequireAuth.mockResolvedValue(makeAuthError());

    const request = new NextRequest('http://localhost:3001/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Test Project' }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Unauthorized');
  });

  it('returns 400 for invalid body', async () => {
    mockRequireAuth.mockResolvedValue(makeAuthUser());

    const request = new NextRequest('http://localhost:3001/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: '' }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Validation failed');
    expect(data.details).toBeDefined();
  });

  it('returns 403 when user has no organization', async () => {
    mockRequireAuth.mockResolvedValue(makeAuthUser());
    mockGetUserOrgId.mockResolvedValue(null);

    const request = new NextRequest('http://localhost:3001/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Test Project' }),
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(403);
    expect(body.error).toContain('No organization found');
  });

  it('uses provided organizationId when given', async () => {
    mockRequireAuth.mockResolvedValue(makeAuthUser());
    mockCreateProject.mockResolvedValue({
      id: 'proj-2',
      name: 'Org Project',
      organizationId: 'custom-org-uuid',
      status: 'intake',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    mockCreateAuditEntry.mockResolvedValue({ id: 'audit-2' });

    const request = new NextRequest('http://localhost:3001/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Org Project',
        organizationId: '550e8400-e29b-41d4-a716-446655440000',
      }),
    });

    const response = await POST(request);
    await response.json();

    expect(response.status).toBe(201);
    expect(mockGetUserOrgId).not.toHaveBeenCalled();
    expect(mockCreateProject).toHaveBeenCalledWith({
      name: 'Org Project',
      description: undefined,
      organizationId: '550e8400-e29b-41d4-a716-446655440000',
    });
  });
});
