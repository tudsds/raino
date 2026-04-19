import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

const { mockRequireAuth, mockVerifyOwnership, mockGetBOM, mockGetQuote } = vi.hoisted(() => ({
  mockRequireAuth: vi.fn(),
  mockVerifyOwnership: vi.fn(),
  mockGetBOM: vi.fn(),
  mockGetQuote: vi.fn(),
}));

vi.mock('@/lib/auth/require-auth', () => ({
  requireAuth: mockRequireAuth,
}));

vi.mock('@/lib/data/project-queries', () => ({
  verifyProjectOwnership: mockVerifyOwnership,
  updateProjectStatus: vi.fn(),
}));

vi.mock('@/lib/data/bom-queries', () => ({
  getBOM: mockGetBOM,
}));

vi.mock('@/lib/data/quote-queries', () => ({
  getQuote: mockGetQuote,
  createQuote: vi.fn(),
}));

vi.mock('@/lib/data/audit-queries', () => ({
  createAuditEntry: vi.fn(),
}));

vi.mock('@/lib/quotes/supplier-comparison', () => ({
  aggregateSupplierPrices: vi.fn(),
}));

vi.mock('@raino/core', () => ({
  calculateRoughQuote: vi.fn(),
}));

import { GET as getBOM, POST as postBOM } from '../projects/[id]/bom/route';
import { GET as getQuote, POST as postQuote } from '../projects/[id]/quote/route';

beforeEach(() => {
  vi.clearAllMocks();
});

function makeAuthUser(userId = 'user-123') {
  return { user: { id: userId, email: 'test@test.com' }, error: null };
}

function makeParams(id = 'proj-123') {
  return Promise.resolve({ id });
}

describe('Ownership authorization', () => {
  it('GET /bom returns 404 for unauthorized project', async () => {
    mockRequireAuth.mockResolvedValue(makeAuthUser());
    mockVerifyOwnership.mockResolvedValue({ authorized: false });

    const response = await getBOM(
      new NextRequest('http://localhost:3001/api/projects/proj-123/bom'),
      {
        params: makeParams(),
      },
    );
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe('Project not found');
    expect(mockGetBOM).not.toHaveBeenCalled();
  });

  it('POST /bom returns 404 for unauthorized project', async () => {
    mockRequireAuth.mockResolvedValue(makeAuthUser());
    mockVerifyOwnership.mockResolvedValue({ authorized: false });

    const request = new NextRequest('http://localhost:3001/api/projects/proj-123/bom', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ref: 'R1', value: '10k' }),
    });

    const response = await postBOM(request, { params: makeParams() });
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe('Project not found');
  });

  it('GET /quote returns 404 for unauthorized project', async () => {
    mockRequireAuth.mockResolvedValue(makeAuthUser());
    mockVerifyOwnership.mockResolvedValue({ authorized: false });

    const response = await getQuote(
      new NextRequest('http://localhost:3001/api/projects/proj-123/quote'),
      { params: makeParams() },
    );
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe('Project not found');
    expect(mockGetQuote).not.toHaveBeenCalled();
  });

  it('POST /quote returns 404 for unauthorized project', async () => {
    mockRequireAuth.mockResolvedValue(makeAuthUser());
    mockVerifyOwnership.mockResolvedValue({ authorized: false });

    const request = new NextRequest('http://localhost:3001/api/projects/proj-123/quote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quantity: 100 }),
    });

    const response = await postQuote(request, { params: makeParams() });
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe('Project not found');
    expect(mockGetBOM).not.toHaveBeenCalled();
  });

  it('does not leak project existence via 404 (returns same as missing project)', async () => {
    mockRequireAuth.mockResolvedValue(makeAuthUser());
    mockVerifyOwnership.mockResolvedValue({ authorized: false });

    const responses = await Promise.all([
      getBOM(new Request('http://localhost:3001/api/projects/exists/bom'), {
        params: Promise.resolve({ id: 'exists' }),
      }),
      getBOM(new Request('http://localhost:3001/api/projects/does-not-exist/bom'), {
        params: Promise.resolve({ id: 'does-not-exist' }),
      }),
    ]);

    const [data1, data2] = await Promise.all(responses.map((r) => r.json()));

    expect(responses[0]!.status).toBe(404);
    expect(responses[1]!.status).toBe(404);
    expect(data1.error).toBe(data2.error);
  });
});
