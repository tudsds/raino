import { NextRequest, NextResponse } from 'next/server';
import { mockBOM } from '@/lib/mock-data';

export async function POST(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    return NextResponse.json({
      projectId: id,
      bom: mockBOM,
      generatedAt: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json({ error: 'Failed to generate BOM' }, { status: 400 });
  }
}
