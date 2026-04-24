import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAuth } from '@/lib/auth/require-auth';
import { getEmbeddingGenerator, createStores, RetrievalEngine } from '@raino/rag';

const SOURCE_TYPES = [
  'datasheet', 'errata', 'app_note', 'ref_design', 'package_doc',
  'programming_manual', 'selection_guide', 'internal_note',
] as const;

const retrieveRequestSchema = z.object({
  query: z.string().min(1),
  topK: z.number().int().positive().optional().default(10),
  minScore: z.number().min(0).max(1).optional().default(0.3),
  filter: z
    .object({
      manufacturer: z.string().optional(),
      mpn: z.string().optional(),
      documentType: z.enum(SOURCE_TYPES).optional(),
    })
    .optional(),
});

export async function POST(request: NextRequest) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;

  try {
    const body = await request.json();
    const parsed = retrieveRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const { query, topK, minScore, filter } = parsed.data;

    const stores = createStores();
    const embeddingGenerator = getEmbeddingGenerator();

    const engine = new RetrievalEngine({
      embeddingGenerator,
      chunkStore: stores.chunks,
      vectorStore: stores.vectors,
    });

    const results = await engine.retrieve(query, {
      topK,
      minScore,
      filter: filter as Partial<import('@raino/rag').ChunkMetadata> | undefined,
    });

    return NextResponse.json({
      results: results.map((r) => ({
        chunkId: r.chunk.id,
        content: r.chunk.content,
        score: r.score,
        provenance: {
          documentId: r.provenance.documentId,
          sourceUrl: r.provenance.sourceUrl,
          documentType: r.provenance.documentType,
          manufacturer: r.provenance.manufacturer,
          mpn: r.provenance.mpn ?? null,
          trustLevel: r.provenance.trustLevel,
        },
      })),
      query,
      totalResults: results.length,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'RAG retrieval failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
