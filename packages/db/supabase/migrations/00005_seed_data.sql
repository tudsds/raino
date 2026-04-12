-- Seed data for local development
-- All inserts use ON CONFLICT DO NOTHING for idempotency

-- ─── Test User ────────────────────────────────────────────────────────────────

INSERT INTO public.users (id, supabase_user_id, email, full_name)
  VALUES (
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000001',
    'test@raino.dev',
    'Test User'
  )
  ON CONFLICT (id) DO NOTHING;

-- ─── Test Organization ────────────────────────────────────────────────────────

INSERT INTO public.organizations (id, name, slug, plan)
  VALUES (
    '00000000-0000-0000-0000-000000000010',
    'Test Org',
    'test-org',
    'free'
  )
  ON CONFLICT (id) DO NOTHING;

-- ─── Test Membership ──────────────────────────────────────────────────────────

INSERT INTO public.organization_members (id, user_id, organization_id, role)
  VALUES (
    '00000000-0000-0000-0000-000000000020',
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000010',
    'owner'
  )
  ON CONFLICT (id) DO NOTHING;

-- ─── Test Project ─────────────────────────────────────────────────────────────

INSERT INTO public.projects (id, name, description, organization_id, status)
  VALUES (
    '00000000-0000-0000-0000-000000000030',
    'Test Project',
    'A test project for local development',
    '00000000-0000-0000-0000-000000000010',
    'intake'
  )
  ON CONFLICT (id) DO NOTHING;
