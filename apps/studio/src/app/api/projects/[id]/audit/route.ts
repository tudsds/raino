import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/require-auth';
import { getAuditEntries } from '@/lib/data/audit-queries';

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;

  try {
    const { id } = await params;
    const entries = await getAuditEntries(id);

    return NextResponse.json({
      projectId: id,
      audit: {
        traceCount: entries.length,
        lastAction: entries[0]?.action ?? null,
        entries: entries.map((e) => ({
          id: e.id,
          timestamp: e.createdAt.toISOString(),
          action: e.action,
          category: e.category,
          actor: e.actor ?? 'system',
          details: e.details,
          severity: e.severity,
          source: e.source,
        })),
      },
      manifest: {
        generatedAt: new Date().toISOString(),
        version: 1,
      },
    });
  } catch {
    return NextResponse.json({
      projectId: '',
      audit: { traceCount: 0, lastAction: null, entries: [] },
      manifest: { generatedAt: new Date().toISOString(), version: 1 },
      meta: { mode: 'degraded', reason: 'Database not configured' },
    });
  }
}
