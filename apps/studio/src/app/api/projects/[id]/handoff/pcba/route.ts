import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();

    return NextResponse.json({
      handoffId: `handoff-${Date.now()}`,
      projectId: id,
      type: 'pcba_quote',
      status: 'pending',
      message: 'PCBA quote request submitted',
      quantity: body.quantity || 100,
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
