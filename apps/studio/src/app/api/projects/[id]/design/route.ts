import { NextRequest, NextResponse } from 'next/server';

export async function POST(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    return NextResponse.json({
      projectId: id,
      designId: `design-${Date.now()}`,
      status: 'generated',
      files: ['schematic.kicad_sch', 'pcb.kicad_pcb'],
    });
  } catch {
    return NextResponse.json({ error: 'Failed to generate design' }, { status: 400 });
  }
}
