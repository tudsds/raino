/**
 * Quote queries using Supabase client directly.
 * Bypasses Prisma ORM to avoid the table name mapping issue.
 */
import { getSupabaseAdmin } from '@/lib/db/supabase-admin';
import type { DbQuote } from '@/lib/db/supabase-admin';

export async function getQuote(projectId: string) {
  const db = getSupabaseAdmin();
  const { data, error } = await db
    .from('quotes')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw new Error(`getQuote failed: ${error.message}`);
  return data as DbQuote | null;
}

export async function createQuote(
  projectId: string,
  data: {
    lowQuote: number;
    midQuote: number;
    highQuote: number;
    confidence: string;
    currency: string;
    assumptions: string[];
    breakdown: Array<{ label: string; value: number }>;
    isEstimate: boolean;
    quantity: number;
  },
) {
  const db = getSupabaseAdmin();
  const { data: quote, error } = await db
    .from('quotes')
    .insert({
      project_id: projectId,
      low_quote: data.lowQuote,
      mid_quote: data.midQuote,
      high_quote: data.highQuote,
      confidence: data.confidence,
      currency: data.currency,
      assumptions: data.assumptions,
      breakdown: data.breakdown,
      is_estimate: data.isEstimate,
      quantity: data.quantity,
    })
    .select()
    .single();

  if (error) throw new Error(`createQuote failed: ${error.message}`);
  return quote as DbQuote;
}
