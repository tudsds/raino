import type { ChunkRecord, EmbeddingRecord } from '@raino/rag';
import { MockEmbeddingGenerator } from '@raino/rag';

let embeddingCounter = 0;

function makeEmbeddingId(chunkId: string): string {
  embeddingCounter++;
  return `emb_${chunkId}_${embeddingCounter}`;
}

export async function generateEmbeddings(chunks: ChunkRecord[]): Promise<EmbeddingRecord[]> {
  const generator = new MockEmbeddingGenerator();
  const texts = chunks.map((c) => c.content);
  const vectors = await generator.generateBatch(texts);
  const now = Date.now();

  return chunks.map((chunk, index) => ({
    id: makeEmbeddingId(chunk.id),
    chunkId: chunk.id,
    model: generator.modelName,
    dimensions: generator.dimensions,
    vector: vectors[index]!,
    generatedAt: now,
  }));
}
