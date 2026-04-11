import { describe, it, expect } from 'vitest';
import { validateBOMCompleteness, checkBOMForPlaceholders } from '../bom/engine.js';
import type { BOM } from '../schemas/bom.js';

// ── Helpers ──────────────────────────────────────────────────────────────────

const VALID_UUID = '550e8400-e29b-41d4-a716-446655440000';
const VALID_UUID_2 = '660e8400-e29b-41d4-a716-446655440001';

function makeProvenance() {
  return { source: 'DigiKey', timestamp: new Date(), confidence: 0.95 };
}

function makeBOMRow(overrides: Record<string, unknown> = {}): import('../schemas/bom').BOMRow {
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
  } as import('../schemas/bom').BOMRow;
}

function makeBOM(rows?: import('../schemas/bom').BOMRow[]): BOM {
  return {
    id: VALID_UUID,
    projectId: VALID_UUID_2,
    rows: rows ?? [makeBOMRow()],
    createdAt: new Date(),
    updatedAt: new Date(),
    version: 1,
  };
}

// ── validateBOMCompleteness ──────────────────────────────────────────────────

describe('validateBOMCompleteness', () => {
  it('returns complete for a fully populated BOM', () => {
    const bom = makeBOM([
      makeBOMRow({
        reference: 'U1',
        value: 'STM32F407VGT6',
        symbol: 'MCU',
        footprint: 'LQFP-100',
        manufacturer: 'STMicroelectronics',
        mpn: 'STM32F407VGT6',
        lifecycle: 'active',
        riskLevel: 'low',
        unitPrice: 12.5,
        stock: 1000,
        distributor: 'DigiKey',
        datasheetUrl: 'https://example.com/ds.pdf',
        alternates: ['STM32F407VGT7'],
      }),
    ]);

    const result = validateBOMCompleteness(bom);
    expect(result.complete).toBe(true);
    expect(result.missingFields).toHaveLength(0);
  });

  it('reports missing required fields', () => {
    const row = makeBOMRow();
    // Force a missing field by deleting it from the object
    const incompleteRow = { ...row, reference: '' };
    const bom = makeBOM([incompleteRow as import('../schemas/bom').BOMRow]);

    const result = validateBOMCompleteness(bom);
    expect(result.complete).toBe(false);
    expect(result.missingFields.length).toBeGreaterThan(0);
    expect(result.missingFields.some((f) => f.includes('reference'))).toBe(true);
  });

  it('reports warnings for missing optional fields', () => {
    const bom = makeBOM([
      makeBOMRow({
        unitPrice: undefined,
        stock: undefined,
        datasheetUrl: undefined,
        distributor: undefined,
        lifecycle: 'unknown',
        riskLevel: 'high',
        alternates: [],
      }),
    ]);

    const result = validateBOMCompleteness(bom);
    expect(result.complete).toBe(true); // required fields are present
    expect(result.warnings.length).toBeGreaterThan(0);
    expect(result.warnings.some((w) => w.includes('unitPrice'))).toBe(true);
    expect(result.warnings.some((w) => w.includes('stock'))).toBe(true);
    expect(result.warnings.some((w) => w.includes('datasheetUrl'))).toBe(true);
    expect(result.warnings.some((w) => w.includes('distributor'))).toBe(true);
    expect(result.warnings.some((w) => w.includes('lifecycle'))).toBe(true);
    expect(result.warnings.some((w) => w.includes('high risk'))).toBe(true);
  });

  it('reports warning when non-low-risk part has no alternates', () => {
    const bom = makeBOM([makeBOMRow({ riskLevel: 'medium', alternates: [] })]);

    const result = validateBOMCompleteness(bom);
    expect(result.warnings.some((w) => w.includes('no alternate'))).toBe(true);
  });

  it('does not warn about alternates for low-risk parts', () => {
    const bom = makeBOM([
      makeBOMRow({
        riskLevel: 'low',
        alternates: [],
        unitPrice: 1.0,
        stock: 100,
        distributor: 'DK',
        datasheetUrl: 'https://example.com',
      }),
    ]);

    const result = validateBOMCompleteness(bom);
    expect(result.warnings.some((w) => w.includes('no alternate'))).toBe(false);
  });
});

// ── checkBOMForPlaceholders ──────────────────────────────────────────────────

describe('checkBOMForPlaceholders', () => {
  it('returns no placeholders for clean BOM', () => {
    const bom = makeBOM([
      makeBOMRow({
        reference: 'U1',
        value: 'STM32F407VGT6',
        mpn: 'STM32F407VGT6',
        manufacturer: 'STMicroelectronics',
        footprint: 'LQFP-100',
      }),
    ]);

    const result = checkBOMForPlaceholders(bom);
    expect(result.hasPlaceholders).toBe(false);
    expect(result.placeholders).toHaveLength(0);
  });

  it('detects TBD placeholder', () => {
    const bom = makeBOM([makeBOMRow({ reference: 'U1', value: 'TBD' })]);

    const result = checkBOMForPlaceholders(bom);
    expect(result.hasPlaceholders).toBe(true);
    expect(result.placeholders.some((p) => p.includes('value="TBD"'))).toBe(true);
  });

  it('detects FIXME placeholder', () => {
    const bom = makeBOM([makeBOMRow({ reference: 'U2', manufacturer: 'FIXME' })]);

    const result = checkBOMForPlaceholders(bom);
    expect(result.hasPlaceholders).toBe(true);
    expect(result.placeholders.some((p) => p.includes('manufacturer="FIXME"'))).toBe(true);
  });

  it('detects TODO placeholder', () => {
    const bom = makeBOM([makeBOMRow({ reference: 'R1', mpn: 'TODO' })]);

    const result = checkBOMForPlaceholders(bom);
    expect(result.hasPlaceholders).toBe(true);
    expect(result.placeholders.some((p) => p.includes('mpn="TODO"'))).toBe(true);
  });

  it('detects PLACEHOLDER text', () => {
    const bom = makeBOM([makeBOMRow({ reference: 'C1', footprint: 'PLACEHOLDER' })]);

    const result = checkBOMForPlaceholders(bom);
    expect(result.hasPlaceholders).toBe(true);
  });

  it('detects XXX+ pattern', () => {
    const bom = makeBOM([makeBOMRow({ reference: 'U1', symbol: 'XXXX' })]);

    const result = checkBOMForPlaceholders(bom);
    expect(result.hasPlaceholders).toBe(true);
  });

  it('detects TEMP placeholder', () => {
    const bom = makeBOM([makeBOMRow({ reference: 'U1', value: 'TEMP' })]);

    const result = checkBOMForPlaceholders(bom);
    expect(result.hasPlaceholders).toBe(true);
  });

  it('detects UNKNOWN placeholder', () => {
    const bom = makeBOM([makeBOMRow({ reference: 'U1', manufacturer: 'UNKNOWN' })]);

    const result = checkBOMForPlaceholders(bom);
    expect(result.hasPlaceholders).toBe(true);
  });

  it('detects UNSPECIFIED placeholder', () => {
    const bom = makeBOM([makeBOMRow({ reference: 'U1', mpn: 'UNSPECIFIED' })]);

    const result = checkBOMForPlaceholders(bom);
    expect(result.hasPlaceholders).toBe(true);
  });

  it('is case-insensitive for placeholder detection', () => {
    const bom = makeBOM([makeBOMRow({ reference: 'U1', value: 'tbd' })]);

    const result = checkBOMForPlaceholders(bom);
    expect(result.hasPlaceholders).toBe(true);
  });

  it('reports multiple placeholders across rows', () => {
    const bom = makeBOM([
      makeBOMRow({ reference: 'U1', value: 'TBD' }),
      makeBOMRow({
        reference: 'U2',
        mpn: 'FIXME',
        value: 'IC',
        symbol: 'MCU',
        footprint: 'LQFP-100',
        manufacturer: 'ST',
      }),
    ]);

    const result = checkBOMForPlaceholders(bom);
    expect(result.hasPlaceholders).toBe(true);
    expect(result.placeholders.length).toBeGreaterThanOrEqual(2);
  });

  it('does not flag normal values as placeholders', () => {
    const bom = makeBOM([
      makeBOMRow({
        reference: 'U1',
        value: 'STM32F407VGT6',
        symbol: 'MCU_STM32',
        footprint: 'LQFP-100',
        manufacturer: 'STMicroelectronics',
        mpn: 'STM32F407VGT6',
      }),
    ]);

    const result = checkBOMForPlaceholders(bom);
    expect(result.hasPlaceholders).toBe(false);
  });
});
