import { NextRequest, NextResponse } from 'next/server';

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    return NextResponse.json({
      projectId: id,
      type: 'pcb3d',
      format: 'glb',
      available: true,
    });
  } catch {
    return NextResponse.json({ error: 'Failed to retrieve PCB 3D preview' }, { status: 400 });
  }
}
