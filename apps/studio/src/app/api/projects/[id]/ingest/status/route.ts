import { NextRequest, NextResponse } from 'next/server';

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    return NextResponse.json({
      projectId: id,
      runId: 'run-1706140800000',
      status: 'completed',
      progress: 100,
      stages: [
        { name: 'datasheet_fetch', status: 'completed', documentsProcessed: 3 },
        { name: 'errata_check', status: 'completed', documentsProcessed: 1 },
        { name: 'app_note_fetch', status: 'completed', documentsProcessed: 2 },
        { name: 'chunking', status: 'completed', chunksCreated: 48 },
        { name: 'embedding', status: 'completed', vectorsCreated: 48 },
        { name: 'sufficiency_gate', status: 'passed', gapsFound: 0 },
      ],
    });
  } catch {
    return NextResponse.json({ error: 'Failed to retrieve ingest status' }, { status: 400 });
  }
}
