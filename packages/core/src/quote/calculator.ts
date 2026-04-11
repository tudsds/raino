import type { BOM } from '../schemas/bom';
import { ConfidenceLevel, type RoughQuote } from '../schemas/quote';

export interface QuoteOptions {
  designAutomationFee?: number;
  engineeringReviewFee?: number;
  contingencyPercent?: number;
  marginPercent?: number;
  isEstimate?: boolean;
  assumptions?: string[];
  includedScope?: string[];
  nextRecommendedAction?: string;
}

const DEFAULT_OPTIONS: Required<QuoteOptions> = {
  designAutomationFee: 0,
  engineeringReviewFee: 0,
  contingencyPercent: 0.1,
  marginPercent: 0.15,
  isEstimate: true,
  assumptions: [],
  includedScope: [],
  nextRecommendedAction: 'Review quote and confirm component selection',
};

export function calculateRoughQuote(bom: BOM, options?: QuoteOptions): RoughQuote {
  const opts: Required<QuoteOptions> = { ...DEFAULT_OPTIONS, ...options };

  const componentsTotal = bom.rows.reduce((sum, row) => {
    if (row.dnp) return sum;
    const price = row.unitPrice ?? 0;
    return sum + price;
  }, 0);

  const uniqueFootprints = new Set(bom.rows.map((r) => r.footprint));
  const pcbFabricationEstimate = uniqueFootprints.size * 5;

  const activeRows = bom.rows.filter((r) => !r.dnp);
  const assemblyEstimate = activeRows.length * 0.5;

  const qaPackagingHandling = (componentsTotal + pcbFabricationEstimate + assemblyEstimate) * 0.05;

  const subtotal =
    opts.designAutomationFee +
    opts.engineeringReviewFee +
    pcbFabricationEstimate +
    componentsTotal +
    assemblyEstimate +
    qaPackagingHandling;

  const contingency = subtotal * opts.contingencyPercent;
  const margin = (subtotal + contingency) * opts.marginPercent;

  const midQuote = subtotal + contingency + margin;
  const lowQuote = midQuote * 0.85;
  const highQuote = midQuote * 1.2;

  const rowsWithPrice = bom.rows.filter((r) => !r.dnp && r.unitPrice !== undefined);
  const priceCoverage = activeRows.length > 0 ? rowsWithPrice.length / activeRows.length : 0;
  const confidenceLevel =
    priceCoverage >= 0.8
      ? ConfidenceLevel.Enum.high
      : priceCoverage >= 0.5
        ? ConfidenceLevel.Enum.medium
        : ConfidenceLevel.Enum.low;

  const assumptions = [
    ...opts.assumptions,
    opts.isEstimate ? 'All pricing is estimated from fixture data — not live supplier quotes.' : '',
    `Component price coverage: ${(priceCoverage * 100).toFixed(0)}%`,
  ].filter(Boolean);

  const includedScope =
    opts.includedScope.length > 0
      ? opts.includedScope
      : [
          'PCB fabrication',
          'Component sourcing (estimated)',
          'Assembly',
          'QA and packaging',
          'Engineering review',
        ];

  return {
    projectId: bom.projectId,
    bomId: bom.id,
    designAutomationFee: opts.designAutomationFee,
    engineeringReviewFee: opts.engineeringReviewFee,
    pcbFabricationEstimate,
    componentsEstimate: componentsTotal,
    assemblyEstimate,
    qaPackagingHandling,
    contingency,
    margin,
    lowQuote,
    midQuote,
    highQuote,
    confidenceLevel,
    assumptions,
    includedScope,
    nextRecommendedAction: opts.nextRecommendedAction,
    isEstimate: opts.isEstimate,
  };
}
