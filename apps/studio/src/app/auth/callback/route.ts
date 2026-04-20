import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { prisma } from '@raino/db';

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
          set(name: string, value: string, options: any) {
            cookieStore.set({ name, value, ...options });
          },
          remove(name: string, options: any) {
            cookieStore.delete({ name, ...options });
          },
        },
      }
    );

    const { data: { user }, error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error && user) {
      // Auto-provision user and organization
      try {
        await prisma.$transaction(async (tx) => {
          let dbUser = await tx.user.findFirst({
            where: { email: user.email! }
          });

          if (!dbUser) {
            dbUser = await tx.user.create({
              data: {
                supabase_user_id: user.id,
                email: user.email!,
                full_name: user.user_metadata?.full_name || 'New User',
                updated_at: new Date(),
              }
            });
          }

          const membership = await tx.organizationMember.findFirst({
            where: { user_id: dbUser.id }
          });

          if (!membership) {
            const org = await tx.organization.create({
              data: {
                name: `${dbUser.full_name || 'User'}'s Org`,
                slug: `org-${dbUser.id.slice(0, 8)}`,
                updated_at: new Date(),
              }
            });

            await tx.organizationMember.create({
              data: {
                user_id: dbUser.id,
                organization_id: org.id,
                role: 'owner'
              }
            });
          }
        });
      } catch (dbError) {
        console.error('Failed to provision user/org:', dbError);
      }
    }
  }

  return NextResponse.redirect(requestUrl.origin);
}
