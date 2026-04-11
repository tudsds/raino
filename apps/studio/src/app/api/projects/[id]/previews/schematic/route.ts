import { NextRequest, NextResponse } from 'next/server';

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    return NextResponse.json({
      projectId: id,
      type: 'schematic',
      format: 'svg',
      available: true,
    });
  } catch {
    return NextResponse.json({ error: 'Failed to retrieve schematic preview' }, { status: 400 });
  }
}
