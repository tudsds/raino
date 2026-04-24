/**
 * BOM queries using Supabase client directly.
 * Bypasses Prisma ORM to avoid the table name mapping issue.
 */
import { getSupabaseAdmin } from '@/lib/db/supabase-admin';
import type { DbBOM, DbBOMRow } from '@/lib/db/supabase-admin';

export async function getBOM(projectId: string) {
  const db = getSupabaseAdmin();
  const { data: bom, error } = await db
    .from('boms')
    .select('*')
    .eq('project_id', projectId)
    .maybeSingle();

  if (error) throw new Error(`getBOM failed: ${error.message}`);
  if (!bom) return null;

  const { data: rows, error: rowsError } = await db
    .from('bom_rows')
    .select('*')
    .eq('bom_id', bom.id);

  if (rowsError) throw new Error(`getBOM rows failed: ${rowsError.message}`);

  return { ...bom, rows: (rows ?? []) as DbBOMRow[] } as DbBOM & { rows: DbBOMRow[] };
}

export async function createBOM(
  projectId: string,
  data: {
    totalCost: number;
    currency: string;
    lineCount: number;
    isEstimate: boolean;
    rows: Array<{
      ref: string;
      value: string;
      mpn: string;
      manufacturer: string;
      pkg: string;
      quantity: number;
      unitPrice: number;
      currency: string;
      lifecycle: string;
      risk: string;
      description?: string;
    }>;
  },
) {
  const db = getSupabaseAdmin();

  // Delete existing BOM if present (project has unique constraint)
  const { data: existing } = await db
    .from('boms')
    .select('id')
    .eq('project_id', projectId)
    .maybeSingle();

  if (existing) {
    await db.from('bom_rows').delete().eq('bom_id', existing.id);
    await db.from('boms').delete().eq('id', existing.id);
  }

  const { data: bom, error: bomError } = await db
    .from('boms')
    .insert({
      project_id: projectId,
      total_cost: data.totalCost,
      currency: data.currency,
      line_count: data.lineCount,
      is_estimate: data.isEstimate,
    })
    .select()
    .single();

  if (bomError) throw new Error(`createBOM failed: ${bomError.message}`);

  const rowsToInsert = data.rows.map((row) => ({
    bom_id: bom.id,
    ref: row.ref,
    value: row.value,
    mpn: row.mpn,
    manufacturer: row.manufacturer,
    package: row.pkg,
    quantity: row.quantity,
    unit_price: row.unitPrice,
    currency: row.currency,
    lifecycle: row.lifecycle,
    risk: row.risk,
    description: row.description ?? null,
  }));

  const { data: rows, error: rowsError } = await db
    .from('bom_rows')
    .insert(rowsToInsert)
    .select();

  if (rowsError) throw new Error(`createBOM rows failed: ${rowsError.message}`);

  return { ...bom, rows: (rows ?? []) as DbBOMRow[] } as DbBOM & { rows: DbBOMRow[] };
}
