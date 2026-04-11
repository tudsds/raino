import { describe, it, expect } from 'vitest';
import { calculateRoughQuote, type BOMRow } from '../engine/calculator.js';
import { DEFAULT_QUOTE_CONFIG } from '../engine/defaults.js';

function makeBOMRow(overrides: Partial<BOMRow> = {}): BOMRow {
  return {
    reference: overrides.reference ?? 'U1',
    mpn: overrides.mpn ?? 'STM32F407VGT6',
    unitPrice: overrides.unitPrice !== undefined ? overrides.unitPrice : 12.5,
    quantity: overrides.quantity ?? 1,
    isEstimate: overrides.isEstimate ?? false,
  };
}

describe('calculateRoughQuote', () => {
  it('calculates quote with 5 known BOM rows', () => {
    const bomRows: BOMRow[] = [
      makeBOMRow({
        reference: 'U1',
        mpn: 'STM32F407VGT6',
        unitPrice: 12.5,
        quantity: 1,
        isEstimate: false,
      }),
      makeBOMRow({
        reference: 'U2',
        mpn: 'AMS1117-3.3',
        unitPrice: 0.5,
        quantity: 1,
        isEstimate: false,
      }),
      makeBOMRow({
        reference: 'C1',
        mpn: '100nF-capacitor',
        unitPrice: 0.01,
        quantity: 10,
        isEstimate: false,
      }),
      makeBOMRow({
        reference: 'R1',
        mpn: '10K-resistor',
        unitPrice: 0.01,
        quantity: 4,
        isEstimate: false,
      }),
      makeBOMRow({
        reference: 'Y1',
        mpn: '8MHz-crystal',
        unitPrice: 0.5,
        quantity: 1,
        isEstimate: false,
      }),
    ];

    const result = calculateRoughQuote('project-1', bomRows);

    expect(result.projectId).toBe('project-1');
    expect(result.isEstimate).toBe(false);
    expect(result.confidenceLevel).toBe('high');
    expect(result.midQuote).toBeGreaterThan(0);
    expect(result.lowQuote).toBeLessThan(result.midQuote);
    expect(result.highQuote).toBeGreaterThan(result.midQuote);
    expect(result.assumptions.length).toBeGreaterThan(0);
    expect(result.includedScope.length).toBeGreaterThan(0);
  });

  it('calculates exact golden output for known inputs', () => {
    const bomRows: BOMRow[] = [
      makeBOMRow({
        reference: 'U1',
        mpn: 'STM32F407VGT6',
        unitPrice: 10,
        quantity: 1,
        isEstimate: false,
      }),
      makeBOMRow({
        reference: 'C1',
        mpn: 'capacitor',
        unitPrice: 0.1,
        quantity: 5,
        isEstimate: false,
      }),
    ];

    const result = calculateRoughQuote('golden-project', bomRows, {
      quantity: 100,
    });

    const config = DEFAULT_QUOTE_CONFIG;
    const quantity = 100;

    // Components: 10*1 + 0.1*5 = 10.5
    const components = 10.5;
    expect(result.components.componentsEstimate).toBeCloseTo(components, 4);

    // Board area: max(10, (1+5)*0.5 + 2*2) = max(10, 7) = 10
    const boardArea = 10;
    const pcb = boardArea * config.pcbFabricationPerCm2;
    expect(result.components.pcbFabricationEstimate).toBeCloseTo(pcb, 4);

    // Assembly: (1+5) * 0.05 = 0.3
    const assembly = 6 * config.assemblyCostPerComponent;
    expect(result.components.assemblyEstimate).toBeCloseTo(assembly, 4);

    // Design + Engineering fees
    expect(result.components.designAutomationFee).toBe(config.designAutomationFee);
    expect(result.components.engineeringReviewFee).toBe(config.engineeringReviewFee);

    // QA: 100 + 0.5*100 = 150
    const qa = config.qaPackagingBase + config.qaPackagingPerUnit * quantity;
    expect(result.components.qaPackagingHandling).toBeCloseTo(qa, 4);

    // Subtotal: 500 + 300 + 1 + 10.5 + 0.3 + 150 = 961.8
    const subtotal = 500 + 300 + pcb + components + assembly + qa;
    expect(subtotal).toBeCloseTo(961.8, 4);

    // Contingency (10%): 96.18
    const contingency = subtotal * config.contingencyPercentage;
    expect(result.components.contingency).toBeCloseTo(contingency, 2);

    // Margin (15%): (961.8 + 96.18) * 0.15 = 158.697
    const margin = (subtotal + contingency) * config.marginPercentage;
    expect(result.components.margin).toBeCloseTo(margin, 2);

    // Mid: 961.8 + 96.18 + 158.697 = 1216.677
    const mid = subtotal + contingency + margin;
    expect(result.midQuote).toBeCloseTo(Math.round(mid * 100) / 100, 2);

    // Low: mid * 0.8
    expect(result.lowQuote).toBeCloseTo(Math.round(mid * 0.8 * 100) / 100, 2);

    // High: mid * 1.25
    expect(result.highQuote).toBeCloseTo(Math.round(mid * 1.25 * 100) / 100, 2);
  });

  it('applies contingency percentage correctly', () => {
    const bomRows: BOMRow[] = [
      makeBOMRow({ reference: 'U1', mpn: 'TEST', unitPrice: 100, quantity: 1, isEstimate: false }),
    ];

    const result = calculateRoughQuote('test-contingency', bomRows, {
      config: { contingencyPercentage: 0.1 },
    });

    const expectedSubtotal =
      DEFAULT_QUOTE_CONFIG.designAutomationFee +
      DEFAULT_QUOTE_CONFIG.engineeringReviewFee +
      result.components.pcbFabricationEstimate +
      result.components.componentsEstimate +
      result.components.assemblyEstimate +
      result.components.qaPackagingHandling;

    expect(result.components.contingency).toBeCloseTo(expectedSubtotal * 0.1, 2);
  });

  it('applies margin percentage correctly', () => {
    const bomRows: BOMRow[] = [
      makeBOMRow({ reference: 'U1', mpn: 'TEST', unitPrice: 100, quantity: 1, isEstimate: false }),
    ];

    const result = calculateRoughQuote('test-margin', bomRows, {
      config: { marginPercentage: 0.15 },
    });

    const subtotalPlusContingency =
      result.components.designAutomationFee +
      result.components.engineeringReviewFee +
      result.components.pcbFabricationEstimate +
      result.components.componentsEstimate +
      result.components.assemblyEstimate +
      result.components.qaPackagingHandling +
      result.components.contingency;

    expect(result.components.margin).toBeCloseTo(subtotalPlusContingency * 0.15, 2);
  });

  it('sets confidence to high when all prices are real', () => {
    const bomRows: BOMRow[] = [
      makeBOMRow({ reference: 'U1', mpn: 'TEST', unitPrice: 10, quantity: 1, isEstimate: false }),
      makeBOMRow({ reference: 'U2', mpn: 'TEST2', unitPrice: 5, quantity: 1, isEstimate: false }),
    ];

    const result = calculateRoughQuote('conf-high', bomRows);
    expect(result.confidenceLevel).toBe('high');
  });

  it('sets confidence to low when most prices are estimated', () => {
    const bomRows: BOMRow[] = [
      makeBOMRow({ reference: 'U1', mpn: 'TEST', unitPrice: 10, quantity: 1, isEstimate: true }),
      makeBOMRow({ reference: 'U2', mpn: 'TEST2', unitPrice: null, quantity: 1, isEstimate: true }),
      makeBOMRow({ reference: 'U3', mpn: 'TEST3', unitPrice: null, quantity: 1, isEstimate: true }),
    ];

    const result = calculateRoughQuote('conf-low', bomRows);
    expect(result.confidenceLevel).toBe('low');
    expect(result.isEstimate).toBe(true);
  });

  it('sets confidence to medium with mixed real/estimated prices', () => {
    const bomRows: BOMRow[] = [
      makeBOMRow({ reference: 'U1', mpn: 'TEST', unitPrice: 10, quantity: 1, isEstimate: false }),
      makeBOMRow({ reference: 'U2', mpn: 'TEST2', unitPrice: 5, quantity: 1, isEstimate: false }),
      makeBOMRow({ reference: 'U3', mpn: 'TEST3', unitPrice: 5, quantity: 1, isEstimate: false }),
      makeBOMRow({ reference: 'U4', mpn: 'TEST4', unitPrice: null, quantity: 1, isEstimate: true }),
    ];

    const result = calculateRoughQuote('conf-mixed', bomRows);
    // 3 real + 1 estimated = 25% estimated → medium
    expect(result.confidenceLevel).toBe('medium');
  });

  it('estimates prices for null unitPrice using MPN keywords', () => {
    const bomRows: BOMRow[] = [
      makeBOMRow({
        reference: 'C1',
        mpn: '100nF-capacitor',
        unitPrice: null,
        quantity: 10,
        isEstimate: true,
      }),
    ];

    const result = calculateRoughQuote('est-price', bomRows);
    // capacitor keyword → estimated price 0.1
    expect(result.components.componentsEstimate).toBeCloseTo(0.1 * 10, 4);
    expect(result.assumptions.some((a) => a.includes('estimated at'))).toBe(true);
  });

  it('excludes assembly when includeAssembly=false', () => {
    const bomRows: BOMRow[] = [
      makeBOMRow({ reference: 'U1', mpn: 'TEST', unitPrice: 10, quantity: 1, isEstimate: false }),
    ];

    const result = calculateRoughQuote('no-assembly', bomRows, { includeAssembly: false });
    expect(result.components.assemblyEstimate).toBe(0);
    expect(result.includedScope).not.toContain('Assembly');
    expect(result.assumptions.some((a) => a.includes('Assembly not included'))).toBe(true);
  });

  it('includes assembly by default', () => {
    const bomRows: BOMRow[] = [
      makeBOMRow({ reference: 'U1', mpn: 'TEST', unitPrice: 10, quantity: 1, isEstimate: false }),
    ];

    const result = calculateRoughQuote('with-assembly', bomRows);
    expect(result.components.assemblyEstimate).toBeGreaterThan(0);
    expect(result.includedScope).toContain('Assembly');
  });

  it('records quantity assumption', () => {
    const bomRows: BOMRow[] = [
      makeBOMRow({ reference: 'U1', mpn: 'TEST', unitPrice: 10, quantity: 1, isEstimate: false }),
    ];

    const result = calculateRoughQuote('qty-test', bomRows, { quantity: 250 });
    expect(result.assumptions[0]).toContain('250');
  });

  it('records region in assumptions when provided', () => {
    const bomRows: BOMRow[] = [
      makeBOMRow({ reference: 'U1', mpn: 'TEST', unitPrice: 10, quantity: 1, isEstimate: false }),
    ];

    const result = calculateRoughQuote('region-test', bomRows, { region: 'EU' });
    expect(result.assumptions.some((a) => a.includes('EU'))).toBe(true);
  });

  it('generates nextRecommendedAction based on confidence', () => {
    const highConf = calculateRoughQuote('action-high', [
      makeBOMRow({ reference: 'U1', mpn: 'TEST', unitPrice: 10, isEstimate: false }),
    ]);
    expect(highConf.nextRecommendedAction).toContain('proceed');

    const lowConf = calculateRoughQuote('action-low', [
      makeBOMRow({ reference: 'U1', mpn: 'TEST', unitPrice: null, isEstimate: true }),
      makeBOMRow({ reference: 'U2', mpn: 'TEST2', unitPrice: null, isEstimate: true }),
    ]);
    expect(lowConf.nextRecommendedAction).toContain('missing');
  });

  it('sets currency from config', () => {
    const bomRows: BOMRow[] = [
      makeBOMRow({ reference: 'U1', mpn: 'TEST', unitPrice: 10, isEstimate: false }),
    ];

    const result = calculateRoughQuote('currency-test', bomRows);
    expect(result.currency).toBe(DEFAULT_QUOTE_CONFIG.currency);
  });

  it('sets generatedAt to current timestamp', () => {
    const before = Date.now();
    const result = calculateRoughQuote('ts-test', [
      makeBOMRow({ reference: 'U1', mpn: 'TEST', unitPrice: 10, isEstimate: false }),
    ]);
    const after = Date.now();

    expect(result.generatedAt).toBeGreaterThanOrEqual(before);
    expect(result.generatedAt).toBeLessThanOrEqual(after);
  });

  it('handles empty BOM', () => {
    const result = calculateRoughQuote('empty-bom', []);
    expect(result.components.componentsEstimate).toBe(0);
    expect(result.confidenceLevel).toBe('low');
    expect(result.midQuote).toBeGreaterThan(0);
  });
});

describe('DEFAULT_QUOTE_CONFIG', () => {
  it('has expected default values', () => {
    expect(DEFAULT_QUOTE_CONFIG.designAutomationFee).toBe(500);
    expect(DEFAULT_QUOTE_CONFIG.engineeringReviewFee).toBe(300);
    expect(DEFAULT_QUOTE_CONFIG.assemblyCostPerComponent).toBe(0.05);
    expect(DEFAULT_QUOTE_CONFIG.pcbFabricationPerCm2).toBe(0.1);
    expect(DEFAULT_QUOTE_CONFIG.qaPackagingBase).toBe(100);
    expect(DEFAULT_QUOTE_CONFIG.qaPackagingPerUnit).toBe(0.5);
    expect(DEFAULT_QUOTE_CONFIG.contingencyPercentage).toBe(0.1);
    expect(DEFAULT_QUOTE_CONFIG.marginPercentage).toBe(0.15);
    expect(DEFAULT_QUOTE_CONFIG.lowMultiplier).toBe(0.8);
    expect(DEFAULT_QUOTE_CONFIG.highMultiplier).toBe(1.25);
    expect(DEFAULT_QUOTE_CONFIG.currency).toBe('USD');
    expect(DEFAULT_QUOTE_CONFIG.defaultQuantity).toBe(100);
  });
});
