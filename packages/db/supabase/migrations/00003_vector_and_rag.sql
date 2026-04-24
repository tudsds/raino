-- Vector, RAG, and embedding tables
-- These tables use pgvector which Prisma cannot fully model.
-- They are managed outside of Prisma via raw SQL migrations.

-- ─── Documents ────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.documents (
  id uuid PRIMARY KEY DEFAULT extensions.gen_random_uuid(),
  project_id text REFERENCES public.projects(id) ON DELETE CASCADE,
  title text NOT NULL,
  source_url text,
  source_type text DEFAULT 'unknown',
  trust_level text DEFAULT 'unverified',
  raw_content text,
  normalized_content text,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_documents_project_id ON public.documents(project_id);

-- ─── Chunks ───────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.chunks (
  id uuid PRIMARY KEY DEFAULT extensions.gen_random_uuid(),
  document_id uuid REFERENCES public.documents(id) ON DELETE CASCADE,
  content text NOT NULL,
  chunk_type text DEFAULT 'general',
  chunk_index int NOT NULL,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_chunks_document_id ON public.chunks(document_id);

-- ─── Embeddings ───────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.embeddings (
  id uuid PRIMARY KEY DEFAULT extensions.gen_random_uuid(),
  chunk_id uuid REFERENCES public.chunks(id) ON DELETE CASCADE,
  vector extensions.vector(384),
  model_name text,
  is_estimate boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_embeddings_chunk_id ON public.embeddings(chunk_id);

-- HNSW index for fast similarity search
CREATE INDEX IF NOT EXISTS idx_embeddings_vector
  ON public.embeddings
  USING hnsw (vector extensions.vector_cosine_ops)
  WITH (m = 32, ef_construction = 80);

-- ─── Match function for similarity search ─────────────────────────────────────

CREATE OR REPLACE FUNCTION public.match_documents(
  query_embedding extensions.vector(384),
  p_match_threshold float DEFAULT 0.5,
  p_match_count int DEFAULT 10,
  p_project_id uuid DEFAULT NULL
)
RETURNS TABLE (id uuid, document_id uuid, content text, similarity float)
LANGUAGE sql
STABLE
AS $$
  SELECT
    e.id,
    e.chunk_id AS document_id,
    c.content,
    1 - (e.vector <=> query_embedding) AS similarity
  FROM public.embeddings e
  JOIN public.chunks c ON c.id = e.chunk_id
  WHERE (p_project_id IS NULL OR c.document_id IN (
    SELECT d.id FROM public.documents d WHERE d.project_id = p_project_id
  ))
    AND 1 - (e.vector <=> query_embedding) > p_match_threshold
  ORDER BY e.vector <=> query_embedding
  LIMIT p_match_count;
$$;

-- ─── RLS on RAG tables ────────────────────────────────────────────────────────

ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view documents"
  ON public.documents FOR SELECT
  TO authenticated
  USING (
    project_id IS NULL
    OR EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id = documents.project_id
      AND public.is_org_member(p.organization_id)
    )
  );

CREATE POLICY "Members can insert documents"
  ON public.documents FOR INSERT
  TO authenticated
  WITH CHECK (
    project_id IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id = documents.project_id
      AND public.is_org_member(p.organization_id)
    )
  );

ALTER TABLE public.chunks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view chunks"
  ON public.chunks FOR SELECT
  TO authenticated
  USING (
    document_id IN (
      SELECT d.id FROM public.documents d
      WHERE d.project_id IS NULL
      OR EXISTS (
        SELECT 1 FROM public.projects p
        WHERE p.id = d.project_id
        AND public.is_org_member(p.organization_id)
      )
    )
  );

ALTER TABLE public.embeddings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view embeddings"
  ON public.embeddings FOR SELECT
  TO authenticated
  USING (
    chunk_id IN (
      SELECT c.id FROM public.chunks c
      JOIN public.documents d ON d.id = c.document_id
      WHERE d.project_id IS NULL
      OR EXISTS (
        SELECT 1 FROM public.projects p
        WHERE p.id = d.project_id
        AND public.is_org_member(p.organization_id)
      )
    )
  );
