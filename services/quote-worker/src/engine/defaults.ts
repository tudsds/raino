export const DEFAULT_QUOTE_CONFIG = {
  designAutomationFee: 500,
  engineeringReviewFee: 300,
  assemblyCostPerComponent: 0.05,
  pcbFabricationPerCm2: 0.1,
  qaPackagingBase: 100,
  qaPackagingPerUnit: 0.5,
  contingencyPercentage: 0.1,
  marginPercentage: 0.15,
  lowMultiplier: 0.8,
  highMultiplier: 1.25,
  currency: 'USD',
  defaultQuantity: 100,
} as const;

export type QuoteConfig = typeof DEFAULT_QUOTE_CONFIG;
