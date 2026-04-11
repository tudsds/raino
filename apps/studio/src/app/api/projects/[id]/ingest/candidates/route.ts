import { NextRequest, NextResponse } from 'next/server';

export async function POST(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const candidates = [
      {
        family: 'ESP32-S3',
        manufacturer: 'Espressif',
        mpns: ['ESP32-S3-WROOM-1-N8R8'],
        requiredDocTypes: ['datasheet', 'app_note'],
      },
    ];

    return NextResponse.json({
      projectId: id,
      candidates,
    });
  } catch {
    return NextResponse.json({ error: 'Failed to retrieve ingest candidates' }, { status: 400 });
  }
}
