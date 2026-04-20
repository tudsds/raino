-- Auto-provision public.users, organizations, organization_members whenever
-- a new row is inserted into auth.users. Idempotent so it's safe to re-run
-- against existing auth users (e.g. after a failed /auth/callback or when
-- a session was issued server-side without the callback firing).
--
-- This is the canonical place to guarantee a fresh sign-up is workflow-ready;
-- the /auth/callback application code is now a belt-and-braces second path.

CREATE OR REPLACE FUNCTION public.ensure_user_and_org(
  p_supabase_user_id text,
  p_email text,
  p_full_name text DEFAULT NULL
) RETURNS TABLE(user_id text, organization_id text) AS $$
DECLARE
  v_user_id text;
  v_org_id text;
  v_full_name text;
BEGIN
  v_full_name := COALESCE(NULLIF(p_full_name, ''), split_part(p_email, '@', 1), 'New User');

  SELECT id INTO v_user_id FROM public.users WHERE email = p_email;

  IF v_user_id IS NULL THEN
    INSERT INTO public.users (supabase_user_id, email, full_name)
    VALUES (p_supabase_user_id, p_email, v_full_name)
    RETURNING id INTO v_user_id;
  ELSE
    UPDATE public.users
    SET supabase_user_id = p_supabase_user_id,
        full_name = COALESCE(full_name, v_full_name),
        updated_at = now()
    WHERE id = v_user_id
      AND (supabase_user_id IS DISTINCT FROM p_supabase_user_id OR full_name IS NULL);
  END IF;

  SELECT om.organization_id INTO v_org_id
  FROM public.organization_members om
  WHERE om.user_id = v_user_id
  LIMIT 1;

  IF v_org_id IS NULL THEN
    INSERT INTO public.organizations (name, slug)
    VALUES (
      v_full_name || '''s Organization',
      'org-' || substr(v_user_id, 1, 8) || '-' || to_hex(floor(extract(epoch from now()))::bigint)
    )
    RETURNING id INTO v_org_id;

    INSERT INTO public.organization_members (user_id, organization_id, role)
    VALUES (v_user_id, v_org_id, 'owner');
  END IF;

  RETURN QUERY SELECT v_user_id, v_org_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS trigger AS $$
BEGIN
  PERFORM public.ensure_user_and_org(
    NEW.id::text,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name')
  );
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'handle_new_auth_user failed for %: %', NEW.email, SQLERRM;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();

-- One-time back-fill for auth users that signed up before this migration.
DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN
    SELECT au.id, au.email, au.raw_user_meta_data
    FROM auth.users au
    LEFT JOIN public.users pu ON pu.email = au.email
    LEFT JOIN public.organization_members om ON om.user_id = pu.id
    WHERE au.email IS NOT NULL
      AND (pu.id IS NULL OR om.user_id IS NULL)
  LOOP
    PERFORM public.ensure_user_and_org(
      r.id::text,
      r.email,
      COALESCE(r.raw_user_meta_data->>'full_name', r.raw_user_meta_data->>'name')
    );
  END LOOP;
END $$;
