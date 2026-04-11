import { NextRequest, NextResponse } from 'next/server';

export async function POST(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    return NextResponse.json({
      projectId: id,
      promoted: true,
      candidateCount: 8,
    });
  } catch {
    return NextResponse.json({ error: 'Failed to promote ingest candidates' }, { status: 400 });
  }
}
