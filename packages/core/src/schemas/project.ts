import { z } from 'zod';

export const ProjectStatus = z.enum([
  'intake',
  'clarifying',
  'spec_compiled',
  'architecture_planned',
  'candidates_discovered',
  'ingested',
  'bom_generated',
  'design_generated',
  'validated',
  'exported',
  'quoted',
  'handed_off',
]);

export const ProjectSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(200),
  description: z.string().min(1),
  status: ProjectStatus,
  createdAt: z.date(),
  updatedAt: z.date(),
  userId: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
});

export type Project = z.infer<typeof ProjectSchema>;
export type ProjectStatusType = z.infer<typeof ProjectStatus>;
