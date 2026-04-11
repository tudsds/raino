import { describe, it, expect } from 'vitest';
import { calculateRoughQuote } from '../quote/calculator.js';
import type { BOM } from '../schemas/bom.js';

// ── Helpers ──────────────────────────────────────────────────────────────────

const VALID_UUID = '550e8400-e29b-41d4-a716-446655440000';
const VALID_UUID_2 = '660e8400-e29b-41d4-a716-446655440001';

function makeProvenance() {
  return {
    source: 'DigiKey',
    timestamp: new Date(),
    confidence: 0.95,
  };
}

function makeBOMRow(
  overrides: Partial<{
    reference: string;
    value: string;
    symbol: string;
    footprint: string;
    manufacturer: string;
    mpn: string;
    unitPrice: number | undefined;
    stock: number | undefined;
    dnp: boolean;
    lifecycle: string;
    riskLevel: string;
    alternates: string[];
  }> = {},
): import('../schemas/bom').BOMRow {
  return {
    reference: overrides.reference ?? 'U1',
    value: overrides.value ?? 'STM32F407VGT6',
    symbol: overrides.symbol ?? 'MCU_ST_STM32F407',
    footprint: overrides.footprint ?? 'LQFP-100',
    manufacturer: overrides.manufacturer ?? 'STMicroelectronics',
    mpn: overrides.mpn ?? 'STM32F407VGT6',
    lifecycle: (overrides.lifecycle ?? 'active') as 'active',
    unitPrice: overrides.unitPrice,
    stock: overrides.stock,
    alternates: overrides.alternates ?? [],
    dnp: overrides.dnp ?? false,
    provenance: makeProvenance(),
    riskLevel: (overrides.riskLevel ?? 'low') as 'low',
  };
}

function makeBOM(rows?: import('../schemas/bom').BOMRow[]): BOM {
  return {
    id: VALID_UUID,
    projectId: VALID_UUID_2,
    rows: rows ?? [
      makeBOMRow({ reference: 'U1', mpn: 'STM32F407VGT6', unitPrice: 12.5 }),
      makeBOMRow({
        reference: 'U2',
        mpn: 'AMS1117-3.3',
        unitPrice: 0.5,
        footprint: 'SOT-223',
        value: 'AMS1117-3.3',
        manufacturer: 'AMS',
      }),
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
    version: 1,
  };
}

// ── Tests ────────────────────────────────────────────────────────────────────

describe('calculateRoughQuote', () => {
  it('calculates quote with known BOM prices', () => {
    const bom = makeBOM([
      makeBOMRow({ reference: 'U1', mpn: 'STM32F407VGT6', unitPrice: 12.5, footprint: 'LQFP-100' }),
      makeBOMRow({
        reference: 'U2',
        mpn: 'AMS1117-3.3',
        unitPrice: 0.5,
        footprint: 'SOT-223',
        value: 'AMS1117-3.3',
        manufacturer: 'AMS',
      }),
      makeBOMRow({
        reference: 'C1',
        mpn: '100nF-0402',
        unitPrice: 0.01,
        footprint: '0402',
        value: '100nF',
        manufacturer: 'Yageo',
      }),
    ]);

    const result = calculateRoughQuote(bom);

    expect(result.projectId).toBe(VALID_UUID_2);
    expect(result.componentsEstimate).toBeCloseTo(13.01, 2);
    expect(result.midQuote).toBeGreaterThan(0);
    expect(result.lowQuote).toBeLessThan(result.midQuote);
    expect(result.highQuote).toBeGreaterThan(result.midQuote);
    expect(result.assumptions.length).toBeGreaterThan(0);
    expect(result.isEstimate).toBe(true);
  });

  it('uses default isEstimate=true', () => {
    const bom = makeBOM([
      makeBOMRow({ reference: 'U1', mpn: 'STM32F407VGT6', unitPrice: 12.5, footprint: 'LQFP-100' }),
    ]);

    const result = calculateRoughQuote(bom);
    expect(result.isEstimate).toBe(true);
  });

  it('can override isEstimate to false', () => {
    const bom = makeBOM([
      makeBOMRow({ reference: 'U1', mpn: 'STM32F407VGT6', unitPrice: 12.5, footprint: 'LQFP-100' }),
    ]);

    const result = calculateRoughQuote(bom, { isEstimate: false });
    expect(result.isEstimate).toBe(false);
  });

  it('calculates confidence as high when all rows have prices', () => {
    const bom = makeBOM([
      makeBOMRow({ reference: 'U1', mpn: 'STM32F407VGT6', unitPrice: 12.5, footprint: 'LQFP-100' }),
      makeBOMRow({
        reference: 'R1',
        mpn: '10K-0402',
        unitPrice: 0.01,
        footprint: '0402',
        value: '10K',
        manufacturer: 'Yageo',
      }),
    ]);

    const result = calculateRoughQuote(bom);
    expect(result.confidenceLevel).toBe('high');
  });

  it('calculates confidence as low when rows lack prices', () => {
    const bom = makeBOM([
      makeBOMRow({ reference: 'U1', mpn: 'STM32F407VGT6', unitPrice: 12.5, footprint: 'LQFP-100' }),
      makeBOMRow({
        reference: 'U2',
        mpn: 'CUSTOM-ASIC',
        unitPrice: undefined,
        footprint: 'BGA-256',
        value: 'CUSTOM',
        manufacturer: 'Custom',
      }),
      makeBOMRow({
        reference: 'U3',
        mpn: 'CUSTOM-FPGA',
        unitPrice: undefined,
        footprint: 'BGA-484',
        value: 'FPGA',
        manufacturer: 'Custom',
      }),
    ]);

    const result = calculateRoughQuote(bom);
    // 1 out of 3 rows has price → 33% coverage → low (<50%)
    expect(result.confidenceLevel).toBe('low');
  });

  it('sets componentsEstimate to 0 for price-less rows', () => {
    const bom = makeBOM([
      makeBOMRow({
        reference: 'U1',
        mpn: 'CUSTOM-ASIC',
        unitPrice: undefined,
        footprint: 'BGA-256',
        value: 'CUSTOM',
        manufacturer: 'Custom',
      }),
    ]);

    const result = calculateRoughQuote(bom);
    expect(result.componentsEstimate).toBe(0);
  });

  it('skips DNP rows in components calculation', () => {
    const bomWithDNP = makeBOM([
      makeBOMRow({ reference: 'U1', mpn: 'STM32F407VGT6', unitPrice: 12.5, footprint: 'LQFP-100' }),
      makeBOMRow({
        reference: 'U2',
        mpn: 'SKIP-ME',
        unitPrice: 999,
        footprint: 'BGA',
        value: 'Skip',
        manufacturer: 'Skip',
        dnp: true,
      }),
    ]);

    const result = calculateRoughQuote(bomWithDNP);
    // Only U1 counted in components ($12.50), U2 is DNP
    expect(result.componentsEstimate).toBeCloseTo(12.5, 2);
  });

  it('applies custom contingency and margin percentages', () => {
    const bom = makeBOM([
      makeBOMRow({ reference: 'U1', mpn: 'STM32F407VGT6', unitPrice: 100, footprint: 'LQFP-100' }),
    ]);

    const result = calculateRoughQuote(bom, {
      contingencyPercent: 0.2,
      marginPercent: 0.3,
    });

    // Unique footprints = 1, pcb = 5, assembly = 0.5
    // components = 100
    // qa = (100 + 5 + 0.5) * 0.05 = 5.275
    // subtotal = 0 + 0 + 5 + 100 + 0.5 + 5.275 = 110.775
    // contingency = 110.775 * 0.2 = 22.155
    // margin = (110.775 + 22.155) * 0.3 = 39.879
    // mid = 110.775 + 22.155 + 39.879 = 172.809
    expect(result.contingency).toBeCloseTo(22.155, 2);
    expect(result.margin).toBeCloseTo(39.879, 2);
  });

  it('calculates pcbFabricationEstimate based on unique footprints', () => {
    const bom = makeBOM([
      makeBOMRow({ reference: 'U1', mpn: 'STM32F407VGT6', unitPrice: 10, footprint: 'LQFP-100' }),
      makeBOMRow({
        reference: 'U2',
        mpn: 'AMS1117-3.3',
        unitPrice: 1,
        footprint: 'SOT-223',
        value: 'AMS',
        manufacturer: 'AMS',
      }),
      makeBOMRow({
        reference: 'C1',
        mpn: '100nF',
        unitPrice: 0.01,
        footprint: 'LQFP-100',
        value: '100nF',
        manufacturer: 'Yageo',
      }),
    ]);

    const result = calculateRoughQuote(bom);
    // 2 unique footprints: LQFP-100, SOT-223 → 2 * 5 = 10
    expect(result.pcbFabricationEstimate).toBe(10);
  });

  it('uses default scope when none provided', () => {
    const bom = makeBOM([
      makeBOMRow({ reference: 'U1', mpn: 'STM32F407VGT6', unitPrice: 12.5, footprint: 'LQFP-100' }),
    ]);

    const result = calculateRoughQuote(bom);
    expect(result.includedScope).toContain('PCB fabrication');
    expect(result.includedScope).toContain('Component sourcing (estimated)');
  });

  it('uses custom scope when provided', () => {
    const bom = makeBOM([
      makeBOMRow({ reference: 'U1', mpn: 'STM32F407VGT6', unitPrice: 12.5, footprint: 'LQFP-100' }),
    ]);

    const result = calculateRoughQuote(bom, {
      includedScope: ['Custom scope A', 'Custom scope B'],
    });
    expect(result.includedScope).toEqual(['Custom scope A', 'Custom scope B']);
  });

  it('golden output: verifies exact calculation for known input', () => {
    const bom = makeBOM([
      makeBOMRow({ reference: 'U1', mpn: 'STM32F407VGT6', unitPrice: 12.5, footprint: 'LQFP-100' }),
      makeBOMRow({
        reference: 'U2',
        mpn: 'AMS1117-3.3',
        unitPrice: 0.5,
        footprint: 'SOT-223',
        value: 'AMS',
        manufacturer: 'AMS',
      }),
    ]);

    const result = calculateRoughQuote(bom, {
      designAutomationFee: 0,
      engineeringReviewFee: 0,
    });

    // Unique footprints: LQFP-100, SOT-223 → 2 * 5 = 10
    // Active rows: 2, assembly: 2 * 0.5 = 1
    // Components: 12.5 + 0.5 = 13
    // QA: (13 + 10 + 1) * 0.05 = 1.2
    // Subtotal: 0 + 0 + 10 + 13 + 1 + 1.2 = 25.2
    // Contingency (10%): 2.52
    // Margin (15% of 25.2 + 2.52 = 27.72): 4.158
    // Mid: 25.2 + 2.52 + 4.158 = 31.878
    // Low: 31.878 * 0.85 = 27.0963
    // High: 31.878 * 1.2 = 38.2536
    expect(result.componentsEstimate).toBeCloseTo(13, 2);
    expect(result.pcbFabricationEstimate).toBe(10);
    expect(result.assemblyEstimate).toBe(1);
    expect(result.qaPackagingHandling).toBeCloseTo(1.2, 2);
    expect(result.contingency).toBeCloseTo(2.52, 2);
    expect(result.margin).toBeCloseTo(4.158, 2);
    expect(result.midQuote).toBeCloseTo(31.878, 2);
    expect(result.lowQuote).toBeCloseTo(27.0963, 2);
    expect(result.highQuote).toBeCloseTo(38.2536, 2);
  });
});
