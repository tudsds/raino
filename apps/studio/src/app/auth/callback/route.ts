/**
 * Auth callback route - handles Supabase magic link authentication.
 * Uses Supabase client directly instead of Prisma to avoid table name issues.
 */
import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { CookieOptions } from '@supabase/ssr';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (code) {
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

    const { data: { user }, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && user) {
      // Auto-provision user and organization using Supabase admin client
      try {
        const adminClient = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!,
          { auth: { autoRefreshToken: false, persistSession: false } }
        );

        // Find or create user
        const { data: existingUser } = await adminClient
          .from('users')
          .select('id, supabase_user_id, full_name')
          .eq('email', user.email!)
          .maybeSingle();

        let dbUserId: string;
        let dbUserFullName: string;

        if (!existingUser) {
          const fullName = user.user_metadata?.full_name || user.user_metadata?.name || 'New User';
          const { data: newUser, error: createError } = await adminClient
            .from('users')
            .insert({
              supabase_user_id: user.id,
              email: user.email!,
              full_name: fullName,
            })
            .select('id, full_name')
            .single();

          if (createError) throw createError;
          dbUserId = newUser.id;
          dbUserFullName = newUser.full_name ?? 'User';
        } else {
          dbUserId = existingUser.id;
          dbUserFullName = existingUser.full_name ?? 'User';

          // Update supabase_user_id if missing
          if (!existingUser.supabase_user_id) {
            await adminClient
              .from('users')
              .update({ supabase_user_id: user.id })
              .eq('id', dbUserId);
          }
        }

        // Check if user already has an org membership
        const { data: membership } = await adminClient
          .from('organization_members')
          .select('organization_id')
          .eq('user_id', dbUserId)
          .maybeSingle();

        if (!membership) {
          // Create a personal organization for the user
          const orgSlug = 'org-' + dbUserId.slice(0, 8) + '-' + Date.now().toString(36);
          const { data: org, error: orgError } = await adminClient
            .from('organizations')
            .insert({
              name: dbUserFullName + "'s Organization",
              slug: orgSlug,
            })
            .select('id')
            .single();

          if (orgError) throw orgError;

          await adminClient
            .from('organization_members')
            .insert({
              user_id: dbUserId,
              organization_id: org.id,
              role: 'owner',
            });

          console.log('[auth/callback] Provisioned user with org', org.id);
        }
      } catch (dbError) {
        // Log but don't fail — user is still authenticated via Supabase
        console.error('[auth/callback] Failed to provision user/org:', dbError);
      }
    }
  }

  return NextResponse.redirect(requestUrl.origin);
}
