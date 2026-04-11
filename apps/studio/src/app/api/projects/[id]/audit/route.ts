import { NextRequest, NextResponse } from 'next/server';

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    return NextResponse.json({
      projectId: id,
      audit: {
        traceCount: 15,
        lastAction: 'quote_generated',
        entries: [
          {
            timestamp: new Date('2024-01-15T10:00:00').toISOString(),
            action: 'project_created',
            actor: 'user',
          },
          {
            timestamp: new Date('2024-01-15T10:05:00').toISOString(),
            action: 'intake_started',
            actor: 'system',
          },
          {
            timestamp: new Date('2024-01-15T10:35:00').toISOString(),
            action: 'intake_completed',
            actor: 'system',
          },
          {
            timestamp: new Date('2024-01-15T11:00:00').toISOString(),
            action: 'spec_compiled',
            actor: 'system',
          },
          {
            timestamp: new Date('2024-01-15T11:30:00').toISOString(),
            action: 'architecture_selected',
            actor: 'system',
          },
          {
            timestamp: new Date('2024-01-16T09:00:00').toISOString(),
            action: 'ingest_started',
            actor: 'system',
          },
          {
            timestamp: new Date('2024-01-16T09:45:00').toISOString(),
            action: 'ingest_completed',
            actor: 'system',
          },
          {
            timestamp: new Date('2024-01-16T10:00:00').toISOString(),
            action: 'bom_generated',
            actor: 'system',
          },
          {
            timestamp: new Date('2024-01-17T08:00:00').toISOString(),
            action: 'design_generated',
            actor: 'system',
          },
          {
            timestamp: new Date('2024-01-17T08:30:00').toISOString(),
            action: 'validation_passed',
            actor: 'system',
          },
          {
            timestamp: new Date('2024-01-17T09:00:00').toISOString(),
            action: 'previews_generated',
            actor: 'system',
          },
          {
            timestamp: new Date('2024-01-18T10:00:00').toISOString(),
            action: 'artifacts_exported',
            actor: 'system',
          },
          {
            timestamp: new Date('2024-01-18T14:00:00').toISOString(),
            action: 'quote_generated',
            actor: 'system',
          },
          {
            timestamp: new Date('2024-01-18T14:01:00').toISOString(),
            action: 'sufficiency_gate_passed',
            actor: 'system',
          },
          {
            timestamp: new Date('2024-01-18T14:30:00').toISOString(),
            action: 'quote_generated',
            actor: 'system',
          },
        ],
      },
      manifest: {
        checksum: 'abc123',
        generatedAt: new Date().toISOString(),
      },
    });
  } catch {
    return NextResponse.json({ error: 'Failed to retrieve audit trail' }, { status: 400 });
  }
}
