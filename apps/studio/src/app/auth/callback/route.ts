import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@raino/db';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (code) {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? '',
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options),
              );
            } catch {
              // Server Components cannot set cookies — this is expected
              // when called from a Server Component context
            }
          },
        },
      },
    );
    await supabase.auth.exchangeCodeForSession(code);

    // Provision User + personal Organization on first sign-in
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user?.id && user.email) {
        const email = user.email;
        const fullName = user.user_metadata?.full_name ?? user.user_metadata?.name ?? null;

        await prisma.$transaction(async (tx) => {
          await tx.user.upsert({
            where: { supabaseUserId: user.id },
            update: {},
            create: {
              supabaseUserId: user.id,
              email,
              fullName,
              memberships: {
                create: {
                  role: 'owner',
                  organization: {
                    create: {
                      name: 'Personal',
                      slug: `personal-${user.id.slice(0, 8)}`,
                    },
                  },
                },
              },
            },
          });
        });
      }
    } catch (provisioningError) {
      console.error('[auth/callback] User provisioning failed:', provisioningError);
    }
  }

  return NextResponse.redirect(new URL('/', requestUrl.origin));
}
