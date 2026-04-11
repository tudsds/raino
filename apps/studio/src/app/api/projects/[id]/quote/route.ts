import { NextRequest, NextResponse } from 'next/server';
import { mockQuote } from '@/lib/mock-data';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();

    const quote = {
      ...mockQuote,
      projectId: id,
      quantity: body.quantity || 1,
      generatedAt: new Date().toISOString(),
    };

    return NextResponse.json({
      projectId: id,
      quote,
    });
  } catch {
    return NextResponse.json({ error: 'Failed to generate quote' }, { status: 400 });
  }
}
