import { NextRequest, NextResponse } from 'next/server';
import { mockBOM } from '@/lib/mock-data';

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return NextResponse.json({
    projectId: id,
    bom: mockBOM,
  });
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();

    return NextResponse.json({
      projectId: id,
      message: 'BOM updated successfully',
      updatedItem: body,
    });
  } catch {
    return NextResponse.json({ error: 'Failed to update BOM' }, { status: 400 });
  }
}
