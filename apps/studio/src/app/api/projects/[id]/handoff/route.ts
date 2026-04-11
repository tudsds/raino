import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();

    const handoff = {
      handoffId: `handoff-${Date.now()}`,
      projectId: id,
      status: 'pending',
      type: body.type || 'pcba_quote',
      quantity: body.quantity || 100,
      createdAt: new Date().toISOString(),
      message: 'PCBA quote request submitted successfully',
      nextSteps: [
        'Raino team will review your project',
        'Formal quote will be prepared within 2 business days',
        'You will receive an email notification when ready',
      ],
    };

    return NextResponse.json(handoff, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to submit handoff request' }, { status: 400 });
  }
}
