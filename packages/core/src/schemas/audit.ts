import { z } from 'zod';

export const AuditCategory = z.enum([
  'project',
  'spec',
  'architecture',
  'ingestion',
  'bom',
  'design',
  'quote',
  'export',
  'handoff',
]);

export const AuditEntrySchema = z.object({
  id: z.string().uuid(),
  projectId: z.string().uuid(),
  timestamp: z.date(),
  category: AuditCategory,
  action: z.string().min(1),
  details: z.record(z.unknown()),
  source: z.string().min(1),
  actor: z.string().min(1),
});

export type AuditEntry = z.infer<typeof AuditEntrySchema>;
export type AuditCategoryType = z.infer<typeof AuditCategory>;

export const AuditManifestSchema = z.object({
  id: z.string().uuid(),
  projectId: z.string().uuid(),
  entries: z.array(AuditEntrySchema),
  generatedAt: z.date(),
  version: z.number().int().positive(),
});

export type AuditManifest = z.infer<typeof AuditManifestSchema>;
