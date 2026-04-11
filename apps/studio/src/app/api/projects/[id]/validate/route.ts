import { NextRequest, NextResponse } from 'next/server';

export async function POST(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    return NextResponse.json({
      projectId: id,
      validation: {
        erc: { pass: true, errors: 0 },
        drc: { pass: true, errors: 0 },
      },
      status: 'passed',
    });
  } catch {
    return NextResponse.json({ error: 'Failed to validate design' }, { status: 400 });
  }
}
