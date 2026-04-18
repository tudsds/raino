import { describe, it, expect } from 'vitest';
import { runSufficiencyGate } from '../pipeline/sufficiency-gate.js';
import type { CandidateSet } from '../pipeline/types.js';
import type { DocumentRecord } from '@raino/rag';
import {
  validateBOMCompleteness,
  checkBOMForPlaceholders,
  calculateRoughQuote,
  type BOM,
  type BOMRow,
} from '@raino/core';
import { generateManifest, type ArtifactEntryInput } from '@raino/audit-worker';
import { WorkflowMachine, InvalidTransitionError } from '@raino/agents';

// ── Helpers ──────────────────────────────────────────────────────────────────

const VALID_UUID = '550e8400-e29b-41d4-a716-446655440000';
const VALID_UUID_2 = '660e8400-e29b-41d4-a716-446655440001';

function makeProvenance() {
  return { source: 'DigiKey', timestamp: new Date(), confidence: 0.95 };
}

function makeBOMRow(overrides: Record<string, unknown> = {}): BOMRow {
  return {
    reference: (overrides.reference as string) ?? 'U1',
    value: (overrides.value as string) ?? 'STM32F407VGT6',
    symbol: (overrides.symbol as string) ?? 'MCU',
    footprint: (overrides.footprint as string) ?? 'LQFP-100',
    manufacturer: (overrides.manufacturer as string) ?? 'STMicroelectronics',
    mpn: (overrides.mpn as string) ?? 'STM32F407VGT6',
    lifecycle: (overrides.lifecycle as string) ?? 'active',
    stock: overrides.stock as number | undefined,
    unitPrice: overrides.unitPrice as number | undefined,
    alternates: (overrides.alternates as string[]) ?? [],
    dnp: (overrides.dnp as boolean) ?? false,
    provenance: makeProvenance(),
    riskLevel: (overrides.riskLevel as string) ?? 'low',
    ...overrides,
  } as BOMRow;
}

function makeBOM(rows?: BOMRow[]): BOM {
  return {
    id: VALID_UUID,
    projectId: VALID_UUID_2,
    rows: rows ?? [makeBOMRow()],
    createdAt: new Date(),
    updatedAt: new Date(),
    version: 1,
  };
}

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
    normalizedText: overrides.normalizedText ?? 'Reference circuit included.',
    metadata: overrides.metadata ?? {},
  };
}

// ── End-to-end: deliberately bad BOM through full validation pipeline ────────

describe('Cross-cutting integration: deliberately bad BOM', () => {
  it('full validation pipeline catches all issues in a deliberately bad BOM', () => {
    const badBOM = makeBOM([
      makeBOMRow({
        reference: 'U1',
        value: 'TBD',
        mpn: 'FIXME',
        footprint: 'PLACEHOLDER',
        manufacturer: 'UNKNOWN',
        lifecycle: 'unknown',
        riskLevel: 'high',
        alternates: [],
        unitPrice: undefined,
        stock: undefined,
        distributor: undefined,
        datasheetUrl: undefined,
      }),
      makeBOMRow({
        reference: 'U2',
        value: 'TEMP',
        symbol: 'TODO',
        mpn: 'XXXX',
        footprint: 'QFP-48',
        manufacturer: 'UNSPECIFIED',
        package: 'QFN-48',
        lifecycle: 'unknown',
        riskLevel: 'high',
        alternates: [],
        unitPrice: undefined,
        stock: undefined,
      }),
    ]);

    const placeholderResult = checkBOMForPlaceholders(badBOM);
    expect(placeholderResult.hasPlaceholders).toBe(true);
    expect(placeholderResult.placeholders.length).toBeGreaterThanOrEqual(6);

    const completenessResult = validateBOMCompleteness(badBOM);
    expect(completenessResult.warnings.some((w) => w.includes('unitPrice'))).toBe(true);
    expect(completenessResult.warnings.some((w) => w.includes('stock'))).toBe(true);
    expect(completenessResult.warnings.some((w) => w.includes('distributor'))).toBe(true);
    expect(completenessResult.warnings.some((w) => w.includes('lifecycle'))).toBe(true);
    expect(completenessResult.warnings.some((w) => w.includes('high risk'))).toBe(true);
    expect(completenessResult.warnings.some((w) => w.includes('no alternate'))).toBe(true);

    const row1Package = badBOM.rows[0]!.footprint;
    const row2Footprint = badBOM.rows[1]!.footprint;
    const row2Package = badBOM.rows[1]!.package ?? '';
    expect(row1Package).toBe('PLACEHOLDER');
    expect(row2Footprint).not.toBe(row2Package);
  });

  it('sufficiency gate + BOM validation combined catch layered problems', () => {
    const candidate = makeCandidate({
      expectsErrata: true,
      requiresPackageDocs: true,
      requiresAlternates: true,
      retrievalLabels: ['MCU', 'microcontroller', 'high-speed'],
    });

    const documents: DocumentRecord[] = [
      makeDocument({
        sourceType: 'datasheet',
        mpn: candidate.mpn,
        revision: 'rev1',
        normalizedText: 'Basic specifications only.',
      }),
    ];
    const procurement: unknown[] = [];
    const designFields: Record<string, unknown> = {};

    const report = runSufficiencyGate(
      candidate,
      documents,
      procurement,
      designFields,
      'run-cross-1',
    );

    expect(report.overallPass).toBe(false);
    expect(report.gaps.length).toBeGreaterThan(5);

    expect(report.checks.some((c) => c.check === 'errata_exists' && !c.passed)).toBe(true);
    expect(report.checks.some((c) => c.check === 'application_note_exists' && !c.passed)).toBe(
      true,
    );
    expect(report.checks.some((c) => c.check === 'package_documentation_exists' && !c.passed)).toBe(
      true,
    );
    expect(report.checks.some((c) => c.check === 'procurement_data_exists' && !c.passed)).toBe(
      true,
    );
    expect(report.checks.some((c) => c.check === 'approved_footprint_exists' && !c.passed)).toBe(
      true,
    );
    expect(report.checks.some((c) => c.check === 'kicad_field_mapping_exists' && !c.passed)).toBe(
      true,
    );
    expect(report.checks.some((c) => c.check === 'alternate_part_exists' && !c.passed)).toBe(true);
    expect(
      report.checks.some((c) => c.check === 'reference_topology_instantiable' && !c.passed),
    ).toBe(true);

    const badBOM = makeBOM([
      makeBOMRow({
        mpn: candidate.mpn,
        value: 'TBD',
        footprint: 'PLACEHOLDER',
        unitPrice: undefined,
        riskLevel: 'high',
        alternates: [],
      }),
    ]);
    const bomResult = validateBOMCompleteness(badBOM);
    const placeholderResult = checkBOMForPlaceholders(badBOM);

    expect(bomResult.warnings.some((w) => w.includes('unitPrice'))).toBe(true);
    expect(bomResult.warnings.some((w) => w.includes('no alternate'))).toBe(true);
    expect(placeholderResult.hasPlaceholders).toBe(true);
  });

  it('quote engine with bad BOM data degrades confidence appropriately', () => {
    const badBOM = makeBOM([
      makeBOMRow({
        reference: 'U1',
        value: 'STM32F407VGT6',
        unitPrice: 10.0,
        dnp: false,
      }),
      makeBOMRow({
        reference: 'U2',
        value: 'TBD',
        unitPrice: undefined,
        dnp: false,
        symbol: 'IC',
        footprint: 'QFP-48',
        mpn: 'FIXME',
        manufacturer: 'Unknown',
      }),
      makeBOMRow({
        reference: 'U3',
        value: 'TEMP_REG',
        unitPrice: undefined,
        dnp: false,
        symbol: 'REG',
        footprint: 'SOT-223',
        mpn: 'PLACEHOLDER',
        manufacturer: 'TBD',
      }),
    ]);

    const placeholderCheck = checkBOMForPlaceholders(badBOM);
    expect(placeholderCheck.hasPlaceholders).toBe(true);

    const quote = calculateRoughQuote(badBOM, {
      designAutomationFee: 500,
      engineeringReviewFee: 300,
      isEstimate: true,
      assumptions: ['BOM contains placeholder parts — quote is unreliable'],
    });

    expect(quote.confidenceLevel).toBe('low');
    expect(quote.isEstimate).toBe(true);
    expect(quote.componentsEstimate).toBeCloseTo(10.0, 10);
    expect(quote.assumptions).toContain('BOM contains placeholder parts — quote is unreliable');

    const activeRows = badBOM.rows.filter((r) => !r.dnp);
    const rowsWithPrice = badBOM.rows.filter((r) => !r.dnp && r.unitPrice !== undefined);
    const coverage = activeRows.length > 0 ? rowsWithPrice.length / activeRows.length : 0;
    expect(coverage).toBeLessThan(0.5);
  });
});

// ── g. Broken artifact manifests (cross-cutting) ────────────────────────────

describe('Failure mode: broken artifact manifests (cross-cutting)', () => {
  it('detects manifest with wrong checksum after artifact tampering', () => {
    const artifacts: ArtifactEntryInput[] = [
      {
        type: 'schematic',
        filename: 'board.svg',
        path: '/output/board.svg',
        generatedAt: Date.now(),
        source: 'design-worker',
        metadata: {},
      },
    ];

    const manifest = generateManifest('project-1', artifacts);
    const originalChecksum = manifest.artifacts[0]!.checksum;

    const tamperedArtifacts: ArtifactEntryInput[] = [
      {
        ...artifacts[0]!,
        filename: 'tampered.svg',
      },
    ];
    const tamperedManifest = generateManifest('project-1', tamperedArtifacts);

    expect(tamperedManifest.artifacts[0]!.checksum).not.toBe(originalChecksum);
  });

  it('generates deterministic checksums for identical inputs', () => {
    const artifacts: ArtifactEntryInput[] = [
      {
        type: 'bom',
        filename: 'bom.csv',
        path: '/output/bom.csv',
        generatedAt: 1234567890,
        source: 'design-worker',
        metadata: {},
      },
    ];

    const m1 = generateManifest('p1', artifacts);
    const m2 = generateManifest('p1', artifacts);

    expect(m1.artifacts[0]!.checksum).toBe(m2.artifacts[0]!.checksum);
  });

  it('detects checksum mismatch when artifact type is swapped', () => {
    const artifacts: ArtifactEntryInput[] = [
      {
        type: 'schematic',
        filename: 'board.svg',
        path: '/output/board.svg',
        generatedAt: 1000,
        source: 'design-worker',
        metadata: {},
      },
    ];

    const manifest = generateManifest('p1', artifacts);
    const originalChecksum = manifest.artifacts[0]!.checksum;

    const swapped: ArtifactEntryInput[] = [{ ...artifacts[0]!, type: 'pcb' }];
    const swappedManifest = generateManifest('p1', swapped);
    expect(swappedManifest.artifacts[0]!.checksum).not.toBe(originalChecksum);
  });
});

// ── j. Blockers not surfacing (cross-cutting) ───────────────────────────────

describe('Failure mode: blockers not surfacing (cross-cutting)', () => {
  it('sufficiency gate with all failures reports every gap category', () => {
    const candidate: CandidateSet = {
      candidateId: 'cand-all-bad',
      family: 'STM32F4',
      manufacturer: 'STMicroelectronics',
      mpn: 'STM32F407VGT6',
      requiredDocTypes: ['datasheet', 'errata'],
      expectsErrata: true,
      requiresPackageDocs: true,
      requiresAlternates: true,
      retrievalLabels: ['MCU', 'microcontroller', 'WiFi', 'Bluetooth'],
    };

    const documents: DocumentRecord[] = [];
    const procurement: unknown[] = [];
    const designFields: Record<string, unknown> = {};

    const report = runSufficiencyGate(
      candidate,
      documents,
      procurement,
      designFields,
      'run-all-blockers',
    );

    expect(report.overallPass).toBe(false);
    expect(report.gaps.length).toBeGreaterThanOrEqual(9);

    const failedChecks = report.checks.filter((c) => !c.passed);
    expect(failedChecks.length).toBeGreaterThanOrEqual(9);

    expect(failedChecks.some((c) => c.check === 'official_datasheet_exists')).toBe(true);
    expect(failedChecks.some((c) => c.check === 'errata_exists')).toBe(true);
    expect(failedChecks.some((c) => c.check === 'application_note_exists')).toBe(true);
    expect(failedChecks.some((c) => c.check === 'package_documentation_exists')).toBe(true);
    expect(failedChecks.some((c) => c.check === 'procurement_data_exists')).toBe(true);
    expect(failedChecks.some((c) => c.check === 'approved_footprint_exists')).toBe(true);
    expect(failedChecks.some((c) => c.check === 'kicad_field_mapping_exists')).toBe(true);
    expect(failedChecks.some((c) => c.check === 'alternate_part_exists')).toBe(true);
    expect(failedChecks.some((c) => c.check === 'reference_topology_instantiable')).toBe(true);

    expect(report.gaps.length).toBe(failedChecks.length);
  });

  it('every failed check has a non-empty requiredAction', () => {
    const candidate: CandidateSet = {
      candidateId: 'cand-actions',
      family: 'STM32F4',
      manufacturer: 'STMicroelectronics',
      mpn: 'STM32F407VGT6',
      requiredDocTypes: ['datasheet'],
      expectsErrata: false,
      requiresPackageDocs: false,
      requiresAlternates: false,
      retrievalLabels: ['MCU'],
    };

    const report = runSufficiencyGate(candidate, [], [], {}, 'run-actions');

    const failedWithActions = report.checks.filter(
      (c) => !c.passed && c.requiredAction !== undefined,
    );
    expect(failedWithActions.length).toBeGreaterThan(0);
    for (const check of failedWithActions) {
      expect(check.requiredAction!.length).toBeGreaterThan(0);
    }
  });
});

// ── k. Agents continuing after ambiguity (cross-cutting) ────────────────────

describe('Failure mode: agents continuing after ambiguity (cross-cutting)', () => {
  it('WorkflowMachine rejects forward skip past critical states', () => {
    const machine = new WorkflowMachine();

    expect(() => machine.transition('bom_generated')).toThrow(InvalidTransitionError);
    expect(() => machine.transition('design_generated')).toThrow(InvalidTransitionError);
    expect(() => machine.transition('handed_off')).toThrow(InvalidTransitionError);
    expect(machine.getCurrentState()).toBe('intake');
  });

  it('WorkflowMachine rejects backward transition from design to intake', () => {
    const machine = new WorkflowMachine('design_generated');
    expect(() => machine.transition('intake')).toThrow(InvalidTransitionError);
    expect(() => machine.transition('clarifying')).toThrow(InvalidTransitionError);
  });

  it('WorkflowMachine rejects jump from spec_compiled to bom_generated', () => {
    const machine = new WorkflowMachine();
    machine.transition('clarifying');
    machine.transition('spec_compiled');

    expect(() => machine.transition('bom_generated')).toThrow(InvalidTransitionError);
    expect(machine.getCurrentState()).toBe('spec_compiled');
  });

  it('WorkflowMachine enforces correct sequential path', () => {
    const machine = new WorkflowMachine();
    machine.transition('clarifying');
    machine.transition('spec_compiled');
    machine.transition('architecture_planned');
    machine.transition('candidates_discovered');
    machine.transition('ingested');
    machine.transition('bom_generated');
    machine.transition('design_pending');
    machine.transition('design_generated');
    machine.transition('validated');
    machine.transition('exported');
    machine.transition('quoted');
    machine.transition('handed_off');

    expect(machine.getCurrentState()).toBe('handed_off');
    expect(machine.getHistory()).toHaveLength(12);
  });

  it('handed_off is a terminal state with no valid transitions', () => {
    const machine = new WorkflowMachine('handed_off');
    expect(() => machine.transition('intake')).toThrow(InvalidTransitionError);
    expect(() => machine.transition('exported')).toThrow(InvalidTransitionError);
    expect(machine.getCurrentState()).toBe('handed_off');
  });
});
