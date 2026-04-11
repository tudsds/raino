import { z } from 'zod';

export const Priority = z.enum(['must', 'should', 'nice_to_have']);

export const RequirementSchema = z.object({
  category: z.string().min(1),
  text: z.string().min(1),
  priority: Priority,
  resolved: z.boolean(),
});

export type Requirement = z.infer<typeof RequirementSchema>;
export type PriorityType = z.infer<typeof Priority>;

export const ConstraintsSchema = z.object({
  power: z.string().optional(),
  size: z.string().optional(),
  cost: z.string().optional(),
  environment: z.string().optional(),
  manufacturing: z.string().optional(),
});

export type Constraints = z.infer<typeof ConstraintsSchema>;

export const InterfaceSchema = z.object({
  type: z.string().min(1),
  protocol: z.string().min(1),
  speed: z.string().optional(),
  notes: z.string().optional(),
});

export type Interface = z.infer<typeof InterfaceSchema>;

export const ProductSpecSchema = z.object({
  requirements: z.array(RequirementSchema).min(1),
  constraints: ConstraintsSchema,
  interfaces: z.array(InterfaceSchema),
  targetVolume: z.number().positive().optional(),
  targetCost: z.number().positive().optional(),
  targetTimeline: z.string().optional(),
  region: z.string().optional(),
  certifications: z.array(z.string()).optional(),
});

export type ProductSpec = z.infer<typeof ProductSpecSchema>;
