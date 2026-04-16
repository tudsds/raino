import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockExchangeCodeForSession, mockGetUser, mockUpsert, mockTransaction } = vi.hoisted(() => ({
  mockExchangeCodeForSession: vi.fn(),
  mockGetUser: vi.fn(),
  mockUpsert: vi.fn(),
  mockTransaction: vi.fn(),
}));

vi.mock('@supabase/ssr', () => ({
  createServerClient: vi.fn(() => ({
    auth: {
      exchangeCodeForSession: mockExchangeCodeForSession,
      getUser: mockGetUser,
    },
  })),
}));

vi.mock('@raino/db', () => ({
  prisma: {
    $transaction: mockTransaction,
  },
}));

vi.mock('next/headers', () => ({
  cookies: vi.fn(() =>
    Promise.resolve({
      getAll: vi.fn(() => []),
      set: vi.fn(),
    }),
  ),
}));

vi.mock('next/server', () => ({
  NextResponse: {
    redirect: vi.fn((url: URL) => ({ status: 307, headers: { get: () => url.toString() } })),
  },
}));

import { GET } from '../callback/route';
import { NextResponse } from 'next/server';

beforeEach(() => {
  vi.clearAllMocks();
  mockTransaction.mockImplementation(
    async (fn: (tx: { user: { upsert: typeof mockUpsert } }) => Promise<void>) => {
      await fn({ user: { upsert: mockUpsert } });
    },
  );
});

function makeRequest(code: string | null) {
  const url = new URL('http://localhost:3001/auth/callback');
  if (code) url.searchParams.set('code', code);
  return new Request(url.toString());
}

describe('GET /auth/callback', () => {
  it('existing users are NOT re-created (upsert idempotency)', async () => {
    mockExchangeCodeForSession.mockResolvedValueOnce({ error: null });
    mockGetUser.mockResolvedValueOnce({
      data: { user: { id: 'existing-user-id', email: 'existing@test.com', user_metadata: {} } },
    });
    mockUpsert.mockResolvedValueOnce({ id: 'db-user-1' });

    await GET(makeRequest('auth-code-123'));

    expect(mockUpsert).toHaveBeenCalledOnce();
    const upsertArgs = mockUpsert.mock.calls[0]![0];
    expect(upsertArgs.where.supabaseUserId).toBe('existing-user-id');
    expect(upsertArgs.update).toEqual({});
    expect(upsertArgs.create.supabaseUserId).toBe('existing-user-id');
    expect(NextResponse.redirect).toHaveBeenCalledOnce();
  });

  it('new users get User + Organization + OrganizationMember created', async () => {
    mockExchangeCodeForSession.mockResolvedValueOnce({ error: null });
    mockGetUser.mockResolvedValueOnce({
      data: {
        user: {
          id: 'new-user-id',
          email: 'new@test.com',
          user_metadata: { full_name: 'New User' },
        },
      },
    });
    mockUpsert.mockResolvedValueOnce({ id: 'db-user-new' });

    await GET(makeRequest('auth-code-new'));

    expect(mockTransaction).toHaveBeenCalledOnce();
    expect(mockUpsert).toHaveBeenCalledOnce();

    const createPayload = mockUpsert.mock.calls[0]![0].create;
    expect(createPayload.supabaseUserId).toBe('new-user-id');
    expect(createPayload.email).toBe('new@test.com');
    expect(createPayload.fullName).toBe('New User');
    expect(createPayload.memberships.create.role).toBe('owner');
    expect(createPayload.memberships.create.organization.create.name).toBe('Personal');
    expect(createPayload.memberships.create.organization.create.slug).toBe('personal-new-user');
  });

  it('provisioning failure does not block the redirect', async () => {
    mockExchangeCodeForSession.mockResolvedValueOnce({ error: null });
    mockGetUser.mockResolvedValueOnce({
      data: {
        user: { id: 'fail-user', email: 'fail@test.com', user_metadata: {} },
      },
    });
    mockTransaction.mockRejectedValueOnce(new Error('DB connection lost'));

    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    await GET(makeRequest('auth-code-fail'));

    expect(NextResponse.redirect).toHaveBeenCalledOnce();

    consoleErrorSpy.mockRestore();
  });

  it('redirects without provisioning when no code is present', async () => {
    await GET(makeRequest(null));

    expect(mockExchangeCodeForSession).not.toHaveBeenCalled();
    expect(mockTransaction).not.toHaveBeenCalled();
    expect(NextResponse.redirect).toHaveBeenCalledOnce();
  });
});
