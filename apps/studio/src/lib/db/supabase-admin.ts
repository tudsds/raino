/**
 * Supabase admin client for server-side database operations.
 * Uses the service role key to bypass RLS and perform direct queries.
 * This replaces Prisma ORM to avoid the table name mapping issue.
 */
import { createClient } from '@supabase/supabase-js';

// ─── Type definitions matching the DB schema ──────────────────────────────────

export interface DbUser {
  id: string;
  supabase_user_id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface DbOrganization {
  id: string;
  name: string;
  slug: string;
  plan: string;
  created_at: string;
  updated_at: string;
}

export interface DbOrganizationMember {
  id: string;
  user_id: string;
  organization_id: string;
  role: string;
  created_at: string;
}

export interface DbProject {
  id: string;
  name: string;
  description: string | null;
  organization_id: string;
  status: string;
  current_step: number;
  total_steps: number;
  created_at: string;
  updated_at: string;
}

export interface DbIntakeMessage {
  id: string;
  project_id: string;
  role: string;
  content: string;
  attachments: unknown | null;
  created_at: string;
}

export interface DbSpec {
  id: string;
  project_id: string;
  requirements: unknown;
  constraints: unknown;
  interfaces: unknown;
  raw_text: string | null;
  compiled_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface DbArchitecture {
  id: string;
  project_id: string;
  template_id: string;
  template_name: string;
  mcu: string | null;
  power: string | null;
  interfaces: unknown;
  features: unknown;
  rationale: string | null;
  created_at: string;
  updated_at: string;
}

export interface DbBOM {
  id: string;
  project_id: string;
  total_cost: string;
  currency: string;
  line_count: number;
  is_estimate: boolean;
  created_at: string;
  updated_at: string;
}

export interface DbBOMRow {
  id: string;
  bom_id: string;
  ref: string;
  value: string;
  mpn: string;
  manufacturer: string;
  package: string;
  quantity: number;
  unit_price: string;
  currency: string;
  lifecycle: string;
  risk: string;
  description: string | null;
  alternates: unknown | null;
  provenance_source: string | null;
  provenance_url: string | null;
  is_estimate: boolean;
  created_at: string;
  updated_at: string;
}

export interface DbQuote {
  id: string;
  project_id: string;
  low_quote: string;
  mid_quote: string;
  high_quote: string;
  confidence: string;
  currency: string;
  assumptions: unknown;
  breakdown: unknown;
  is_estimate: boolean;
  quantity: number;
  created_at: string;
  updated_at: string;
}

export interface DbIngestionManifest {
  id: string;
  project_id: string;
  status: string;
  stages: unknown;
  candidate_families: unknown;
  sufficiency_report: unknown | null;
  created_at: string;
  updated_at: string;
}

export interface DbDesignArtifact {
  id: string;
  project_id: string;
  artifact_type: string;
  file_path: string;
  file_name: string;
  file_size: number;
  checksum: string;
  mime_type: string;
  storage_bucket: string;
  storage_key: string;
  metadata: unknown | null;
  created_at: string;
}

export interface DbDesignJob {
  id: string;
  project_id: string;
  job_type: string;
  status: string;
  progress: string;
  result: unknown | null;
  error: string | null;
  worker_id: string | null;
  created_at: string;
  started_at: string | null;
  completed_at: string | null;
}

export interface DbHandoffRequest {
  id: string;
  project_id: string;
  type: string;
  status: string;
  quantity: number;
  quote_id: string | null;
  metadata: unknown | null;
  created_at: string;
  updated_at: string;
}

export interface DbAuditEntry {
  id: string;
  project_id: string;
  category: string;
  action: string;
  actor: string | null;
  details: unknown | null;
  severity: string;
  source: string | null;
  created_at: string;
}

// ─── Supabase-shaped Database generic ─────────────────────────────────────────
// The shape matches what @supabase/supabase-js expects for `createClient<Database>`:
// public.Tables.<name>.{ Row, Insert, Update }. Insert/Update are permissive
// `Partial<Row>` for our direct-client usage — we rely on runtime validation
// plus explicit column names at call sites rather than per-field required
// markers. Views/Functions/Enums/CompositeTypes are declared so the type
// satisfies the Supabase `GenericSchema` contract.

type TableOf<TRow> = {
  Row: TRow;
  Insert: Partial<TRow>;
  Update: Partial<TRow>;
  Relationships: [];
};

export type Database = {
  public: {
    Tables: {
      users: TableOf<DbUser>;
      organizations: TableOf<DbOrganization>;
      organization_members: TableOf<DbOrganizationMember>;
      projects: TableOf<DbProject>;
      intake_messages: TableOf<DbIntakeMessage>;
      specs: TableOf<DbSpec>;
      architectures: TableOf<DbArchitecture>;
      boms: TableOf<DbBOM>;
      bom_rows: TableOf<DbBOMRow>;
      quotes: TableOf<DbQuote>;
      ingestion_manifests: TableOf<DbIngestionManifest>;
      design_artifacts: TableOf<DbDesignArtifact>;
      design_jobs: TableOf<DbDesignJob>;
      handoff_requests: TableOf<DbHandoffRequest>;
      audit_entries: TableOf<DbAuditEntry>;
    };
    Views: Record<string, never>;
    Functions: {
      ensure_user_and_org: {
        Args: {
          p_supabase_user_id: string;
          p_email: string;
          p_full_name: string | null;
        };
        Returns: { user_id: string; organization_id: string }[];
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

// ─── Client singleton ─────────────────────────────────────────────────────────

let _adminClient: ReturnType<typeof createClient<Database>> | null = null;

export function getSupabaseAdmin() {
  if (_adminClient) return _adminClient;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  }

  _adminClient = createClient<Database>(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  return _adminClient;
}
