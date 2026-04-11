import { z } from 'zod';

export const ArchitectureTemplateSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(200),
  description: z.string().min(1),
  processorType: z.string().min(1),
  powerTopology: z.string().min(1),
  interfaceSet: z.array(z.string()).min(1),
  referenceTopology: z.record(z.unknown()),
  constraints: z.array(z.string()),
  requirements: z.array(z.string()),
  approved: z.boolean(),
});

export type ArchitectureTemplate = z.infer<typeof ArchitectureTemplateSchema>;
