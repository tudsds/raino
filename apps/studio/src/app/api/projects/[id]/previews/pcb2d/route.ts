import { NextRequest, NextResponse } from 'next/server';

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    return NextResponse.json({
      projectId: id,
      type: 'pcb2d',
      format: 'svg',
      available: true,
    });
  } catch {
    return NextResponse.json({ error: 'Failed to retrieve PCB 2D preview' }, { status: 400 });
  }
}
