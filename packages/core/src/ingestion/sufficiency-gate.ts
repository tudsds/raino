import type { SufficiencyCheck, SufficiencyReport } from '../schemas/ingestion.js';

export interface IngestionState {
  stages: Array<{ name: string; status: string; error?: string }>;
  candidateFamilies: Array<{
    family: string;
    manufacturer: string;
    mpns: string[];
    documentTypes?: string[];
  }>;
}

/**
 * Evaluates whether the ingested engineering documents are sufficient
 * to proceed with BOM generation and downstream design work.
 *
 * Checks:
 * 1. At least one candidate family with MPNs exists
 * 2. Datasheet fetch stage completed
 * 3. Errata check stage completed
 * 4. Application note fetch stage completed (warning-level)
 * 5. Document chunking stage completed
 * 6. Embedding stage completed
 * 7. Each candidate family has at least one document type specified
 */
export function runSufficiencyGate(projectId: string, state: IngestionState): SufficiencyReport {
  const checks: SufficiencyCheck[] = [];
  const gaps: string[] = [];

  // Check 1: Candidate families exist with MPNs
  const hasFamilies = state.candidateFamilies.length > 0;
  const allFamiliesHaveMpns =
    hasFamilies && state.candidateFamilies.every((f) => f.mpns.length > 0);
  checks.push({
    name: 'candidate_families_exist',
    description: 'At least one candidate family with MPNs must be registered',
    passed: hasFamilies && allFamiliesHaveMpns,
    details: !hasFamilies
      ? 'No candidate families registered'
      : !allFamiliesHaveMpns
        ? 'Some candidate families have no MPNs'
        : `${state.candidateFamilies.length} candidate family(ies) with valid MPNs`,
  });
  if (!hasFamilies || !allFamiliesHaveMpns) {
    gaps.push('candidate_families');
  }

  // Helper to check stage status
  const stageCompleted = (name: string): boolean => {
    const stage = state.stages.find((s) => s.name === name);
    return stage?.status === 'completed';
  };

  const stageFailed = (name: string): string | undefined => {
    const stage = state.stages.find((s) => s.name === name);
    if (stage?.status === 'failed') return stage.error ?? 'Stage failed';
    return undefined;
  };

  // Check 2: Datasheet fetch
  const datasheetError = stageFailed('datasheet_fetch');
  checks.push({
    name: 'datasheets_fetched',
    description: 'Datasheets for candidate parts must be fetched',
    passed: stageCompleted('datasheet_fetch'),
    details:
      datasheetError ??
      (stageCompleted('datasheet_fetch') ? 'Datasheets available' : 'Datasheets not yet fetched'),
  });
  if (!stageCompleted('datasheet_fetch')) {
    gaps.push('datasheets');
  }

  // Check 3: Errata check
  const errataError = stageFailed('errata_check');
  checks.push({
    name: 'errata_checked',
    description: 'Errata documents must be checked for known silicon issues',
    passed: stageCompleted('errata_check'),
    details:
      errataError ??
      (stageCompleted('errata_check') ? 'Errata reviewed' : 'Errata not yet checked'),
  });
  if (!stageCompleted('errata_check')) {
    gaps.push('errata');
  }

  // Check 4: Application notes (warning-level — desirable but not blocking)
  checks.push({
    name: 'app_notes_fetched',
    description: 'Application notes should be fetched for reference designs',
    passed: stageCompleted('app_note_fetch'),
    details: stageCompleted('app_note_fetch')
      ? 'Application notes available'
      : 'Application notes not yet fetched — recommended but not required',
  });

  // Check 5: Document chunking
  const chunkingError = stageFailed('chunking');
  checks.push({
    name: 'documents_chunked',
    description: 'Ingested documents must be chunked for RAG retrieval',
    passed: stageCompleted('chunking'),
    details:
      chunkingError ??
      (stageCompleted('chunking') ? 'Documents chunked' : 'Chunking not yet completed'),
  });
  if (!stageCompleted('chunking')) {
    gaps.push('chunking');
  }

  // Check 6: Embedding generation
  const embeddingError = stageFailed('embedding');
  checks.push({
    name: 'embeddings_generated',
    description: 'Document chunks must be embedded for vector retrieval',
    passed: stageCompleted('embedding'),
    details:
      embeddingError ??
      (stageCompleted('embedding') ? 'Embeddings generated' : 'Embedding not yet completed'),
  });
  if (!stageCompleted('embedding')) {
    gaps.push('embeddings');
  }

  // Check 7: Candidate families have document types
  const familiesWithDocTypes = state.candidateFamilies.filter(
    (f) => (f.documentTypes?.length ?? 0) > 0,
  );
  checks.push({
    name: 'document_types_specified',
    description: 'Each candidate family should specify expected document types',
    passed:
      state.candidateFamilies.length === 0 ||
      familiesWithDocTypes.length === state.candidateFamilies.length,
    details:
      state.candidateFamilies.length === 0
        ? 'No candidate families to check'
        : `${familiesWithDocTypes.length}/${state.candidateFamilies.length} families have document types`,
  });

  // Overall pass: critical checks must pass (app_notes is non-blocking)
  const criticalChecks = checks.filter((c) => c.name !== 'app_notes_fetched');
  const overallPass = criticalChecks.every((c) => c.passed);

  const candidateId =
    state.candidateFamilies.length > 0
      ? state.candidateFamilies.map((f) => f.mpns[0]).join(',')
      : 'none';

  return {
    projectId,
    candidateId,
    checks,
    overallPass,
    gaps,
  };
}
