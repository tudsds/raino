import { getCurrentUser } from './get-current-user';
import { NextResponse } from 'next/server';
import type { User } from '@supabase/supabase-js';

export interface AuthResult {
  user: User;
  error: null;
}

export interface AuthError {
  user: null;
  error: NextResponse;
}

/**
 * Require authentication for API route handlers.
 * Returns user on success, or a 401 NextResponse on failure.
 */
export async function requireAuth(): Promise<AuthResult | AuthError> {
  const user = await getCurrentUser();
  if (!user) {
    return {
      user: null,
      error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    };
  }
  return { user, error: null };
}
