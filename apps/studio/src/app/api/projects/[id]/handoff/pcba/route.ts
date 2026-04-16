import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAuth } from '@/lib/auth/require-auth';
import { verifyProjectOwnership } from '@/lib/data/project-queries';
import { createHandoffRequest } from '@/lib/data/artifact-queries';
import { createAuditEntry } from '@/lib/data/audit-queries';

const PCBAHandoffSchema = z.object({
  quantity: z.number().int().positive().default(100),
  quoteId: z.string().optional(),
});

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;

  try {
    const { id } = await params;
    const ownership = await verifyProjectOwnership(id, auth.user.id);
    if (!ownership.authorized) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const body = await request.json();
    const parsed = PCBAHandoffSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const { quantity, quoteId } = parsed.data;

    const handoff = await createHandoffRequest(id, {
      type: 'pcba_quote',
      quantity,
      quoteId,
    });

    await createAuditEntry(id, {
      category: 'handoff',
      action: 'pcba_quote_requested',
      actor: auth.user.id,
      details: { quantity, handoffId: handoff.id },
    });

    return NextResponse.json({
      handoffId: handoff.id,
      projectId: id,
      type: 'pcba_quote',
      status: handoff.status,
      message: 'PCBA quote request submitted',
      quantity: handoff.quantity,
      nextSteps: [
        'Raino engineering team will review your design files',
        'A formal PCBA quote will be prepared within 2 business days',
        'You will receive an email notification when the quote is ready',
        'Our team may reach out with clarifying questions',
      ],
    });
  } catch {
    return NextResponse.json({ error: 'Failed to submit PCBA handoff request' }, { status: 400 });
  }
}
