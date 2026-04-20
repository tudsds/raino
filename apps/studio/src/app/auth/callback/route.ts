import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { prisma } from '@raino/db';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (code) {
    const supabase = createRouteHandlerClient({ cookies });
    await supabase.auth.exchangeCodeForSession(code);

    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      // Ensure user exists in our DB and has an organization
      await prisma.$transaction(async (tx) => {
        const dbUser = await tx.user.upsert({
          where: { supabaseUserId: user.id },
          update: { email: user.email! },
          create: {
            supabaseUserId: user.id,
            email: user.email!,
            fullName: user.user_metadata?.full_name,
          },
        });

        const existingMembership = await tx.organizationMember.findFirst({
          where: { userId: dbUser.id },
        });

        if (!existingMembership) {
          const org = await tx.organization.create({
            data: {
              name: `${dbUser.fullName || dbUser.email}'s Org`,
              slug: `org-${dbUser.id.slice(0, 8)}`,
            },
          });

          await tx.organizationMember.create({
            data: {
              userId: dbUser.id,
              organizationId: org.id,
              role: 'owner',
            },
          });
        }
      });
    }
  }

  return NextResponse.redirect(requestUrl.origin);
}
