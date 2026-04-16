import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAuth } from '@/lib/auth/require-auth';
import { verifyProjectOwnership } from '@/lib/data/project-queries';
import { createHandoffRequest } from '@/lib/data/artifact-queries';
import { createAuditEntry } from '@/lib/data/audit-queries';

const HandoffSchema = z.object({
  type: z.string().min(1).default('pcba_quote'),
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
    const parsed = HandoffSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const { type, quantity, quoteId } = parsed.data;

    const handoff = await createHandoffRequest(id, {
      type,
      quantity,
      quoteId,
    });

    await createAuditEntry(id, {
      category: 'handoff',
      action: 'handoff_requested',
      actor: auth.user.id,
      details: { type, quantity, handoffId: handoff.id },
    });

    return NextResponse.json(
      {
        handoffId: handoff.id,
        projectId: id,
        status: handoff.status,
        type: handoff.type,
        quantity: handoff.quantity,
        createdAt: handoff.createdAt.toISOString(),
        message: 'Handoff request submitted successfully',
        nextSteps: [
          'Raino team will review your project',
          'Formal quote will be prepared within 2 business days',
          'You will receive an email notification when ready',
        ],
      },
      { status: 201 },
    );
  } catch {
    return NextResponse.json({ error: 'Failed to submit handoff request' }, { status: 400 });
  }
}
