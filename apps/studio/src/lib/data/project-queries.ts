/**
 * Project queries using Supabase client directly.
 * Bypasses Prisma ORM to avoid the table name mapping issue.
 */
import { getSupabaseAdmin } from '@/lib/db/supabase-admin';
import type {
  DbProject,
  DbIntakeMessage,
  DbSpec,
  DbArchitecture,
  DbBOM,
  DbBOMRow,
  DbQuote,
  DbIngestionManifest,
  DbDesignArtifact,
  DbDesignJob,
  DbHandoffRequest,
  DbAuditEntry,
} from '@/lib/db/supabase-admin';

// ─── Full project type (with all relations) ───────────────────────────────────

export type FullProject = DbProject & {
  spec: DbSpec | null;
  architecture: DbArchitecture | null;
  bom: (DbBOM & { rows: DbBOMRow[] }) | null;
  quotes: DbQuote[];
  ingestion: DbIngestionManifest | null;
  artifacts: DbDesignArtifact[];
  jobs: DbDesignJob[];
  auditEntries: DbAuditEntry[];
  handoffs: DbHandoffRequest[];
  intakeMessages: DbIntakeMessage[];
};

async function fetchProjectRelations(project: DbProject): Promise<FullProject> {
  const db = getSupabaseAdmin();
  const id = project.id;

  const [
    specRes,
    archRes,
    bomRes,
    quotesRes,
    ingestionRes,
    artifactsRes,
    jobsRes,
    auditRes,
    handoffsRes,
    intakeRes,
  ] = await Promise.all([
    db.from('specs').select('*').eq('project_id', id).maybeSingle(),
    db.from('architectures').select('*').eq('project_id', id).maybeSingle(),
    db.from('boms').select('*').eq('project_id', id).maybeSingle(),
    db.from('quotes').select('*').eq('project_id', id).order('created_at', { ascending: false }),
    db.from('ingestion_manifests').select('*').eq('project_id', id).maybeSingle(),
    db.from('design_artifacts').select('*').eq('project_id', id).order('created_at', { ascending: false }),
    db.from('design_jobs').select('*').eq('project_id', id).order('created_at', { ascending: false }),
    db.from('audit_entries').select('*').eq('project_id', id).order('created_at', { ascending: false }),
    db.from('handoff_requests').select('*').eq('project_id', id).order('created_at', { ascending: false }),
    db.from('intake_messages').select('*').eq('project_id', id).order('created_at', { ascending: true }),
  ]);

  let bomWithRows: (DbBOM & { rows: DbBOMRow[] }) | null = null;
  if (bomRes.data) {
    const rowsRes = await db.from('bom_rows').select('*').eq('bom_id', bomRes.data.id);
    bomWithRows = { ...bomRes.data, rows: rowsRes.data ?? [] };
  }

  return {
    ...project,
    spec: specRes.data ?? null,
    architecture: archRes.data ?? null,
    bom: bomWithRows,
    quotes: quotesRes.data ?? [],
    ingestion: ingestionRes.data ?? null,
    artifacts: artifactsRes.data ?? [],
    jobs: jobsRes.data ?? [],
    auditEntries: auditRes.data ?? [],
    handoffs: handoffsRes.data ?? [],
    intakeMessages: intakeRes.data ?? [],
  };
}

export async function getProjects(organizationId: string) {
  const db = getSupabaseAdmin();
  const { data: projects, error } = await db
    .from('projects')
    .select('*')
    .eq('organization_id', organizationId)
    .order('updated_at', { ascending: false });

  if (error) throw new Error(`getProjects failed: ${error.message}`);
  if (!projects) return [];

  return Promise.all(projects.map(fetchProjectRelations));
}

export async function getProject(projectId: string, organizationId: string) {
  const db = getSupabaseAdmin();
  const { data: project, error } = await db
    .from('projects')
    .select('*')
    .eq('id', projectId)
    .eq('organization_id', organizationId)
    .maybeSingle();

  if (error) throw new Error(`getProject failed: ${error.message}`);
  if (!project) return null;

  return fetchProjectRelations(project);
}

export async function createProject(data: {
  name: string;
  description?: string;
  organizationId: string;
}) {
  const db = getSupabaseAdmin();
  const { data: project, error } = await db
    .from('projects')
    .insert({
      name: data.name,
      description: data.description ?? null,
      organization_id: data.organizationId,
      status: 'intake',
    })
    .select()
    .single();

  if (error) throw new Error(`createProject failed: ${error.message}`);
  return project as DbProject;
}

const STATUS_TO_STEP: Record<string, number> = {
  intake: 0,
  clarifying: 1,
  spec_compiled: 2,
  architecture_planned: 3,
  candidates_discovered: 4,
  ingested: 5,
  bom_generated: 6,
  design_pending: 7,
  design_generated: 8,
  validated: 9,
  exported: 10,
  quoted: 11,
  handed_off: 12,
};
const TOTAL_STEPS = 12;

export async function updateProjectStatus(projectId: string, status: string) {
  const db = getSupabaseAdmin();
  const step = STATUS_TO_STEP[status] ?? 0;
  const { data, error } = await db
    .from('projects')
    .update({
      status,
      current_step: step,
      total_steps: TOTAL_STEPS,
      updated_at: new Date().toISOString(),
    })
    .eq('id', projectId)
    .select()
    .single();

  if (error) throw new Error(`updateProjectStatus failed: ${error.message}`);
  return data as DbProject;
}

export async function getProjectForUser(projectId: string, userId: string) {
  const db = getSupabaseAdmin();

  // Find the user by supabase_user_id
  const { data: user, error: userError } = await db
    .from('users')
    .select('id')
    .eq('supabase_user_id', userId)
    .maybeSingle();

  if (userError || !user) return null;

  // Get org memberships
  const { data: memberships, error: memberError } = await db
    .from('organization_members')
    .select('organization_id')
    .eq('user_id', user.id);

  if (memberError || !memberships || memberships.length === 0) return null;

  const orgIds = memberships.map((m) => m.organization_id);

  // Find the project in one of the user's orgs
  const { data: project, error: projectError } = await db
    .from('projects')
    .select('*')
    .eq('id', projectId)
    .in('organization_id', orgIds)
    .maybeSingle();

  if (projectError || !project) return null;

  return fetchProjectRelations(project);
}

export async function getProjectsForUser(userId: string) {
  const db = getSupabaseAdmin();

  // Find the user by supabase_user_id
  const { data: user, error: userError } = await db
    .from('users')
    .select('id')
    .eq('supabase_user_id', userId)
    .maybeSingle();

  if (userError || !user) return [];

  // Get org memberships
  const { data: memberships, error: memberError } = await db
    .from('organization_members')
    .select('organization_id')
    .eq('user_id', user.id);

  if (memberError || !memberships || memberships.length === 0) return [];

  const orgIds = memberships.map((m) => m.organization_id);

  // Get all projects for those orgs
  const { data: projects, error: projectError } = await db
    .from('projects')
    .select('*')
    .in('organization_id', orgIds)
    .order('updated_at', { ascending: false });

  if (projectError || !projects) return [];

  return projects as DbProject[];
}

export async function verifyProjectOwnership(
  projectId: string,
  userId: string,
): Promise<
  | { authorized: true; project: FullProject }
  | { authorized: false }
> {
  const db = getSupabaseAdmin();

  // Find the user by supabase_user_id
  const { data: user, error: userError } = await db
    .from('users')
    .select('id')
    .eq('supabase_user_id', userId)
    .maybeSingle();

  if (userError || !user) return { authorized: false };

  // Get org memberships
  const { data: memberships, error: memberError } = await db
    .from('organization_members')
    .select('organization_id')
    .eq('user_id', user.id);

  if (memberError || !memberships || memberships.length === 0) return { authorized: false };

  const orgIds = memberships.map((m) => m.organization_id);

  // Find the project in one of the user's orgs
  const { data: project, error: projectError } = await db
    .from('projects')
    .select('*')
    .eq('id', projectId)
    .in('organization_id', orgIds)
    .maybeSingle();

  if (projectError || !project) return { authorized: false };

  const fullProject = await fetchProjectRelations(project);
  return { authorized: true, project: fullProject };
}

export async function getUserOrgId(userId: string): Promise<string | null> {
  const db = getSupabaseAdmin();

  // Find the user by supabase_user_id
  const { data: user, error: userError } = await db
    .from('users')
    .select('id')
    .eq('supabase_user_id', userId)
    .maybeSingle();

  if (userError || !user) return null;

  // Get the first org membership
  const { data: membership, error: memberError } = await db
    .from('organization_members')
    .select('organization_id')
    .eq('user_id', user.id)
    .limit(1)
    .maybeSingle();

  if (memberError || !membership) return null;

  return membership.organization_id;
}
