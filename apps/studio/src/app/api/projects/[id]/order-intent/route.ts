import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAuth } from '@/lib/auth/require-auth';
import { createHandoffRequest } from '@/lib/data/artifact-queries';
import { createAuditEntry } from '@/lib/data/audit-queries';

const OrderIntentSchema = z.object({
  quantity: z.number().int().positive().default(100),
  quoteId: z.string().optional(),
});

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;

  try {
    const { id } = await params;
    const body = await request.json();
    const parsed = OrderIntentSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const { quantity, quoteId } = parsed.data;

    const handoff = await createHandoffRequest(id, {
      type: 'order_intent',
      quantity,
      quoteId,
      metadata: { submittedVia: 'studio' },
    });

    await createAuditEntry(id, {
      category: 'handoff',
      action: 'order_intent_submitted',
      actor: auth.user.id,
      details: { quantity, handoffId: handoff.id },
    });

    return NextResponse.json({
      orderIntentId: handoff.id,
      projectId: id,
      status: 'submitted',
      quantity: handoff.quantity,
    });
  } catch {
    return NextResponse.json({ error: 'Failed to submit order intent' }, { status: 400 });
  }
}
