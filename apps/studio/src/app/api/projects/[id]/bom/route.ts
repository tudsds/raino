import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/require-auth';
import { verifyProjectOwnership } from '@/lib/data/project-queries';
import { getBOM } from '@/lib/data/bom-queries';

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;

  try {
    const { id } = await params;
    const ownership = await verifyProjectOwnership(id, auth.user.id);
    if (!ownership.authorized) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const bom = await getBOM(id);

    return NextResponse.json({
      projectId: id,
      bom: bom
        ? {
            id: bom.id,
            totalCost: Number(bom.total_cost),
            currency: bom.currency,
            lineCount: bom.line_count,
            isEstimate: bom.is_estimate,
            items: bom.rows.map((r) => ({
              id: r.id,
              ref: r.ref,
              value: r.value,
              mpn: r.mpn,
              manufacturer: r.manufacturer,
              package: r.package,
              quantity: r.quantity,
              unitPrice: Number(r.unit_price),
              currency: r.currency,
              lifecycle: r.lifecycle,
              risk: r.risk,
              description: r.description ?? '',
              alternates: r.alternates ?? [],
            })),
          }
        : null,
    });
  } catch {
    return NextResponse.json({ projectId: '', bom: null, meta: { mode: 'degraded' } });
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;

  try {
    const { id } = await params;
    const ownership = await verifyProjectOwnership(id, auth.user.id);
    if (!ownership.authorized) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const body = await request.json();

    return NextResponse.json({
      projectId: id,
      message: 'BOM update received',
      updatedItem: body,
    });
  } catch {
    return NextResponse.json({ error: 'Failed to update BOM' }, { status: 400 });
  }
}
