-- Storage buckets and access policies

-- ─── Buckets ──────────────────────────────────────────────────────────────────

INSERT INTO storage.buckets (id, name, public)
  VALUES ('reports', 'reports', false)
  ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
  VALUES ('artifacts', 'artifacts', false)
  ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
  VALUES ('uploads', 'uploads', true)
  ON CONFLICT (id) DO NOTHING;

-- ─── Reports bucket policies ──────────────────────────────────────────────────

CREATE POLICY "Authenticated users can upload reports"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'reports');

CREATE POLICY "Authenticated users can view reports"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'reports');

CREATE POLICY "Authenticated users can delete reports"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'reports');

-- ─── Artifacts bucket policies ────────────────────────────────────────────────

CREATE POLICY "Authenticated users can upload artifacts"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'artifacts');

CREATE POLICY "Authenticated users can view artifacts"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'artifacts');

CREATE POLICY "Authenticated users can delete artifacts"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'artifacts');

-- ─── Uploads bucket policies ──────────────────────────────────────────────────

CREATE POLICY "Anyone can view uploads"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'uploads');

CREATE POLICY "Authenticated users can upload uploads"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'uploads');

CREATE POLICY "Users can update own uploads"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'uploads');
