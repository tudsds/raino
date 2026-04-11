import { DEFAULT_QUOTE_CONFIG, type QuoteConfig } from './defaults';

export interface BOMRow {
  reference: string;
  mpn: string;
  unitPrice: number | null;
  quantity: number;
  isEstimate: boolean;
}

export interface QuoteComponents {
  designAutomationFee: number;
  engineeringReviewFee: number;
  pcbFabricationEstimate: number;
  componentsEstimate: number;
  assemblyEstimate: number;
  qaPackagingHandling: number;
  contingency: number;
  margin: number;
}

export interface RoughQuote {
  projectId: string;
  components: QuoteComponents;
  lowQuote: number;
  midQuote: number;
  highQuote: number;
  confidenceLevel: 'low' | 'medium' | 'high';
  assumptions: string[];
  includedScope: string[];
  nextRecommendedAction: string;
  isEstimate: boolean;
  currency: string;
  generatedAt: number;
}

export interface QuoteOptions {
  quantity?: number;
  region?: string;
  includeAssembly?: boolean;
  confidenceMultiplier?: { low: number; high: number };
  config?: Partial<QuoteConfig>;
}

const ESTIMATED_PART_PRICES: Record<string, number> = {
  capacitor: 0.1,
  resistor: 0.05,
  inductor: 0.3,
  diode: 0.1,
  led: 0.15,
  transistor: 0.25,
  ic: 1.5,
  connector: 0.5,
  crystal: 0.4,
  ferrite: 0.2,
  mosfet: 0.35,
  regulator: 0.75,
  sensor: 2.0,
  mcu: 3.0,
  opamp: 0.6,
};

const DEFAULT_ESTIMATED_PRICE = 0.5;

function estimatePartPrice(mpn: string): number {
  const lowerMpn = mpn.toLowerCase();
  for (const [keyword, price] of Object.entries(ESTIMATED_PART_PRICES)) {
    if (lowerMpn.includes(keyword)) {
      return price;
    }
  }
  return DEFAULT_ESTIMATED_PRICE;
}

function estimateBoardArea(bomRows: BOMRow[]): number {
  const componentCount = bomRows.reduce((sum, row) => sum + row.quantity, 0);
  const uniqueParts = new Set(bomRows.map((r) => r.mpn)).size;
  return Math.max(10, componentCount * 0.5 + uniqueParts * 2);
}

function determineConfidence(bomRows: BOMRow[]): 'low' | 'medium' | 'high' {
  if (bomRows.length === 0) return 'low';

  const totalRows = bomRows.length;
  const rowsWithRealPrices = bomRows.filter((r) => r.unitPrice !== null && !r.isEstimate).length;
  const rowsWithEstimates = bomRows.filter((r) => r.unitPrice === null || r.isEstimate).length;

  const estimateRatio = rowsWithEstimates / totalRows;

  if (estimateRatio === 0 && rowsWithRealPrices === totalRows) return 'high';
  if (estimateRatio <= 0.3 && rowsWithRealPrices >= totalRows * 0.7) return 'medium';
  return 'low';
}

export function calculateRoughQuote(
  projectId: string,
  bomRows: BOMRow[],
  options?: QuoteOptions,
): RoughQuote {
  const config = { ...DEFAULT_QUOTE_CONFIG, ...options?.config };
  const quantity = options?.quantity ?? config.defaultQuantity;
  const includeAssembly = options?.includeAssembly ?? true;
  const confidenceMultiplier = options?.confidenceMultiplier ?? {
    low: config.lowMultiplier,
    high: config.highMultiplier,
  };

  const hasAnyEstimate = bomRows.some((r) => r.unitPrice === null || r.isEstimate);

  // Components estimate: sum of unitPrice * quantity per row
  let componentsEstimate = 0;
  const assumptions: string[] = [];

  for (const row of bomRows) {
    const price = row.unitPrice ?? estimatePartPrice(row.mpn);
    componentsEstimate += price * row.quantity;

    if (row.unitPrice === null) {
      assumptions.push(
        `Component ${row.reference} (${row.mpn}): price estimated at $${price.toFixed(4)} (no supplier data)`,
      );
    } else if (row.isEstimate) {
      assumptions.push(
        `Component ${row.reference} (${row.mpn}): price $${row.unitPrice.toFixed(4)} is from estimated data, not live quote`,
      );
    }
  }

  // PCB fabrication: heuristic based on board area estimate
  const boardAreaCm2 = estimateBoardArea(bomRows);
  const pcbFabricationEstimate = boardAreaCm2 * config.pcbFabricationPerCm2;
  assumptions.push(
    `PCB fabrication estimated at $${pcbFabricationEstimate.toFixed(2)} based on estimated board area of ${boardAreaCm2.toFixed(1)} cm²`,
  );

  // Assembly estimate
  const assemblyEstimate = includeAssembly
    ? bomRows.reduce((sum, row) => sum + row.quantity, 0) * config.assemblyCostPerComponent
    : 0;
  if (includeAssembly) {
    assumptions.push(`Assembly included at $${config.assemblyCostPerComponent} per component`);
  } else {
    assumptions.push('Assembly not included in this quote');
  }

  // Fixed fees
  const designAutomationFee = config.designAutomationFee;
  const engineeringReviewFee = config.engineeringReviewFee;

  // QA, packaging, handling
  const qaPackagingHandling = config.qaPackagingBase + config.qaPackagingPerUnit * quantity;

  // Subtotal
  const subtotal =
    designAutomationFee +
    engineeringReviewFee +
    pcbFabricationEstimate +
    componentsEstimate +
    assemblyEstimate +
    qaPackagingHandling;

  // Contingency and margin
  const contingency = subtotal * config.contingencyPercentage;
  const margin = (subtotal + contingency) * config.marginPercentage;

  // Final quotes
  const midQuote = subtotal + contingency + margin;
  const lowQuote = midQuote * confidenceMultiplier.low;
  const highQuote = midQuote * confidenceMultiplier.high;

  const confidenceLevel = determineConfidence(bomRows);

  // Required assumptions
  assumptions.unshift(`Quantity assumed: ${quantity} units`);
  assumptions.push(
    hasAnyEstimate
      ? 'Pricing source: fixture/estimated data — not live supplier quotes'
      : 'Pricing source: all prices from supplier data (may still be estimates)',
  );
  assumptions.push(`Contingency: ${(config.contingencyPercentage * 100).toFixed(0)}% of subtotal`);
  assumptions.push(
    `Margin: ${(config.marginPercentage * 100).toFixed(0)}% of (subtotal + contingency)`,
  );

  if (options?.region) {
    assumptions.push(`Region: ${options.region}`);
  }

  const includedScope = [
    'Design automation',
    'Engineering review',
    'PCB fabrication',
    'Component sourcing',
  ];
  if (includeAssembly) {
    includedScope.push('Assembly');
  }
  includedScope.push('QA, packaging & handling');

  const nextRecommendedAction =
    confidenceLevel === 'low'
      ? 'Resolve missing component pricing and re-run quote for higher confidence'
      : confidenceLevel === 'medium'
        ? 'Verify estimated component prices with live supplier quotes'
        : 'Review quote details and proceed to design phase';

  const components: QuoteComponents = {
    designAutomationFee,
    engineeringReviewFee,
    pcbFabricationEstimate,
    componentsEstimate,
    assemblyEstimate,
    qaPackagingHandling,
    contingency,
    margin,
  };

  return {
    projectId,
    components,
    lowQuote: Math.round(lowQuote * 100) / 100,
    midQuote: Math.round(midQuote * 100) / 100,
    highQuote: Math.round(highQuote * 100) / 100,
    confidenceLevel,
    assumptions,
    includedScope,
    nextRecommendedAction,
    isEstimate: hasAnyEstimate,
    currency: config.currency,
    generatedAt: Date.now(),
  };
}
