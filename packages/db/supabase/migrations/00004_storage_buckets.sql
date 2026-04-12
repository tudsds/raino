-- Storage buckets and access policies

-- ─── Buckets ──────────────────────────────────────────────────────────────────

INSERT INTO storage.buckets (id, name, public)
  VALUES ('designs', 'designs', false)
  ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
  VALUES ('documents', 'documents', false)
  ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
  VALUES ('avatars', 'avatars', true)
  ON CONFLICT (id) DO NOTHING;

-- ─── Designs bucket policies ──────────────────────────────────────────────────

CREATE POLICY "Authenticated users can upload designs"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'designs');

CREATE POLICY "Authenticated users can view designs"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'designs');

CREATE POLICY "Authenticated users can delete designs"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'designs');

-- ─── Documents bucket policies ────────────────────────────────────────────────

CREATE POLICY "Authenticated users can upload documents"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'documents');

CREATE POLICY "Authenticated users can view documents"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'documents');

CREATE POLICY "Authenticated users can delete documents"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'documents');

-- ─── Avatars bucket policies ──────────────────────────────────────────────────

CREATE POLICY "Anyone can view avatars"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'avatars');

CREATE POLICY "Authenticated users can upload avatars"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'avatars');

CREATE POLICY "Users can update own avatars"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'avatars');
