import { describe, it, expect } from 'vitest';
import { runSufficiencyGate } from '../pipeline/sufficiency-gate.js';
import type { CandidateSet } from '../pipeline/types.js';
import type { DocumentRecord } from '@raino/rag';

// ── Helpers ──────────────────────────────────────────────────────────────────

function makeCandidate(overrides: Partial<CandidateSet> = {}): CandidateSet {
  return {
    candidateId: overrides.candidateId ?? 'cand-001',
    family: overrides.family ?? 'STM32F4',
    manufacturer: overrides.manufacturer ?? 'STMicroelectronics',
    mpn: overrides.mpn ?? 'STM32F407VGT6',
    requiredDocTypes: overrides.requiredDocTypes ?? ['datasheet'],
    expectsErrata: overrides.expectsErrata ?? false,
    requiresPackageDocs: overrides.requiresPackageDocs ?? false,
    requiresAlternates: overrides.requiresAlternates ?? false,
    retrievalLabels: overrides.retrievalLabels ?? ['MCU'],
  };
}

function makeDocument(overrides: Partial<DocumentRecord> = {}): DocumentRecord {
  return {
    id: overrides.id ?? 'doc-001',
    sourceUrl: overrides.sourceUrl ?? 'https://example.com/doc.pdf',
    sourceType: overrides.sourceType ?? 'datasheet',
    manufacturer: overrides.manufacturer ?? 'STMicroelectronics',
    partFamily: overrides.partFamily ?? 'STM32F4',
    mpn: overrides.mpn ?? 'STM32F407VGT6',
    revision: overrides.revision ?? 'rev1',
    fetchTimestamp: overrides.fetchTimestamp ?? Date.now(),
    checksum: overrides.checksum ?? 'abc123',
    trustLevel: overrides.trustLevel ?? 'canonical',
    normalizedText: overrides.normalizedText ?? 'Reference circuit diagram included.',
    metadata: overrides.metadata ?? {},
  };
}

function makeFullDocumentSet(mpn: string): DocumentRecord[] {
  return [
    makeDocument({
      mpn,
      sourceType: 'datasheet',
      normalizedText: 'Reference circuit for basic operation.',
      revision: 'rev1',
    }),
    makeDocument({
      id: 'doc-errata',
      mpn,
      sourceType: 'errata',
      normalizedText: 'Errata for silicon rev1.',
      revision: 'rev1',
    }),
    makeDocument({
      id: 'doc-appnote',
      mpn,
      sourceType: 'app_note',
      normalizedText: 'Application note for clock configuration.',
    }),
    makeDocument({
      id: 'doc-pkgdoc',
      mpn,
      sourceType: 'package_doc',
      normalizedText: 'Package outline LQFP-100.',
    }),
    makeDocument({
      id: 'doc-refdesign',
      mpn,
      sourceType: 'ref_design',
      normalizedText: 'Reference design schematic.',
    }),
  ];
}

function makeFullProcurement(mpn: string): Record<string, unknown>[] {
  return [
    {
      manufacturer: 'STMicroelectronics',
      mpn,
      package: 'LQFP-100',
      stock: 5000,
      unitPrice: 12.5,
      moq: 1,
      distributorSku: '497-12345-ND',
      lifecycle: 'active',
    },
  ];
}

function makeFullDesignFields(): Record<string, unknown> {
  return {
    footprint: 'Package_QFP:LQFP-100',
    kicadFieldMapping: { Value: 'STM32F407VGT6', Footprint: 'LQFP-100' },
    alternates: ['STM32F407VGT7', 'STM32F407VET6'],
    hasPlaceholders: false,
  };
}

// ── runSufficiencyGate ────────────────────────────────────────────────────────

describe('runSufficiencyGate', () => {
  // ── 1. All checks pass when all documents and procurement data present ──

  it('passes when all documents, procurement data, and design fields are present', () => {
    const candidate = makeCandidate({
      expectsErrata: true,
      requiresPackageDocs: true,
      requiresAlternates: true,
    });
    const documents = makeFullDocumentSet(candidate.mpn);
    const procurement = makeFullProcurement(candidate.mpn);
    const designFields = makeFullDesignFields();

    const report = runSufficiencyGate(candidate, documents, procurement, designFields, 'run-001');

    expect(report.overallPass).toBe(true);
    expect(report.gaps).toHaveLength(0);
    expect(report.runId).toBe('run-001');
    expect(report.candidateId).toBe('cand-001');
    expect(report.checks.length).toBeGreaterThan(0);
    expect(report.generatedAt).toBeGreaterThan(0);
  });

  // ── 2. Datasheet missing → fails ──

  it('fails when official datasheet is missing', () => {
    const candidate = makeCandidate();
    const documents: DocumentRecord[] = [
      makeDocument({ sourceType: 'app_note', normalizedText: 'Some app note' }),
    ];
    const procurement = makeFullProcurement(candidate.mpn);
    const designFields = makeFullDesignFields();

    const report = runSufficiencyGate(candidate, documents, procurement, designFields, 'run-002');

    expect(report.overallPass).toBe(false);
    const dsCheck = report.checks.find((c) => c.check === 'official_datasheet_exists');
    expect(dsCheck).toBeDefined();
    expect(dsCheck!.passed).toBe(false);
    expect(dsCheck!.details).toContain('No official datasheet');
    expect(dsCheck!.requiredAction).toContain('Fetch official datasheet');
    expect(report.gaps.some((g) => g.includes('datasheet'))).toBe(true);
  });

  // ── 3. Errata expected but missing → fails ──

  it('fails when errata is expected but not found', () => {
    const candidate = makeCandidate({ expectsErrata: true });
    const documents = [
      makeDocument({ sourceType: 'datasheet' }),
      // No errata document
    ];
    const procurement = makeFullProcurement(candidate.mpn);
    const designFields = makeFullDesignFields();

    const report = runSufficiencyGate(candidate, documents, procurement, designFields, 'run-003');

    expect(report.overallPass).toBe(false);
    const errataCheck = report.checks.find((c) => c.check === 'errata_exists');
    expect(errataCheck).toBeDefined();
    expect(errataCheck!.passed).toBe(false);
    expect(errataCheck!.requiredAction).toContain('Fetch errata');
  });

  // ── 4. Complex part missing app note → fails ──

  it('fails when complex part is missing application note', () => {
    const candidate = makeCandidate({
      retrievalLabels: ['MCU', 'microcontroller', 'high-speed'],
    });
    const documents = [
      makeDocument({ sourceType: 'datasheet' }),
      // No app_note for complex part
    ];
    const procurement = makeFullProcurement(candidate.mpn);
    const designFields = makeFullDesignFields();

    const report = runSufficiencyGate(candidate, documents, procurement, designFields, 'run-004');

    expect(report.overallPass).toBe(false);
    const appNoteCheck = report.checks.find((c) => c.check === 'application_note_exists');
    expect(appNoteCheck).toBeDefined();
    expect(appNoteCheck!.passed).toBe(false);
    expect(appNoteCheck!.details).toContain('complex part');
  });

  // ── 5. Package docs required but missing → fails ──

  it('fails when package documentation is required but missing', () => {
    const candidate = makeCandidate({ requiresPackageDocs: true });
    const documents = [makeDocument({ sourceType: 'datasheet' })];
    const procurement = makeFullProcurement(candidate.mpn);
    const designFields = makeFullDesignFields();

    const report = runSufficiencyGate(candidate, documents, procurement, designFields, 'run-005');

    expect(report.overallPass).toBe(false);
    const pkgCheck = report.checks.find((c) => c.check === 'package_documentation_exists');
    expect(pkgCheck).toBeDefined();
    expect(pkgCheck!.passed).toBe(false);
    expect(pkgCheck!.requiredAction).toContain('package documentation');
  });

  // ── 6. Procurement data completely missing → fails ──

  it('fails when procurement data is completely missing', () => {
    const candidate = makeCandidate();
    const documents = makeFullDocumentSet(candidate.mpn);
    const procurement: unknown[] = [];
    const designFields = makeFullDesignFields();

    const report = runSufficiencyGate(candidate, documents, procurement, designFields, 'run-006');

    expect(report.overallPass).toBe(false);
    const procCheck = report.checks.find((c) => c.check === 'procurement_data_exists');
    expect(procCheck).toBeDefined();
    expect(procCheck!.passed).toBe(false);
    expect(procCheck!.details).toContain('No procurement data');
  });

  // ── 7. Individual procurement fields missing → reports gaps ──

  it('reports gaps for individual missing procurement fields', () => {
    const candidate = makeCandidate();
    const documents = makeFullDocumentSet(candidate.mpn);
    const procurement = [
      {
        manufacturer: 'STMicroelectronics',
        mpn: candidate.mpn,
        package: 'LQFP-100',
        // stock missing
        // unitPrice missing
        moq: 1,
        distributorSku: '497-12345-ND',
        lifecycle: 'active',
      },
    ];
    const designFields = makeFullDesignFields();

    const report = runSufficiencyGate(candidate, documents, procurement, designFields, 'run-007');

    expect(report.overallPass).toBe(false);
    const stockCheck = report.checks.find((c) => c.check === 'procurement_stock_present');
    const priceCheck = report.checks.find((c) => c.check === 'procurement_unitPrice_present');
    expect(stockCheck).toBeDefined();
    expect(stockCheck!.passed).toBe(false);
    expect(priceCheck).toBeDefined();
    expect(priceCheck!.passed).toBe(false);
  });

  // ── 8. Footprint missing → fails ──

  it('fails when footprint is missing', () => {
    const candidate = makeCandidate();
    const documents = makeFullDocumentSet(candidate.mpn);
    const procurement = makeFullProcurement(candidate.mpn);
    const designFields: Record<string, unknown> = {
      kicadFieldMapping: { Value: 'STM32F407VGT6' },
      alternates: [],
    };

    const report = runSufficiencyGate(candidate, documents, procurement, designFields, 'run-008');

    expect(report.overallPass).toBe(false);
    const fpCheck = report.checks.find((c) => c.check === 'approved_footprint_exists');
    expect(fpCheck).toBeDefined();
    expect(fpCheck!.passed).toBe(false);
    expect(fpCheck!.details).toContain('No footprint');
  });

  // ── 9. KiCad field mapping missing → fails ──

  it('fails when KiCad field mapping is missing', () => {
    const candidate = makeCandidate();
    const documents = makeFullDocumentSet(candidate.mpn);
    const procurement = makeFullProcurement(candidate.mpn);
    const designFields: Record<string, unknown> = {
      footprint: 'Package_QFP:LQFP-100',
    };

    const report = runSufficiencyGate(candidate, documents, procurement, designFields, 'run-009');

    expect(report.overallPass).toBe(false);
    const mappingCheck = report.checks.find((c) => c.check === 'kicad_field_mapping_exists');
    expect(mappingCheck).toBeDefined();
    expect(mappingCheck!.passed).toBe(false);
    expect(mappingCheck!.details).toContain('KiCad field mapping');
  });

  // ── 10. Alternates required but missing → fails ──

  it('fails when alternates are required but not provided', () => {
    const candidate = makeCandidate({ requiresAlternates: true });
    const documents = makeFullDocumentSet(candidate.mpn);
    const procurement = makeFullProcurement(candidate.mpn);
    const designFields: Record<string, unknown> = {
      footprint: 'Package_QFP:LQFP-100',
      kicadFieldMapping: { Value: 'STM32F407VGT6' },
      alternates: [],
      hasPlaceholders: false,
    };

    const report = runSufficiencyGate(candidate, documents, procurement, designFields, 'run-010');

    expect(report.overallPass).toBe(false);
    const altCheck = report.checks.find((c) => c.check === 'alternate_part_exists');
    expect(altCheck).toBeDefined();
    expect(altCheck!.passed).toBe(false);
    expect(altCheck!.requiredAction).toContain('alternate parts');
  });

  // ── 11. Datasheet-errata revision contradiction → detected ──

  it('detects contradiction between datasheet and errata revisions', () => {
    const candidate = makeCandidate({ expectsErrata: true });
    const documents = [
      makeDocument({
        sourceType: 'datasheet',
        revision: 'rev2',
        mpn: candidate.mpn,
      }),
      makeDocument({
        id: 'doc-errata-conflict',
        sourceType: 'errata',
        revision: 'rev3',
        mpn: candidate.mpn,
        normalizedText: 'Errata for older silicon.',
      }),
    ];
    const procurement = makeFullProcurement(candidate.mpn);
    const designFields = makeFullDesignFields();

    const report = runSufficiencyGate(candidate, documents, procurement, designFields, 'run-011');

    const contradictionCheck = report.checks.find(
      (c) => c.check === 'no_datasheet_errata_contradiction',
    );
    expect(contradictionCheck).toBeDefined();
    expect(contradictionCheck!.passed).toBe(false);
    expect(contradictionCheck!.details).toContain('rev2');
    expect(contradictionCheck!.details).toContain('rev3');
    expect(contradictionCheck!.requiredAction).toContain('Verify consistency');
  });

  // ── 12. Placeholder content in documents → detected ──

  it('detects placeholder content in documents', () => {
    const candidate = makeCandidate();
    const documents = [
      makeDocument({
        sourceType: 'datasheet',
        mpn: candidate.mpn,
        normalizedText: 'This is [DEGRADED] content from fixture mode.',
      }),
    ];
    const procurement = makeFullProcurement(candidate.mpn);
    const designFields = makeFullDesignFields();

    const report = runSufficiencyGate(candidate, documents, procurement, designFields, 'run-012');

    const placeholderCheck = report.checks.find((c) => c.check === 'no_placeholder_critical_parts');
    expect(placeholderCheck).toBeDefined();
    expect(placeholderCheck!.passed).toBe(false);
    expect(placeholderCheck!.details).toContain('Placeholder');
  });

  // ── 13. Reference topology not found → fails ──

  it('fails when reference topology is not found', () => {
    const candidate = makeCandidate();
    const documents = [
      makeDocument({
        sourceType: 'datasheet',
        mpn: candidate.mpn,
        normalizedText: 'Electrical specifications only.',
      }),
    ];
    const procurement = makeFullProcurement(candidate.mpn);
    const designFields = makeFullDesignFields();

    const report = runSufficiencyGate(candidate, documents, procurement, designFields, 'run-013');

    const topoCheck = report.checks.find((c) => c.check === 'reference_topology_instantiable');
    expect(topoCheck).toBeDefined();
    expect(topoCheck!.passed).toBe(false);
    expect(topoCheck!.details).toContain('No reference topology');
    expect(topoCheck!.requiredAction).toContain('reference topology');
  });

  // ── 14. BOM with placeholders → fails ──

  it('fails when BOM contains placeholders in design fields', () => {
    const candidate = makeCandidate();
    const documents = makeFullDocumentSet(candidate.mpn);
    const procurement = makeFullProcurement(candidate.mpn);
    const designFields: Record<string, unknown> = {
      footprint: 'Package_QFP:LQFP-100',
      kicadFieldMapping: { Value: 'STM32F407VGT6' },
      hasPlaceholders: true,
    };

    const report = runSufficiencyGate(candidate, documents, procurement, designFields, 'run-014');

    const bomCheck = report.checks.find((c) => c.check === 'bom_emittable_without_placeholders');
    expect(bomCheck).toBeDefined();
    expect(bomCheck!.passed).toBe(false);
    expect(bomCheck!.details).toContain('critical placeholders');
  });

  // ── 15. Overall pass when all checks pass ──

  it('reports overallPass true with empty gaps when everything is satisfied', () => {
    const candidate = makeCandidate({
      expectsErrata: true,
      requiresPackageDocs: true,
      requiresAlternates: true,
      retrievalLabels: ['MCU', 'microcontroller'],
    });
    const documents = makeFullDocumentSet(candidate.mpn);
    const procurement = makeFullProcurement(candidate.mpn);
    const designFields = makeFullDesignFields();

    const report = runSufficiencyGate(candidate, documents, procurement, designFields, 'run-015');

    expect(report.overallPass).toBe(true);
    expect(report.gaps).toHaveLength(0);
    expect(report.checks.every((c) => c.passed)).toBe(true);
  });

  // ── 16. Documents for wrong MPN are ignored ──

  it('ignores documents matching a different MPN', () => {
    const candidate = makeCandidate({ mpn: 'STM32F407VGT6' });
    const documents = [
      makeDocument({
        mpn: 'STM32F407VET6',
        sourceType: 'datasheet',
        normalizedText: 'Reference circuit for different part.',
      }),
    ];
    const procurement = makeFullProcurement(candidate.mpn);
    const designFields = makeFullDesignFields();

    const report = runSufficiencyGate(candidate, documents, procurement, designFields, 'run-016');

    expect(report.overallPass).toBe(false);
    const dsCheck = report.checks.find((c) => c.check === 'official_datasheet_exists');
    expect(dsCheck).toBeDefined();
    expect(dsCheck!.passed).toBe(false);
  });

  // ── Bonus: reference topology found via datasheet content ──

  it('finds reference topology embedded in datasheet text', () => {
    const candidate = makeCandidate();
    const documents = [
      makeDocument({
        sourceType: 'datasheet',
        mpn: candidate.mpn,
        normalizedText: 'Section 4.2: reference circuit for minimal operation.',
      }),
    ];
    const procurement = makeFullProcurement(candidate.mpn);
    const designFields = makeFullDesignFields();

    const report = runSufficiencyGate(candidate, documents, procurement, designFields, 'run-017');

    const topoCheck = report.checks.find((c) => c.check === 'reference_topology_instantiable');
    expect(topoCheck).toBeDefined();
    expect(topoCheck!.passed).toBe(true);
  });

  // ── Bonus: placeholder content detected via metadata degraded flag ──

  it('detects placeholder content via degraded metadata flag', () => {
    const candidate = makeCandidate();
    const documents = [
      makeDocument({
        sourceType: 'datasheet',
        mpn: candidate.mpn,
        normalizedText: 'Valid content.',
        metadata: { degraded: true },
      }),
    ];
    const procurement = makeFullProcurement(candidate.mpn);
    const designFields = makeFullDesignFields();

    const report = runSufficiencyGate(candidate, documents, procurement, designFields, 'run-018');

    const placeholderCheck = report.checks.find((c) => c.check === 'no_placeholder_critical_parts');
    expect(placeholderCheck).toBeDefined();
    expect(placeholderCheck!.passed).toBe(false);
  });

  // ── Bonus: no contradiction when revisions match ──

  it('passes consistency check when datasheet and errata share same revision', () => {
    const candidate = makeCandidate({ expectsErrata: true });
    const documents = [
      makeDocument({
        sourceType: 'datasheet',
        revision: 'rev2',
        mpn: candidate.mpn,
        normalizedText: 'Datasheet content.',
      }),
      makeDocument({
        id: 'doc-errata-match',
        sourceType: 'errata',
        revision: 'rev2',
        mpn: candidate.mpn,
        normalizedText: 'Errata for rev2.',
      }),
    ];
    const procurement = makeFullProcurement(candidate.mpn);
    const designFields = makeFullDesignFields();

    const report = runSufficiencyGate(candidate, documents, procurement, designFields, 'run-019');

    const contradictionCheck = report.checks.find(
      (c) => c.check === 'no_datasheet_errata_contradiction',
    );
    expect(contradictionCheck).toBeDefined();
    expect(contradictionCheck!.passed).toBe(true);
  });

  // ── Bonus: procurement data with empty string values counts as missing ──

  it('reports gaps when procurement fields have empty string values', () => {
    const candidate = makeCandidate();
    const documents = makeFullDocumentSet(candidate.mpn);
    const procurement = [
      {
        manufacturer: '',
        mpn: candidate.mpn,
        package: '',
        stock: 5000,
        unitPrice: 12.5,
        moq: 1,
        distributorSku: '',
        lifecycle: '',
      },
    ];
    const designFields = makeFullDesignFields();

    const report = runSufficiencyGate(candidate, documents, procurement, designFields, 'run-020');

    expect(report.overallPass).toBe(false);
    const mfgCheck = report.checks.find((c) => c.check === 'procurement_manufacturer_present');
    expect(mfgCheck).toBeDefined();
    expect(mfgCheck!.passed).toBe(false);
  });
});
