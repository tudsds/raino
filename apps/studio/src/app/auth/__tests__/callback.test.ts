import { describe, it, expect, vi, beforeEach } from 'vitest';

const {
  mockExchangeCodeForSession,
  mockRpc,
  mockCreateServerClient,
  mockCreateClient,
} = vi.hoisted(() => ({
  mockExchangeCodeForSession: vi.fn(),
  mockRpc: vi.fn(),
  mockCreateServerClient: vi.fn(),
  mockCreateClient: vi.fn(),
}));

vi.mock('@supabase/ssr', () => ({
  createServerClient: (...args: unknown[]) => {
    mockCreateServerClient(...args);
    return {
      auth: {
        exchangeCodeForSession: mockExchangeCodeForSession,
      },
    };
  },
}));

vi.mock('@supabase/supabase-js', () => ({
  createClient: (...args: unknown[]) => {
    mockCreateClient(...args);
    return {
      rpc: mockRpc,
    };
  },
}));

vi.mock('next/headers', () => ({
  cookies: vi.fn(() =>
    Promise.resolve({
      get: vi.fn(() => undefined),
      set: vi.fn(),
      delete: vi.fn(),
    }),
  ),
}));

vi.mock('next/server', () => ({
  NextResponse: {
    redirect: vi.fn((url: URL | string) => ({
      status: 307,
      headers: { get: () => url.toString() },
      url: url.toString(),
    })),
  },
}));

import { GET } from '../callback/route';
import { NextResponse } from 'next/server';

beforeEach(() => {
  vi.clearAllMocks();
});

function makeRequest(code: string | null) {
  const url = new URL('http://localhost:3001/auth/callback');
  if (code) url.searchParams.set('code', code);
  return new Request(url.toString());
}

describe('GET /auth/callback', () => {
  it('calls ensure_user_and_org RPC with supabase user on success', async () => {
    mockExchangeCodeForSession.mockResolvedValueOnce({
      data: {
        user: {
          id: 'new-user-id',
          email: 'new@test.com',
          user_metadata: { full_name: 'New User' },
        },
      },
      error: null,
    });
    mockRpc.mockResolvedValueOnce({ error: null });

    await GET(makeRequest('auth-code-new'));

    expect(mockRpc).toHaveBeenCalledOnce();
    const [fnName, args] = mockRpc.mock.calls[0]!;
    expect(fnName).toBe('ensure_user_and_org');
    expect(args.p_supabase_user_id).toBe('new-user-id');
    expect(args.p_email).toBe('new@test.com');
    expect(args.p_full_name).toBe('New User');
    expect(NextResponse.redirect).toHaveBeenCalledOnce();
  });

  it('is idempotent — repeated callbacks still only call the RPC once per request', async () => {
    mockExchangeCodeForSession.mockResolvedValue({
      data: {
        user: { id: 'existing-user-id', email: 'existing@test.com', user_metadata: {} },
      },
      error: null,
    });
    mockRpc.mockResolvedValue({ error: null });

    await GET(makeRequest('auth-code-1'));
    await GET(makeRequest('auth-code-2'));

    expect(mockRpc).toHaveBeenCalledTimes(2);
    expect(mockRpc.mock.calls[0]![0]).toBe('ensure_user_and_org');
    expect(mockRpc.mock.calls[1]![0]).toBe('ensure_user_and_org');
  });

  it('redirects to /login?error=provision_failed when RPC fails', async () => {
    mockExchangeCodeForSession.mockResolvedValueOnce({
      data: {
        user: { id: 'fail-user', email: 'fail@test.com', user_metadata: {} },
      },
      error: null,
    });
    mockRpc.mockResolvedValueOnce({ error: { message: 'db gone' } });

    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    await GET(makeRequest('auth-code-fail'));

    expect(NextResponse.redirect).toHaveBeenCalledOnce();
    const redirectedTo = (NextResponse.redirect as ReturnType<typeof vi.fn>).mock
      .calls[0]![0] as URL;
    expect(redirectedTo.pathname).toBe('/login');
    expect(redirectedTo.searchParams.get('error')).toBe('provision_failed');

    consoleErrorSpy.mockRestore();
  });

  it('redirects to /login?error=auth_exchange_failed when session exchange fails', async () => {
    mockExchangeCodeForSession.mockResolvedValueOnce({
      data: { user: null },
      error: { message: 'bad code' },
    });

    await GET(makeRequest('bad-code'));

    expect(mockRpc).not.toHaveBeenCalled();
    expect(NextResponse.redirect).toHaveBeenCalledOnce();
    const redirectedTo = (NextResponse.redirect as ReturnType<typeof vi.fn>).mock
      .calls[0]![0] as URL;
    expect(redirectedTo.pathname).toBe('/login');
    expect(redirectedTo.searchParams.get('error')).toBe('auth_exchange_failed');
  });

  it('redirects without provisioning when no code is present', async () => {
    await GET(makeRequest(null));

    expect(mockExchangeCodeForSession).not.toHaveBeenCalled();
    expect(mockRpc).not.toHaveBeenCalled();
    expect(NextResponse.redirect).toHaveBeenCalledOnce();
  });
});
