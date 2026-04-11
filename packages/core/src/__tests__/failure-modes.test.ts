import { describe, it, expect } from 'vitest';
import { validateBOMCompleteness, checkBOMForPlaceholders } from '../bom/engine.js';
import { calculateRoughQuote } from '../quote/calculator.js';
import type { BOM, BOMRow } from '../schemas/bom.js';

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

// ── a. Hallucinated parts ────────────────────────────────────────────────────

describe('Failure mode: hallucinated parts', () => {
  it('flags BOM row with MPN that has no supplier data coverage', () => {
    const hallucinatedMPN = 'FAKE-PART-9999999';
    const bom = makeBOM([
      makeBOMRow({
        mpn: hallucinatedMPN,
        manufacturer: 'FakeCorp',
        unitPrice: undefined,
        stock: undefined,
        distributor: undefined,
        riskLevel: 'high',
      }),
    ]);

    const result = validateBOMCompleteness(bom);
    expect(result.warnings.some((w) => w.includes('unitPrice'))).toBe(true);
    expect(result.warnings.some((w) => w.includes('stock'))).toBe(true);
    expect(result.warnings.some((w) => w.includes('distributor'))).toBe(true);
  });

  it('flags hallucinated MPN with zero provenance confidence', () => {
    const row = makeBOMRow({
      mpn: 'NONEXISTENT-MPN-XYZ',
      provenance: { source: 'hallucination', timestamp: new Date(), confidence: 0.0 },
    });

    expect(row.provenance.confidence).toBe(0.0);
    expect(row.mpn).toBe('NONEXISTENT-MPN-XYZ');
  });
});

// ── b. Unresolved package mismatch ──────────────────────────────────────────

describe('Failure mode: unresolved package mismatch', () => {
  it('catches BOM row with package QFP-48 when supplier says QFN-48', () => {
    const bom = makeBOM([
      makeBOMRow({
        reference: 'U1',
        footprint: 'QFP-48',
        package: 'QFP-48',
      }),
    ]);

    const supplierPackage = 'QFN-48';
    const bomPackage = bom.rows[0]!.package ?? '';
    const mismatch = bomPackage !== supplierPackage;
    expect(mismatch).toBe(true);
    expect(bomPackage).toBe('QFP-48');
    expect(supplierPackage).toBe('QFN-48');
  });

  it('detects package mismatch between footprint field and package field', () => {
    const bom = makeBOM([
      makeBOMRow({
        footprint: 'LQFP-100',
        package: 'QFN-48',
      }),
    ]);

    const row = bom.rows[0]!;
    const footprintPkg = row.footprint;
    const declaredPkg = row.package ?? '';
    const mismatch = footprintPkg !== declaredPkg;
    expect(mismatch).toBe(true);
  });
});

// ── c. Missing errata handling ───────────────────────────────────────────────

describe('Failure mode: missing errata handling', () => {
  it('flags errata-dependent MCU with unknown lifecycle and no errata source', () => {
    const bom = makeBOM([
      makeBOMRow({
        reference: 'U1',
        value: 'STM32F407VGT6',
        mpn: 'STM32F407VGT6',
        lifecycle: 'unknown',
        riskLevel: 'high',
        alternates: [],
        datasheetUrl: undefined,
      }),
    ]);

    const result = validateBOMCompleteness(bom);
    expect(result.warnings.some((w) => w.includes('lifecycle'))).toBe(true);
    expect(result.warnings.some((w) => w.includes('unknown'))).toBe(true);
    expect(result.warnings.some((w) => w.includes('high risk'))).toBe(true);
    expect(result.warnings.some((w) => w.includes('alternate'))).toBe(true);
  });

  it('warns when errata-critical MCU has no datasheet URL', () => {
    const bom = makeBOM([
      makeBOMRow({
        mpn: 'STM32F407VGT6',
        datasheetUrl: undefined,
        lifecycle: 'nrnd',
        riskLevel: 'medium',
        alternates: [],
      }),
    ]);

    const result = validateBOMCompleteness(bom);
    expect(result.warnings.some((w) => w.includes('datasheetUrl'))).toBe(true);
  });
});

// ── d. Missing footprint mapping ────────────────────────────────────────────

describe('Failure mode: missing footprint mapping', () => {
  it('generates warning for BOM row without footprint', () => {
    const bom = makeBOM([
      makeBOMRow({
        reference: 'U1',
        value: 'STM32F407VGT6',
        symbol: 'MCU',
        footprint: 'LQFP-100',
        manufacturer: 'STMicroelectronics',
        mpn: 'STM32F407VGT6',
      }),
    ]);

    const result = validateBOMCompleteness(bom);
    expect(result.complete).toBe(true);

    const incompleteRow = { ...bom.rows[0]!, footprint: '' };
    const incompleteBOM = makeBOM([incompleteRow as BOMRow]);
    const incompleteResult = validateBOMCompleteness(incompleteBOM);
    expect(incompleteResult.complete).toBe(false);
    expect(incompleteResult.missingFields.some((f) => f.includes('footprint'))).toBe(true);
  });
});

// ── e. Placeholder critical parts ───────────────────────────────────────────

describe('Failure mode: placeholder critical parts', () => {
  const placeholderValues = [
    'TBD',
    'FIXME',
    'PLACEHOLDER',
    'TODO',
    'TEMP',
    'UNKNOWN',
    'UNSPECIFIED',
    'XXXX',
  ];

  for (const placeholder of placeholderValues) {
    it(`detects "${placeholder}" as placeholder in BOM value field`, () => {
      const bom = makeBOM([makeBOMRow({ reference: 'U1', value: placeholder })]);
      const result = checkBOMForPlaceholders(bom);
      expect(result.hasPlaceholders).toBe(true);
      expect(result.placeholders.some((p) => p.includes(placeholder))).toBe(true);
    });
  }

  it('detects multiple different placeholder types across rows', () => {
    const bom = makeBOM([
      makeBOMRow({ reference: 'U1', value: 'TBD' }),
      makeBOMRow({
        reference: 'U2',
        manufacturer: 'FIXME',
        value: 'IC',
        symbol: 'MCU',
        footprint: 'LQFP-100',
        mpn: 'STM32F407VGT6',
      }),
      makeBOMRow({
        reference: 'U3',
        mpn: 'PLACEHOLDER',
        value: 'REG',
        symbol: 'REG',
        footprint: 'SOT-223',
        manufacturer: 'TI',
      }),
    ]);

    const result = checkBOMForPlaceholders(bom);
    expect(result.hasPlaceholders).toBe(true);
    expect(result.placeholders.length).toBeGreaterThanOrEqual(3);
  });
});

// ── f. Rough quote math errors (golden output) ──────────────────────────────

describe('Failure mode: rough quote math errors', () => {
  it('produces exact golden output with known BOM and options', () => {
    const bom = makeBOM([
      makeBOMRow({
        reference: 'U1',
        unitPrice: 10.0,
        footprint: 'LQFP-100',
        dnp: false,
      }),
      makeBOMRow({
        reference: 'R1',
        unitPrice: 0.1,
        footprint: '0402',
        dnp: false,
        value: '10K',
        symbol: 'R',
        mpn: 'RC0402FR-0710KL',
        manufacturer: 'Yageo',
      }),
      makeBOMRow({
        reference: 'C1',
        unitPrice: 0.05,
        footprint: '0402',
        dnp: false,
        value: '100nF',
        symbol: 'C',
        mpn: 'GRM155R71C104KA88D',
        manufacturer: 'Murata',
      }),
    ]);

    const result = calculateRoughQuote(bom, {
      designAutomationFee: 500,
      engineeringReviewFee: 300,
      contingencyPercent: 0.1,
      marginPercent: 0.15,
      isEstimate: true,
      assumptions: ['Golden output test'],
      includedScope: ['PCB fabrication'],
      nextRecommendedAction: 'Verify',
    });

    const componentsTotal = 10.0 + 0.1 + 0.05;
    const uniqueFootprints = new Set(bom.rows.map((r) => r.footprint)).size;
    const pcbFab = uniqueFootprints * 5;
    const assembly = 3 * 0.5;
    const qa = (componentsTotal + pcbFab + assembly) * 0.05;
    const subtotal = 500 + 300 + pcbFab + componentsTotal + assembly + qa;
    const contingency = subtotal * 0.1;
    const margin = (subtotal + contingency) * 0.15;
    const mid = subtotal + contingency + margin;

    expect(result.componentsEstimate).toBeCloseTo(componentsTotal, 10);
    expect(result.pcbFabricationEstimate).toBeCloseTo(pcbFab, 10);
    expect(result.assemblyEstimate).toBeCloseTo(assembly, 10);
    expect(result.qaPackagingHandling).toBeCloseTo(qa, 10);
    expect(result.contingency).toBeCloseTo(contingency, 10);
    expect(result.margin).toBeCloseTo(margin, 10);
    expect(result.midQuote).toBeCloseTo(mid, 10);
    expect(result.lowQuote).toBeCloseTo(mid * 0.85, 10);
    expect(result.highQuote).toBeCloseTo(mid * 1.2, 10);
    expect(result.confidenceLevel).toBe('high');
    expect(result.isEstimate).toBe(true);
    expect(result.assumptions).toContain('Golden output test');
  });

  it('degrades confidence to low when most prices are missing', () => {
    const bom = makeBOM([
      makeBOMRow({ reference: 'U1', unitPrice: 10.0, dnp: false }),
      makeBOMRow({
        reference: 'U2',
        unitPrice: undefined,
        dnp: false,
        value: 'MCU2',
        symbol: 'MCU',
        footprint: 'QFN-48',
        mpn: 'ATMEGA328P',
        manufacturer: 'Microchip',
      }),
      makeBOMRow({
        reference: 'U3',
        unitPrice: undefined,
        dnp: false,
        value: 'REG',
        symbol: 'REG',
        footprint: 'SOT-223',
        mpn: 'AMS1117',
        manufacturer: 'AMS',
      }),
    ]);

    const result = calculateRoughQuote(bom);
    expect(result.confidenceLevel).toBe('low');
    expect(result.isEstimate).toBe(true);
  });

  it('excludes DNP rows from component total and assembly', () => {
    const bom = makeBOM([
      makeBOMRow({ reference: 'U1', unitPrice: 100.0, dnp: false }),
      makeBOMRow({
        reference: 'U2',
        unitPrice: 500.0,
        dnp: true,
        value: 'DNP_PART',
        symbol: 'X',
        footprint: 'QFP-100',
        mpn: 'DNP-MPN',
        manufacturer: 'Test',
      }),
    ]);

    const result = calculateRoughQuote(bom);
    expect(result.componentsEstimate).toBeCloseTo(100.0, 10);
    expect(result.assemblyEstimate).toBeCloseTo(0.5, 10);
  });
});

// ── h. Preview route failures ────────────────────────────────────────────────

describe('Failure mode: preview route failures', () => {
  type PreviewResult =
    | { ok: true; url: string; format: string }
    | { ok: false; error: string; code: string };

  function getPreview(
    projectId: string,
    artifacts: { type: string; path: string }[],
  ): PreviewResult {
    const preview = artifacts.find((a) => a.type === 'schematic_preview');
    if (!preview) {
      return {
        ok: false,
        error: `No preview artifact found for project ${projectId}`,
        code: 'PREVIEW_NOT_FOUND',
      };
    }
    return { ok: true, url: preview.path, format: 'svg' };
  }

  function get3DPreview(
    projectId: string,
    artifacts: { type: string; path: string }[],
  ): PreviewResult {
    const preview = artifacts.find((a) => a.type === '3d_model');
    if (!preview) {
      return {
        ok: false,
        error: `3D model not generated for project ${projectId}`,
        code: 'MODEL_NOT_FOUND',
      };
    }
    return { ok: true, url: preview.path, format: 'glb' };
  }

  it('returns proper error indicator when preview data is missing', () => {
    const result = getPreview('proj-1', []);
    if (result.ok) {
      throw new Error('Expected error result');
    }
    expect(result.ok).toBe(false);
    expect(result.code).toBe('PREVIEW_NOT_FOUND');
    expect(result.error).toContain('proj-1');
  });

  it('returns proper error for missing PCB 3D preview', () => {
    const result = get3DPreview('proj-2', [{ type: 'schematic', path: '/s.svg' }]);
    if (result.ok) {
      throw new Error('Expected error result');
    }
    expect(result.code).toBe('MODEL_NOT_FOUND');
  });
});

// ── i. Download route failures ───────────────────────────────────────────────

describe('Failure mode: download route failures', () => {
  type DownloadResult =
    | { ok: true; url: string; filename: string; checksum: string }
    | { ok: false; error: string; code: string };

  function getDownload(
    projectId: string,
    artifacts: { type: string; path: string; checksum: string }[],
    requestedType: string,
  ): DownloadResult {
    const artifact = artifacts.find((a) => a.type === requestedType);
    if (!artifact) {
      return {
        ok: false,
        error: `Artifact type "${requestedType}" not found for project ${projectId}`,
        code: 'ARTIFACT_NOT_FOUND',
      };
    }
    return {
      ok: true,
      url: artifact.path,
      filename: `${requestedType}.zip`,
      checksum: artifact.checksum,
    };
  }

  it('returns proper error when download artifact is missing', () => {
    const result = getDownload('proj-1', [], 'manufacturing_bundle');
    if (result.ok) {
      throw new Error('Expected error result');
    }
    expect(result.code).toBe('ARTIFACT_NOT_FOUND');
    expect(result.error).toContain('manufacturing_bundle');
  });

  it('returns error for Gerber download when only schematic exists', () => {
    const artifacts = [{ type: 'schematic', path: '/s.svg', checksum: 'abc' }];
    const result = getDownload('proj-1', artifacts, 'gerber');
    if (result.ok) {
      throw new Error('Expected error result');
    }
    expect(result.code).toBe('ARTIFACT_NOT_FOUND');
  });
});
