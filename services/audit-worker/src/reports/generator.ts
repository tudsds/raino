import type { AuditTrace, AuditTraceStore } from '../traces/logger';
import type { ArtifactManifest } from '../manifests/generator';
import type { PolicyCheck } from '../policy/checker';

export interface BOMProvenanceEntry {
  mpn: string;
  hasProvenance: boolean;
  isEstimate: boolean;
}

export interface AuditReport {
  projectId: string;
  generatedAt: number;
  summary: {
    totalTraces: number;
    categories: Record<string, number>;
    warnings: number;
    errors: number;
  };
  traces: AuditTrace[];
  manifest: ArtifactManifest | null;
  policyChecks: PolicyCheck[];
  provenanceSummary: {
    totalParts: number;
    partsWithProvenance: number;
    partsWithEstimates: number;
    missingProvenance: string[];
  };
}

export async function generateAuditReport(
  projectId: string,
  traceStore: AuditTraceStore,
  manifest: ArtifactManifest | null,
  policyChecks: PolicyCheck[],
  bomProvenance: BOMProvenanceEntry[],
): Promise<AuditReport> {
  const traces = await traceStore.query(projectId);

  const categories: Record<string, number> = {};
  for (const trace of traces) {
    categories[trace.category] = (categories[trace.category] ?? 0) + 1;
  }

  const warnings = policyChecks.filter(
    (check) => !check.passed && check.severity === 'warning',
  ).length;
  const errors = policyChecks.filter((check) => !check.passed && check.severity === 'error').length;

  const totalParts = bomProvenance.length;
  const partsWithProvenance = bomProvenance.filter((p) => p.hasProvenance).length;
  const partsWithEstimates = bomProvenance.filter((p) => p.isEstimate).length;
  const missingProvenance = bomProvenance.filter((p) => !p.hasProvenance).map((p) => p.mpn);

  return {
    projectId,
    generatedAt: Date.now(),
    summary: {
      totalTraces: traces.length,
      categories,
      warnings,
      errors,
    },
    traces,
    manifest,
    policyChecks,
    provenanceSummary: {
      totalParts,
      partsWithProvenance,
      partsWithEstimates,
      missingProvenance,
    },
  };
}
