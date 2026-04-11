import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();

    return NextResponse.json({
      orderIntentId: `oi-${Date.now()}`,
      projectId: id,
      status: 'submitted',
      quantity: body.quantity || 100,
    });
  } catch {
    return NextResponse.json({ error: 'Failed to submit order intent' }, { status: 400 });
  }
}
