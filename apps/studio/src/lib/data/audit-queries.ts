/**
 * Audit entry queries using Supabase client directly.
 * Bypasses Prisma ORM to avoid the table name mapping issue.
 */
import { getSupabaseAdmin } from '@/lib/db/supabase-admin';
import type { DbAuditEntry } from '@/lib/db/supabase-admin';

export async function getAuditEntries(projectId: string) {
  const db = getSupabaseAdmin();
  const { data, error } = await db
    .from('audit_entries')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false });

  if (error) throw new Error(`getAuditEntries failed: ${error.message}`);
  return (data ?? []) as DbAuditEntry[];
}

export async function createAuditEntry(
  projectId: string,
  data: {
    category: string;
    action: string;
    actor: string;
    details?: Record<string, unknown>;
    severity?: string;
    source?: string;
  },
) {
  const db = getSupabaseAdmin();
  const { data: entry, error } = await db
    .from('audit_entries')
    .insert({
      project_id: projectId,
      category: data.category,
      action: data.action,
      actor: data.actor,
      details: data.details ?? null,
      severity: data.severity ?? 'info',
      source: data.source ?? 'studio-api',
    })
    .select()
    .single();

  if (error) throw new Error(`createAuditEntry failed: ${error.message}`);
  return entry as DbAuditEntry;
}
