-- Row-Level Security policies for all tenant-scoped tables
-- Access is granted based on organization membership lookup

-- ─── Helper: organization membership check ────────────────────────────────────
-- Returns true if the authenticated user is a member of the given organization.
CREATE OR REPLACE FUNCTION public.is_org_member(org_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.organization_members om
    JOIN public.users u ON u.id = om.user_id
    WHERE u.supabase_user_id = auth.uid()
      AND om.organization_id = org_id
  );
$$;

-- Returns true if the authenticated user is an owner or admin of the given organization.
CREATE OR REPLACE FUNCTION public.is_org_admin(org_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.organization_members om
    JOIN public.users u ON u.id = om.user_id
    WHERE u.supabase_user_id = auth.uid()
      AND om.organization_id = org_id
      AND om.role IN ('owner', 'admin')
  );
$$;

-- ─── Projects ─────────────────────────────────────────────────────────────────

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view projects"
  ON public.projects FOR SELECT
  TO authenticated
  USING (is_org_member(organization_id));

CREATE POLICY "Members can create projects"
  ON public.projects FOR INSERT
  TO authenticated
  WITH CHECK (is_org_member(organization_id));

CREATE POLICY "Members can update projects"
  ON public.projects FOR UPDATE
  TO authenticated
  USING (is_org_member(organization_id))
  WITH CHECK (is_org_member(organization_id));

CREATE POLICY "Only admins can delete projects"
  ON public.projects FOR DELETE
  TO authenticated
  USING (is_org_admin(organization_id));

-- ─── Specs ────────────────────────────────────────────────────────────────────

ALTER TABLE public.specs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view specs"
  ON public.specs FOR SELECT
  TO authenticated
  USING (is_org_member((SELECT organization_id FROM public.projects WHERE id = project_id)));

CREATE POLICY "Members can create specs"
  ON public.specs FOR INSERT
  TO authenticated
  WITH CHECK (is_org_member((SELECT organization_id FROM public.projects WHERE id = project_id)));

CREATE POLICY "Members can update specs"
  ON public.specs FOR UPDATE
  TO authenticated
  USING (is_org_member((SELECT organization_id FROM public.projects WHERE id = project_id)));

-- ─── Architectures ────────────────────────────────────────────────────────────

ALTER TABLE public.architectures ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view architectures"
  ON public.architectures FOR SELECT
  TO authenticated
  USING (is_org_member((SELECT organization_id FROM public.projects WHERE id = project_id)));

CREATE POLICY "Members can create architectures"
  ON public.architectures FOR INSERT
  TO authenticated
  WITH CHECK (is_org_member((SELECT organization_id FROM public.projects WHERE id = project_id)));

CREATE POLICY "Members can update architectures"
  ON public.architectures FOR UPDATE
  TO authenticated
  USING (is_org_member((SELECT organization_id FROM public.projects WHERE id = project_id)));

-- ─── BOMs ─────────────────────────────────────────────────────────────────────

ALTER TABLE public.boms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view BOMs"
  ON public.boms FOR SELECT
  TO authenticated
  USING (is_org_member((SELECT organization_id FROM public.projects WHERE id = project_id)));

CREATE POLICY "Members can create BOMs"
  ON public.boms FOR INSERT
  TO authenticated
  WITH CHECK (is_org_member((SELECT organization_id FROM public.projects WHERE id = project_id)));

CREATE POLICY "Members can update BOMs"
  ON public.boms FOR UPDATE
  TO authenticated
  USING (is_org_member((SELECT organization_id FROM public.projects WHERE id = project_id)));

-- ─── BOM Rows ─────────────────────────────────────────────────────────────────

ALTER TABLE public.bom_rows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view BOM rows"
  ON public.bom_rows FOR SELECT
  TO authenticated
  USING (is_org_member((
    SELECT p.organization_id
    FROM public.projects p
    JOIN public.boms b ON b.project_id = p.id
    WHERE b.id = bom_id
  )));

CREATE POLICY "Members can create BOM rows"
  ON public.bom_rows FOR INSERT
  TO authenticated
  WITH CHECK (is_org_member((
    SELECT p.organization_id
    FROM public.projects p
    JOIN public.boms b ON b.project_id = p.id
    WHERE b.id = bom_id
  )));

CREATE POLICY "Members can update BOM rows"
  ON public.bom_rows FOR UPDATE
  TO authenticated
  USING (is_org_member((
    SELECT p.organization_id
    FROM public.projects p
    JOIN public.boms b ON b.project_id = p.id
    WHERE b.id = bom_id
  )));

-- ─── Quotes ───────────────────────────────────────────────────────────────────

ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view quotes"
  ON public.quotes FOR SELECT
  TO authenticated
  USING (is_org_member((SELECT organization_id FROM public.projects WHERE id = project_id)));

CREATE POLICY "Members can create quotes"
  ON public.quotes FOR INSERT
  TO authenticated
  WITH CHECK (is_org_member((SELECT organization_id FROM public.projects WHERE id = project_id)));

CREATE POLICY "Members can update quotes"
  ON public.quotes FOR UPDATE
  TO authenticated
  USING (is_org_member((SELECT organization_id FROM public.projects WHERE id = project_id)));

-- ─── Ingestion Manifests ──────────────────────────────────────────────────────

ALTER TABLE public.ingestion_manifests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view ingestion manifests"
  ON public.ingestion_manifests FOR SELECT
  TO authenticated
  USING (is_org_member((SELECT organization_id FROM public.projects WHERE id = project_id)));

CREATE POLICY "Members can create ingestion manifests"
  ON public.ingestion_manifests FOR INSERT
  TO authenticated
  WITH CHECK (is_org_member((SELECT organization_id FROM public.projects WHERE id = project_id)));

CREATE POLICY "Members can update ingestion manifests"
  ON public.ingestion_manifests FOR UPDATE
  TO authenticated
  USING (is_org_member((SELECT organization_id FROM public.projects WHERE id = project_id)));

-- ─── Design Artifacts ─────────────────────────────────────────────────────────

ALTER TABLE public.design_artifacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view design artifacts"
  ON public.design_artifacts FOR SELECT
  TO authenticated
  USING (is_org_member((SELECT organization_id FROM public.projects WHERE id = project_id)));

CREATE POLICY "Members can create design artifacts"
  ON public.design_artifacts FOR INSERT
  TO authenticated
  WITH CHECK (is_org_member((SELECT organization_id FROM public.projects WHERE id = project_id)));

-- ─── Design Jobs ──────────────────────────────────────────────────────────────

ALTER TABLE public.design_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view design jobs"
  ON public.design_jobs FOR SELECT
  TO authenticated
  USING (is_org_member((SELECT organization_id FROM public.projects WHERE id = project_id)));

CREATE POLICY "Members can create design jobs"
  ON public.design_jobs FOR INSERT
  TO authenticated
  WITH CHECK (is_org_member((SELECT organization_id FROM public.projects WHERE id = project_id)));

CREATE POLICY "Members can update design jobs"
  ON public.design_jobs FOR UPDATE
  TO authenticated
  USING (is_org_member((SELECT organization_id FROM public.projects WHERE id = project_id)));

-- ─── Handoff Requests ─────────────────────────────────────────────────────────

ALTER TABLE public.handoff_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view handoff requests"
  ON public.handoff_requests FOR SELECT
  TO authenticated
  USING (is_org_member((SELECT organization_id FROM public.projects WHERE id = project_id)));

CREATE POLICY "Members can create handoff requests"
  ON public.handoff_requests FOR INSERT
  TO authenticated
  WITH CHECK (is_org_member((SELECT organization_id FROM public.projects WHERE id = project_id)));

CREATE POLICY "Members can update handoff requests"
  ON public.handoff_requests FOR UPDATE
  TO authenticated
  USING (is_org_member((SELECT organization_id FROM public.projects WHERE id = project_id)));

-- ─── Audit Entries ────────────────────────────────────────────────────────────

ALTER TABLE public.audit_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view audit entries"
  ON public.audit_entries FOR SELECT
  TO authenticated
  USING (is_org_member((SELECT organization_id FROM public.projects WHERE id = project_id)));

CREATE POLICY "System can create audit entries"
  ON public.audit_entries FOR INSERT
  TO authenticated
  WITH CHECK (is_org_member((SELECT organization_id FROM public.projects WHERE id = project_id)));

-- ─── Intake Messages ──────────────────────────────────────────────────────────

ALTER TABLE public.intake_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view intake messages"
  ON public.intake_messages FOR SELECT
  TO authenticated
  USING (is_org_member((SELECT organization_id FROM public.projects WHERE id = project_id)));

CREATE POLICY "Members can create intake messages"
  ON public.intake_messages FOR INSERT
  TO authenticated
  WITH CHECK (is_org_member((SELECT organization_id FROM public.projects WHERE id = project_id)));
