import { describe, it, expect } from 'vitest';
import { runSufficiencyGate, type IngestionState } from '../ingestion/sufficiency-gate.js';

// ── Helpers ──────────────────────────────────────────────────────────────────

const PROJECT_ID = '550e8400-e29b-41d4-a716-446655440000';

function makePassingState(): IngestionState {
  return {
    stages: [
      { name: 'datasheet_fetch', status: 'completed' },
      { name: 'errata_check', status: 'completed' },
      { name: 'app_note_fetch', status: 'completed' },
      { name: 'chunking', status: 'completed' },
      { name: 'embedding', status: 'completed' },
    ],
    candidateFamilies: [
      {
        family: 'STM32F4',
        manufacturer: 'STMicroelectronics',
        mpns: ['STM32F407VGT6'],
        documentTypes: ['datasheet', 'errata'],
      },
    ],
  };
}

// ── Overall pass ─────────────────────────────────────────────────────────────

describe('runSufficiencyGate', () => {
  it('returns overall pass when all checks pass', () => {
    const report = runSufficiencyGate(PROJECT_ID, makePassingState());
    expect(report.overallPass).toBe(true);
    expect(report.gaps).toHaveLength(0);
    expect(report.checks.length).toBeGreaterThanOrEqual(5);
    expect(report.projectId).toBe(PROJECT_ID);
  });

  // ── Candidate families ───────────────────────────────────────────────────

  it('returns overall fail when candidate families are missing', () => {
    const state = makePassingState();
    state.candidateFamilies = [];
    const report = runSufficiencyGate(PROJECT_ID, state);
    expect(report.overallPass).toBe(false);
    expect(report.gaps).toContain('candidate_families');
    expect(report.checks.find((c) => c.name === 'candidate_families_exist')?.passed).toBe(false);
  });

  it('returns overall fail when no MPNs exist', () => {
    const state = makePassingState();
    state.candidateFamilies = [
      {
        family: 'STM32F4',
        manufacturer: 'STMicroelectronics',
        mpns: [],
        documentTypes: ['datasheet'],
      },
    ];
    const report = runSufficiencyGate(PROJECT_ID, state);
    expect(report.overallPass).toBe(false);
    expect(report.gaps).toContain('candidate_families');
    const check = report.checks.find((c) => c.name === 'candidate_families_exist');
    expect(check?.passed).toBe(false);
    expect(check?.details).toContain('no MPNs');
  });

  // ── Incomplete stages ────────────────────────────────────────────────────

  it('returns fail when stages are incomplete', () => {
    const state = makePassingState();
    // Mark critical stages as pending
    state.stages = state.stages.map((s) =>
      s.name === 'datasheet_fetch' ? { ...s, status: 'pending' } : s,
    );
    const report = runSufficiencyGate(PROJECT_ID, state);
    expect(report.overallPass).toBe(false);
    expect(report.gaps).toContain('datasheets');
  });

  it('returns fail when chunking stage is incomplete', () => {
    const state = makePassingState();
    state.stages = state.stages.map((s) =>
      s.name === 'chunking' ? { name: s.name, status: 'in_progress' } : s,
    );
    const report = runSufficiencyGate(PROJECT_ID, state);
    expect(report.overallPass).toBe(false);
    expect(report.gaps).toContain('chunking');
  });

  it('returns fail when embedding stage is incomplete', () => {
    const state = makePassingState();
    state.stages = state.stages.map((s) =>
      s.name === 'embedding' ? { name: s.name, status: 'pending' } : s,
    );
    const report = runSufficiencyGate(PROJECT_ID, state);
    expect(report.overallPass).toBe(false);
    expect(report.gaps).toContain('embeddings');
  });

  it('reports failed stage error in details', () => {
    const state = makePassingState();
    state.stages = state.stages.map((s) =>
      s.name === 'errata_check' ? { name: s.name, status: 'failed', error: 'Network timeout' } : s,
    );
    const report = runSufficiencyGate(PROJECT_ID, state);
    const check = report.checks.find((c) => c.name === 'errata_checked');
    expect(check?.passed).toBe(false);
    expect(check?.details).toBe('Network timeout');
    expect(report.gaps).toContain('errata');
  });

  // ── Application notes (warning-level) ────────────────────────────────────

  it('warns but does not fail on missing application notes', () => {
    const state = makePassingState();
    // Remove the app_note_fetch stage entirely — it should warn, not block
    state.stages = state.stages.filter((s) => s.name !== 'app_note_fetch');
    const report = runSufficiencyGate(PROJECT_ID, state);
    const appNoteCheck = report.checks.find((c) => c.name === 'app_notes_fetched');
    expect(appNoteCheck?.passed).toBe(false);
    // Overall should still pass because app notes are non-blocking
    expect(report.overallPass).toBe(true);
    // app_notes should NOT appear in gaps
    expect(report.gaps).not.toContain('app_notes');
  });

  // ── Gaps list ────────────────────────────────────────────────────────────

  it('returns gaps list when checks fail', () => {
    const state: IngestionState = {
      stages: [],
      candidateFamilies: [],
    };
    const report = runSufficiencyGate(PROJECT_ID, state);
    expect(report.gaps.length).toBeGreaterThan(0);
    expect(report.gaps).toContain('candidate_families');
    expect(report.gaps).toContain('datasheets');
    expect(report.gaps).toContain('errata');
    expect(report.gaps).toContain('chunking');
    expect(report.gaps).toContain('embeddings');
  });

  // ── Empty state ──────────────────────────────────────────────────────────

  it('handles empty state gracefully', () => {
    const state: IngestionState = {
      stages: [],
      candidateFamilies: [],
    };
    const report = runSufficiencyGate(PROJECT_ID, state);
    expect(report.overallPass).toBe(false);
    expect(report.candidateId).toBe('none');
    expect(report.checks.length).toBeGreaterThan(0);
    // document_types_specified should pass vacuously when no families exist
    const docTypesCheck = report.checks.find((c) => c.name === 'document_types_specified');
    expect(docTypesCheck?.passed).toBe(true);
  });

  // ── Candidate ID ─────────────────────────────────────────────────────────

  it('builds candidateId from first MPN of each family', () => {
    const state = makePassingState();
    state.candidateFamilies = [
      {
        family: 'STM32F4',
        manufacturer: 'ST',
        mpns: ['STM32F407VGT6', 'STM32F407VET6'],
        documentTypes: ['datasheet'],
      },
      {
        family: 'STM32H7',
        manufacturer: 'ST',
        mpns: ['STM32H743'],
        documentTypes: ['datasheet'],
      },
    ];
    const report = runSufficiencyGate(PROJECT_ID, state);
    expect(report.candidateId).toBe('STM32F407VGT6,STM32H743');
  });

  // ── Document types ───────────────────────────────────────────────────────

  it('fails document types check when families lack document types', () => {
    const state = makePassingState();
    state.candidateFamilies = [
      {
        family: 'STM32F4',
        manufacturer: 'STMicroelectronics',
        mpns: ['STM32F407VGT6'],
        // No documentTypes specified
      },
    ];
    const report = runSufficiencyGate(PROJECT_ID, state);
    const docTypesCheck = report.checks.find((c) => c.name === 'document_types_specified');
    expect(docTypesCheck?.passed).toBe(false);
  });
});
