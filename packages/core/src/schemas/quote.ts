import { z } from 'zod';

export const ConfidenceLevel = z.enum(['low', 'medium', 'high']);

export const RoughQuoteSchema = z.object({
  projectId: z.string().uuid(),
  bomId: z.string().uuid(),
  designAutomationFee: z.number().nonnegative(),
  engineeringReviewFee: z.number().nonnegative(),
  pcbFabricationEstimate: z.number().nonnegative(),
  componentsEstimate: z.number().nonnegative(),
  assemblyEstimate: z.number().nonnegative(),
  qaPackagingHandling: z.number().nonnegative(),
  contingency: z.number().nonnegative(),
  margin: z.number().nonnegative(),
  lowQuote: z.number().nonnegative(),
  midQuote: z.number().nonnegative(),
  highQuote: z.number().nonnegative(),
  confidenceLevel: ConfidenceLevel,
  assumptions: z.array(z.string()),
  includedScope: z.array(z.string()),
  nextRecommendedAction: z.string().min(1),
  isEstimate: z.boolean(),
});

export type RoughQuote = z.infer<typeof RoughQuoteSchema>;
export type ConfidenceLevelType = z.infer<typeof ConfidenceLevel>;
