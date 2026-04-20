import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

const {
  mockRequireAuth,
  mockVerifyOwnership,
  mockGetBOM,
  mockGetQuote,
  mockCreateQuote,
  mockCreateAuditEntry,
  mockUpdateProjectStatus,
  mockAggregateSupplierPrices,
  mockCalculateRoughQuote,
} = vi.hoisted(() => ({
  mockRequireAuth: vi.fn(),
  mockVerifyOwnership: vi.fn(),
  mockGetBOM: vi.fn(),
  mockGetQuote: vi.fn(),
  mockCreateQuote: vi.fn(),
  mockCreateAuditEntry: vi.fn(),
  mockUpdateProjectStatus: vi.fn(),
  mockAggregateSupplierPrices: vi.fn(),
  mockCalculateRoughQuote: vi.fn(),
}));

vi.mock('@/lib/auth/require-auth', () => ({
  requireAuth: mockRequireAuth,
}));

vi.mock('@/lib/data/project-queries', () => ({
  verifyProjectOwnership: mockVerifyOwnership,
  updateProjectStatus: mockUpdateProjectStatus,
}));

vi.mock('@/lib/data/bom-queries', () => ({
  getBOM: mockGetBOM,
}));

vi.mock('@/lib/data/quote-queries', () => ({
  getQuote: mockGetQuote,
  createQuote: mockCreateQuote,
}));

vi.mock('@/lib/data/audit-queries', () => ({
  createAuditEntry: mockCreateAuditEntry,
}));

vi.mock('@/lib/quotes/supplier-comparison', () => ({
  aggregateSupplierPrices: mockAggregateSupplierPrices,
}));

vi.mock('@raino/core', () => ({
  calculateRoughQuote: mockCalculateRoughQuote,
}));

import { GET, POST } from '../projects/[id]/quote/route';

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

function makeBomRow(overrides: Record<string, unknown> = {}) {
  const now = new Date().toISOString();
  return {
    id: 'r1',
    bom_id: 'bom-1',
    ref: 'R1',
    value: '10k',
    mpn: 'RC0603JR-0710KL',
    manufacturer: 'Yageo',
    package: '0603',
    quantity: 10,
    unit_price: 0.5,
    currency: 'USD',
    lifecycle: 'active',
    risk: 'low',
    description: null,
    alternates: null,
    provenance_source: 'supplier',
    created_at: now,
    updated_at: now,
    ...overrides,
  };
}

function makeMockBOM(
  overrides: { rows?: Array<Record<string, unknown>>; is_estimate?: boolean } = {},
) {
  const now = new Date().toISOString();
  return {
    id: 'bom-1',
    project_id: 'proj-123',
    total_cost: 50,
    currency: 'USD',
    line_count: 2,
    is_estimate: overrides.is_estimate ?? false,
    rows: overrides.rows ?? [
      makeBomRow(),
      makeBomRow({
        id: 'r2',
        ref: 'R2',
        value: '100nF',
        mpn: 'C0603C104K5RACTU',
        manufacturer: 'Kemet',
        quantity: 5,
        unit_price: 0.3,
      }),
    ],
    created_at: now,
    updated_at: now,
  };
}

function makeMockQuote(overrides: Record<string, unknown> = {}) {
  const now = new Date().toISOString();
  return {
    id: 'quote-1',
    project_id: 'proj-123',
    low_quote: 100,
    mid_quote: 150,
    high_quote: 200,
    confidence: 'medium',
    currency: 'USD',
    breakdown: [],
    assumptions: [],
    is_estimate: false,
    quantity: 100,
    created_at: now,
    updated_at: now,
    ...overrides,
  };
}

describe('GET /api/projects/[id]/quote', () => {
  it('returns existing quote', async () => {
    mockRequireAuth.mockResolvedValue(makeAuthUser());
    mockVerifyOwnership.mockResolvedValue({ authorized: true, project: { id: 'proj-123' } });
    mockGetQuote.mockResolvedValue(makeMockQuote());

    const response = await GET(
      new NextRequest('http://localhost:3001/api/projects/proj-123/quote'),
      {
        params: makeParams(),
      },
    );
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.projectId).toBe('proj-123');
    expect(data.quote.id).toBe('quote-1');
    expect(data.quote.low).toBe(100);
    expect(data.quote.mid).toBe(150);
    expect(data.quote.high).toBe(200);
    expect(data.quote.dataSource).toBe('live_supplier');
  });

  it('returns null quote when none exists', async () => {
    mockRequireAuth.mockResolvedValue(makeAuthUser());
    mockVerifyOwnership.mockResolvedValue({ authorized: true, project: { id: 'proj-123' } });
    mockGetQuote.mockResolvedValue(null);

    const response = await GET(
      new NextRequest('http://localhost:3001/api/projects/proj-123/quote'),
      {
        params: makeParams(),
      },
    );
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.quote).toBeNull();
  });

  it('fails without auth', async () => {
    mockRequireAuth.mockResolvedValue(makeAuthError());

    const response = await GET(
      new NextRequest('http://localhost:3001/api/projects/proj-123/quote'),
      {
        params: makeParams(),
      },
    );
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Unauthorized');
  });
});

describe('POST /api/projects/[id]/quote', () => {
  it('generates quote with valid BOM', async () => {
    mockRequireAuth.mockResolvedValue(makeAuthUser());
    mockVerifyOwnership.mockResolvedValue({ authorized: true, project: { id: 'proj-123' } });
    mockGetBOM.mockResolvedValue(makeMockBOM());
    mockAggregateSupplierPrices.mockResolvedValue([]);
    mockCalculateRoughQuote.mockReturnValue({
      projectId: 'proj-123',
      bomId: 'bom-1',
      designAutomationFee: 500,
      engineeringReviewFee: 300,
      pcbFabricationEstimate: 10,
      componentsEstimate: 0.8,
      assemblyEstimate: 1,
      qaPackagingHandling: 0.55,
      contingency: 81.235,
      margin: 133.03275,
      lowQuote: 849.18,
      midQuote: 1016.03,
      highQuote: 1219.24,
      confidenceLevel: 'high',
      assumptions: [],
      includedScope: [],
      nextRecommendedAction: '',
      isEstimate: false,
    });
    mockCreateQuote.mockResolvedValue(
      makeMockQuote({
        id: 'quote-new',
        low_quote: 849,
        mid_quote: 1016,
        high_quote: 1219,
        confidence: 'high',
      }),
    );

    const request = new NextRequest('http://localhost:3001/api/projects/proj-123/quote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quantity: 100 }),
    });

    const response = await POST(request, { params: makeParams() });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.projectId).toBe('proj-123');
    expect(data.quote.id).toBe('quote-new');
    expect(data.quote.confidence).toBe('high');
    expect(mockCalculateRoughQuote).toHaveBeenCalled();
    expect(mockUpdateProjectStatus).toHaveBeenCalledWith('proj-123', 'quoted');
    expect(mockCreateAuditEntry).toHaveBeenCalledOnce();
  });

  it('returns 400 when no BOM exists', async () => {
    mockRequireAuth.mockResolvedValue(makeAuthUser());
    mockVerifyOwnership.mockResolvedValue({ authorized: true, project: { id: 'proj-123' } });
    mockGetBOM.mockResolvedValue(null);

    const request = new NextRequest('http://localhost:3001/api/projects/proj-123/quote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quantity: 100 }),
    });

    const response = await POST(request, { params: makeParams() });
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain('No BOM found');
  });

  it('returns 422 with empty BOM', async () => {
    mockRequireAuth.mockResolvedValue(makeAuthUser());
    mockVerifyOwnership.mockResolvedValue({ authorized: true, project: { id: 'proj-123' } });
    mockGetBOM.mockResolvedValue(makeMockBOM({ rows: [] }));
    mockAggregateSupplierPrices.mockResolvedValue([]);

    const request = new NextRequest('http://localhost:3001/api/projects/proj-123/quote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quantity: 100 }),
    });

    const response = await POST(request, { params: makeParams() });
    const data = await response.json();

    expect(response.status).toBe(422);
    expect(data.error).toContain('BOM has no rows with valid pricing');
  });

  it('returns 422 when BOM rows have no valid prices', async () => {
    mockRequireAuth.mockResolvedValue(makeAuthUser());
    mockVerifyOwnership.mockResolvedValue({ authorized: true, project: { id: 'proj-123' } });
    mockGetBOM.mockResolvedValue(
      makeMockBOM({
        rows: [makeBomRow({ unit_price: 0 })],
      }),
    );
    mockAggregateSupplierPrices.mockResolvedValue([]);

    const request = new NextRequest('http://localhost:3001/api/projects/proj-123/quote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quantity: 100 }),
    });

    const response = await POST(request, { params: makeParams() });
    const data = await response.json();

    expect(response.status).toBe(422);
    expect(data.error).toContain('BOM has no rows with valid pricing');
  });

  it('fails without auth', async () => {
    mockRequireAuth.mockResolvedValue(makeAuthError());

    const request = new NextRequest('http://localhost:3001/api/projects/proj-123/quote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quantity: 100 }),
    });

    const response = await POST(request, { params: makeParams() });
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Unauthorized');
  });

  it('returns 400 for invalid quantity', async () => {
    mockRequireAuth.mockResolvedValue(makeAuthUser());
    mockVerifyOwnership.mockResolvedValue({ authorized: true, project: { id: 'proj-123' } });

    const request = new NextRequest('http://localhost:3001/api/projects/proj-123/quote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quantity: -5 }),
    });

    const response = await POST(request, { params: makeParams() });
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Validation failed');
  });
});
