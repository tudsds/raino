import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/db/supabase-admin';
import { getCurrentUser } from '@/lib/auth/get-current-user';

export async function GET() {
  const results: Record<string, unknown> = {};

  // Check env vars
  results.env = {
    hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    hasServiceRoleKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    supabaseUrlPrefix: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 30),
    hasDispatchToken: !!(process.env.GITHUB_ACTIONS_DISPATCH_TOKEN ?? process.env.GITHUB_DISPATCH_TOKEN),
  };

  // Check auth
  try {
    const user = await getCurrentUser();
    results.auth = user ? { id: user.id, email: user.email } : null;
  } catch (e) {
    results.authError = String(e);
  }

  // Test DB connection
  try {
    const db = getSupabaseAdmin();
    const { data, error } = await db.from('users').select('id, email').limit(1);
    results.db = error ? { error: error.message } : { ok: true, count: data?.length };
  } catch (e) {
    results.dbError = String(e);
  }

  // Test getUserOrgId
  try {
    const user = await getCurrentUser();
    if (user) {
      const db = getSupabaseAdmin();
      const { data: userRow, error: userErr } = await db
        .from('users')
        .select('id')
        .eq('supabase_user_id', user.id)
        .maybeSingle();
      results.userRow = userErr ? { error: userErr.message } : userRow;

      if (userRow) {
        const { data: membership, error: memberErr } = await db
          .from('organization_members')
          .select('organization_id')
          .eq('user_id', userRow.id)
          .limit(1)
          .maybeSingle();
        results.membership = memberErr ? { error: memberErr.message } : membership;
      }
    }
  } catch (e) {
    results.orgError = String(e);
  }

  // Test project insert
  try {
    const db = getSupabaseAdmin();
    const { data: orgData } = await db
      .from('organization_members')
      .select('organization_id')
      .limit(1)
      .maybeSingle();
    if (orgData) {
      const { data: project, error: insertErr } = await db
        .from('projects')
        .insert({
          name: '__debug_test__',
          description: 'debug test',
          organization_id: orgData.organization_id,
          status: 'intake',
        })
        .select()
        .single();
      if (insertErr) {
        results.insertError = insertErr.message;
      } else {
        results.insertOk = { id: project.id };
        // Clean up
        await db.from('projects').delete().eq('id', project.id);
      }
    }
  } catch (e) {
    results.insertException = String(e);
  }

  return NextResponse.json(results);
}
