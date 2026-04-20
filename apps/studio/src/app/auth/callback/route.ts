import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { prisma } from '@raino/db';
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
      // Auto-provision user and organization using correct Prisma camelCase field names
      try {
        await prisma.$transaction(async (tx) => {
          // Find or create user
          let dbUser = await tx.user.findFirst({
            where: { email: user.email! }
          });

          if (!dbUser) {
            dbUser = await tx.user.create({
              data: {
                supabaseUserId: user.id,
                email: user.email!,
                fullName: user.user_metadata?.full_name || user.user_metadata?.name || 'New User',
              }
            });
          } else if (!dbUser.supabaseUserId) {
            // Update existing user with supabase ID if missing
            dbUser = await tx.user.update({
              where: { id: dbUser.id },
              data: { supabaseUserId: user.id }
            });
          }

          // Check if user already has an org membership
          const membership = await tx.organizationMember.findFirst({
            where: { userId: dbUser.id }
          });

          if (!membership) {
            // Create a personal organization for the user
            const orgSlug = 'org-' + dbUser.id.slice(0, 8) + '-' + Date.now().toString(36);
            const org = await tx.organization.create({
              data: {
                name: (dbUser.fullName || 'User') + "'s Organization",
                slug: orgSlug,
              }
            });

            await tx.organizationMember.create({
              data: {
                userId: dbUser.id,
                organizationId: org.id,
                role: 'owner'
              }
            });

            console.log('[auth/callback] Provisioned user ' + dbUser.email + ' with org ' + org.id);
          }
        });
      } catch (dbError) {
        // Log but don't fail — user is still authenticated via Supabase
        console.error('[auth/callback] Failed to provision user/org:', dbError);
      }
    }
  }

  return NextResponse.redirect(requestUrl.origin);
}
