import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/require-auth';
import { verifyProjectOwnership } from '@/lib/data/project-queries';
import { getAuditEntries } from '@/lib/data/audit-queries';

// TODO: The audit worker service (@raino/audit-worker) exports functions that could
// enrich this endpoint once wired as a studio dependency:
//
// 1. `validatePolicies(projectState)` — pure function that checks workflow ordering
//    (e.g. spec before BOM, architecture before design, no placeholders before export).
//    Integration: import from @raino/audit-worker, pass current project state from Prisma.
//
// 2. `generateManifest(projectId, artifacts)` — produces a checksummed artifact manifest
//    for provenance tracking. Integration: call after each artifact-generating step.
//
// 3. `generateAuditReport(projectId, traceStore, manifest, policyChecks, bomProvenance)`
//    — full audit report combining traces, manifests, policy checks, and BOM provenance.
//    Integration: requires an AuditTraceStore adapter bridging Prisma entries to the
//    AuditTrace interface, then call from this GET handler.
//
// These are currently standalone exports from services/audit-worker/src/.
// Add `@raino/audit-worker` to studio dependencies and import directly (no HTTP needed).

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;

  try {
    const { id } = await params;
    const ownership = await verifyProjectOwnership(id, auth.user.id);
    if (!ownership.authorized) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const entries = await getAuditEntries(id);

    return NextResponse.json({
      projectId: id,
      audit: {
        traceCount: entries.length,
        lastAction: entries[0]?.action ?? null,
        entries: entries.map((e) => ({
          id: e.id,
          timestamp: e.created_at,
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
