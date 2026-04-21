import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockRequireAuth, mockVerifyOwnership, mockGetBOM } = vi.hoisted(() => ({
  mockRequireAuth: vi.fn(),
  mockVerifyOwnership: vi.fn(),
  mockGetBOM: vi.fn(),
}));

vi.mock('@/lib/auth/require-auth', () => ({
  requireAuth: mockRequireAuth,
}));

vi.mock('@/lib/data/project-queries', () => ({
  verifyProjectOwnership: mockVerifyOwnership,
}));

vi.mock('@/lib/data/bom-queries', () => ({
  getBOM: mockGetBOM,
}));

import { GET, POST } from '../projects/[id]/bom/route';

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

function makeParams(id = 'proj-123') {
  return Promise.resolve({ id });
}

describe('GET /api/projects/[id]/bom', () => {
  it('returns BOM for authorized project', async () => {
    mockRequireAuth.mockResolvedValue(makeAuthUser());
    mockVerifyOwnership.mockResolvedValue({ authorized: true, project: { id: 'proj-123' } });
    const now = new Date().toISOString();
    mockGetBOM.mockResolvedValue({
      id: 'bom-1',
      project_id: 'proj-123',
      total_cost: '50',
      currency: 'USD',
      line_count: 2,
      is_estimate: false,
      rows: [
        {
          id: 'r1',
          bom_id: 'bom-1',
          ref: 'R1',
          value: '10k',
          mpn: 'RC0603JR-0710KL',
          manufacturer: 'Yageo',
          package: '0603',
          quantity: 10,
          unit_price: '0.5',
          currency: 'USD',
          lifecycle: 'active',
          risk: 'low',
          description: null,
          alternates: null,
          provenance_source: 'supplier',
          created_at: now,
          updated_at: now,
        },
        {
          id: 'r2',
          bom_id: 'bom-1',
          ref: 'R2',
          value: '100nF',
          mpn: 'C0603C104K5RACTU',
          manufacturer: 'Kemet',
          package: '0603',
          quantity: 5,
          unit_price: '0.3',
          currency: 'USD',
          lifecycle: 'active',
          risk: 'low',
          description: null,
          alternates: null,
          provenance_source: 'supplier',
          created_at: now,
          updated_at: now,
        },
      ],
      created_at: now,
      updated_at: now,
    });

    const response = await GET(new Request('http://localhost:3001/api/projects/proj-123/bom'), {
      params: makeParams(),
    });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.projectId).toBe('proj-123');
    expect(data.bom).not.toBeNull();
    expect(data.bom.id).toBe('bom-1');
    expect(data.bom.items).toHaveLength(2);
    expect(data.bom.totalCost).toBe(50);
    expect(data.bom.currency).toBe('USD');
    expect(data.bom.lineCount).toBe(2);
    expect(data.bom.isEstimate).toBe(false);
    expect(data.bom.items[0].ref).toBe('R1');
    expect(data.bom.items[0].mpn).toBe('RC0603JR-0710KL');
    expect(data.bom.items[0].unitPrice).toBe(0.5);
  });

  it('returns null BOM when none exists', async () => {
    mockRequireAuth.mockResolvedValue(makeAuthUser());
    mockVerifyOwnership.mockResolvedValue({ authorized: true, project: { id: 'proj-123' } });
    mockGetBOM.mockResolvedValue(null);

    const response = await GET(new Request('http://localhost:3001/api/projects/proj-123/bom'), {
      params: makeParams(),
    });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.bom).toBeNull();
    expect(data.projectId).toBe('proj-123');
  });

  it('returns degraded mode on unexpected error', async () => {
    mockRequireAuth.mockResolvedValue(makeAuthUser());
    mockVerifyOwnership.mockRejectedValue(new Error('Unexpected failure'));

    const response = await GET(new Request('http://localhost:3001/api/projects/proj-123/bom'), {
      params: makeParams(),
    });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.bom).toBeNull();
    expect(data.meta.mode).toBe('degraded');
  });

  it('fails without auth', async () => {
    mockRequireAuth.mockResolvedValue(makeAuthError());

    const response = await GET(new Request('http://localhost:3001/api/projects/proj-123/bom'), {
      params: makeParams(),
    });
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Unauthorized');
  });
});

describe('POST /api/projects/[id]/bom', () => {
  it('accepts BOM update', async () => {
    mockRequireAuth.mockResolvedValue(makeAuthUser());
    mockVerifyOwnership.mockResolvedValue({ authorized: true, project: { id: 'proj-123' } });

    const request = new Request('http://localhost:3001/api/projects/proj-123/bom', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ref: 'R1', value: '10k', quantity: 20 }),
    });

    const response = await POST(request, { params: makeParams() });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.projectId).toBe('proj-123');
    expect(data.message).toBe('BOM update received');
    expect(data.updatedItem).toEqual({ ref: 'R1', value: '10k', quantity: 20 });
  });

  it('fails without auth', async () => {
    mockRequireAuth.mockResolvedValue(makeAuthError());

    const request = new Request('http://localhost:3001/api/projects/proj-123/bom', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ref: 'R1', value: '10k' }),
    });

    const response = await POST(request, { params: makeParams() });
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Unauthorized');
  });
});
