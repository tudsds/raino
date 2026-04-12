'use server';

import { createSupabaseServerClient } from '@raino/db';
import { redirect } from 'next/navigation';

export async function logout() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect('/login');
}
