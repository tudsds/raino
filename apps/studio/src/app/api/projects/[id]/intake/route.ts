import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();

    const response = {
      message: {
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content: `Received your message about "${body.message}". I'll help you refine the requirements for project ${id}.`,
        timestamp: new Date().toISOString(),
      },
      projectId: id,
      status: 'processing',
    };

    return NextResponse.json(response);
  } catch {
    return NextResponse.json({ error: 'Failed to process intake message' }, { status: 400 });
  }
}
