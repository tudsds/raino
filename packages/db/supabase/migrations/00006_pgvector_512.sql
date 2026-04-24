-- pgvector 1536 → 512 dimensions (Voyage AI voyage-3-lite)

DROP INDEX IF EXISTS public.idx_embeddings_vector;

ALTER TABLE public.embeddings ALTER COLUMN vector TYPE extensions.vector(512);

CREATE INDEX IF NOT EXISTS idx_embeddings_vector
  ON public.embeddings
  USING hnsw (vector extensions.vector_cosine_ops)
  WITH (m = 32, ef_construction = 80);

DROP FUNCTION IF EXISTS public.match_documents(extensions.vector(512), double precision, integer, text);

CREATE OR REPLACE FUNCTION public.match_documents(
  query_embedding extensions.vector(512),
  match_threshold float DEFAULT 0.5,
  match_count int DEFAULT 10,
  project_id text DEFAULT NULL
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
  WHERE (project_id IS NULL OR c.document_id IN (
    SELECT d.id FROM public.documents d WHERE d.project_id = project_id
  ))
    AND 1 - (e.vector <=> query_embedding) > match_threshold
  ORDER BY e.vector <=> query_embedding
  LIMIT match_count;
$$;
