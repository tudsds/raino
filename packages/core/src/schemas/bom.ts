import { z } from 'zod';

export const ProvenanceSchema = z.object({
  source: z.string().min(1),
  timestamp: z.date(),
  confidence: z.number().min(0).max(1),
});

export type Provenance = z.infer<typeof ProvenanceSchema>;

export const RiskLevel = z.enum(['low', 'medium', 'high']);

export const LifecycleStatus = z.enum(['active', 'nrnd', 'eol', 'obsolete', 'unknown']);

export const BOMRowSchema = z.object({
  reference: z.string().min(1),
  value: z.string().min(1),
  symbol: z.string().min(1),
  footprint: z.string().min(1),
  manufacturer: z.string().min(1),
  mpn: z.string().min(1),
  distributor: z.string().optional(),
  distributorPn: z.string().optional(),
  internalPartId: z.string().optional(),
  lifecycle: LifecycleStatus,
  stock: z.number().int().nonnegative().optional(),
  unitPrice: z.number().nonnegative().optional(),
  moq: z.number().int().positive().optional(),
  alternates: z.array(z.string()),
  dnp: z.boolean(),
  package: z.string().optional(),
  datasheetUrl: z.string().url().optional(),
  provenance: ProvenanceSchema,
  notes: z.string().optional(),
  riskLevel: RiskLevel,
});

export type BOMRow = z.infer<typeof BOMRowSchema>;
export type RiskLevelType = z.infer<typeof RiskLevel>;
export type LifecycleStatusType = z.infer<typeof LifecycleStatus>;

export const BOMSchema = z.object({
  id: z.string().uuid(),
  projectId: z.string().uuid(),
  rows: z.array(BOMRowSchema).min(1),
  createdAt: z.date(),
  updatedAt: z.date(),
  version: z.number().int().positive(),
});

export type BOM = z.infer<typeof BOMSchema>;
