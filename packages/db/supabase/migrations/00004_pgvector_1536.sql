-- pgvector 384 → 1536 dimensions (OpenAI text-embedding-3-small)

DROP INDEX IF EXISTS public.idx_embeddings_vector;

ALTER TABLE public.embeddings ALTER COLUMN vector TYPE extensions.vector(1536);

CREATE INDEX IF NOT EXISTS idx_embeddings_vector
  ON public.embeddings
  USING hnsw (vector extensions.vector_cosine_ops)
  WITH (m = 32, ef_construction = 80);

CREATE OR REPLACE FUNCTION public.match_documents(
  query_embedding extensions.vector(1536),
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