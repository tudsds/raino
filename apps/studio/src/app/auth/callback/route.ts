/**
 * Auth callback route — Supabase magic-link PKCE exchange.
 *
 * User/org provisioning is owned by the `on_auth_user_created` trigger in
 * Supabase (see supabase/migrations/20260420_auto_provision_user_and_org.sql).
 * This route just calls the same `ensure_user_and_org` RPC as a belt-and-braces
 * second path so re-signups, historical accounts, and trigger failures still
 * recover instead of landing the user on an "org missing" error.
 */
import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { CookieOptions } from '@supabase/ssr';
import type { Database } from '@/lib/db/supabase-admin';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (!code) {
    return NextResponse.redirect(requestUrl.origin);
  }

  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          cookieStore.delete({ name, ...options });
        },
      },
    }
  );

  const {
    data: { user },
    error: exchangeError,
  } = await supabase.auth.exchangeCodeForSession(code);

  if (exchangeError || !user) {
    const url = new URL('/login', requestUrl.origin);
    url.searchParams.set('error', 'auth_exchange_failed');
    return NextResponse.redirect(url);
  }

  const adminClient = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const fullName: string | undefined =
    user.user_metadata?.full_name || user.user_metadata?.name || undefined;

  const { error: rpcError } = await adminClient.rpc('ensure_user_and_org', {
    p_supabase_user_id: user.id,
    p_email: user.email!,
    ...(fullName !== undefined ? { p_full_name: fullName } : {}),
  });

  if (rpcError) {
    console.error('[auth/callback] ensure_user_and_org failed:', rpcError);
    const url = new URL('/login', requestUrl.origin);
    url.searchParams.set('error', 'provision_failed');
    return NextResponse.redirect(url);
  }

  return NextResponse.redirect(requestUrl.origin);
}
