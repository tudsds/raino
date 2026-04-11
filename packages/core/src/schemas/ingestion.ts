import { z } from 'zod';

export const DocumentType = z.enum([
  'datasheet',
  'application_note',
  'reference_design',
  'errata',
  'user_guide',
  'schematic',
  'other',
]);

export const CandidateFamilySchema = z.object({
  family: z.string().min(1),
  manufacturer: z.string().min(1),
  mpns: z.array(z.string().min(1)).min(1),
  documentTypes: z.array(DocumentType),
});

export type CandidateFamily = z.infer<typeof CandidateFamilySchema>;
export type DocumentTypeType = z.infer<typeof DocumentType>;

export const IngestionStageStatus = z.enum(['pending', 'in_progress', 'completed', 'failed']);

export const IngestionStageSchema = z.object({
  name: z.string().min(1),
  status: IngestionStageStatus,
  startedAt: z.date().optional(),
  completedAt: z.date().optional(),
  error: z.string().optional(),
});

export type IngestionStage = z.infer<typeof IngestionStageSchema>;
export type IngestionStageStatusType = z.infer<typeof IngestionStageStatus>;

export const IngestionManifestStatus = z.enum([
  'queued',
  'running',
  'completed',
  'failed',
  'partial',
]);

export const IngestionManifestSchema = z.object({
  runId: z.string().uuid(),
  seedScope: z.string().min(1),
  families: z.array(CandidateFamilySchema).min(1),
  stages: z.array(IngestionStageSchema),
  timestamps: z.object({
    queuedAt: z.date(),
    startedAt: z.date().optional(),
    completedAt: z.date().optional(),
  }),
  status: IngestionManifestStatus,
});

export type IngestionManifest = z.infer<typeof IngestionManifestSchema>;
export type IngestionManifestStatusType = z.infer<typeof IngestionManifestStatus>;

export const SufficiencyCheckSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  passed: z.boolean(),
  details: z.string().optional(),
});

export type SufficiencyCheck = z.infer<typeof SufficiencyCheckSchema>;

export const SufficiencyReportSchema = z.object({
  projectId: z.string().uuid(),
  candidateId: z.string().min(1),
  checks: z.array(SufficiencyCheckSchema).min(1),
  overallPass: z.boolean(),
  gaps: z.array(z.string()),
});

export type SufficiencyReport = z.infer<typeof SufficiencyReportSchema>;
