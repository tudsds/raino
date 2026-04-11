import { NextRequest, NextResponse } from 'next/server';

export async function POST(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    return NextResponse.json({
      projectId: id,
      runId: `run-${Date.now()}`,
      status: 'started',
      message: 'Ingestion pipeline started',
    });
  } catch {
    return NextResponse.json({ error: 'Failed to start ingestion run' }, { status: 400 });
  }
}
