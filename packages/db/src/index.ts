export { prisma, default as prismaDefault } from './client';
export { createSupabaseServerClient } from './supabase/server';
export { createSupabaseBrowserClient } from './supabase/browser';
export { updateSession } from './supabase/middleware';

export type {
  User,
  Organization,
  OrganizationMember,
  Project,
  Spec,
  Architecture,
  BOM,
  BOMRow,
  Quote,
  IngestionManifest,
  DesignArtifact,
  DesignJob,
  HandoffRequest,
  AuditEntry,
  IntakeMessage,
  Prisma,
} from './generated/prisma';
