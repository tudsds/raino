import { NextRequest, NextResponse } from 'next/server';
import { mockDownloads } from '@/lib/mock-data';

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    return NextResponse.json({
      projectId: id,
      downloads: mockDownloads,
    });
  } catch {
    return NextResponse.json({ error: 'Failed to retrieve downloads' }, { status: 400 });
  }
}
