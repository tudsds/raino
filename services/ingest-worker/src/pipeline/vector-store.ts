import * as fs from 'node:fs';
import * as path from 'node:path';
import type {
  EmbeddingRecord,
  ChunkRecord,
  ChunkMetadata,
  DocumentStore,
  ChunkStore,
  VectorStore,
} from '@raino/rag';
import { createStores, getEmbeddingGenerator } from '@raino/rag';

const DEFAULT_DATA_DIR = path.resolve(process.cwd(), 'data');

const stores = createStores({
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
  supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
});

const documentStore = stores.documents;
const chunkStore = stores.chunks;
const vectorStore = stores.vectors;

export async function storeEmbeddings(
  embeddings: EmbeddingRecord[],
  chunks: ChunkRecord[],
  dataDir: string = DEFAULT_DATA_DIR,
): Promise<void> {
  for (const chunk of chunks) {
    await documentStore.store({
      id: chunk.documentId,
      sourceUrl: chunk.metadata.sourceUrl,
      sourceType: chunk.metadata.documentType,
      manufacturer: chunk.metadata.manufacturer,
      partFamily: chunk.metadata.partFamily,
      mpn: chunk.metadata.mpn,
      revision: chunk.metadata.revision,
      fetchTimestamp: chunk.metadata.fetchTimestamp,
      trustLevel: chunk.metadata.trustLevel,
      metadata: chunk.metadata as unknown as Record<string, unknown>,
    });
  }

  for (const chunk of chunks) {
    await chunkStore.store(chunk);
  }

  for (const embedding of embeddings) {
    await vectorStore.storeEmbedding(embedding);
  }

  fs.mkdirSync(dataDir, { recursive: true });

  const chunksPath = path.join(dataDir, 'chunks.json');
  fs.writeFileSync(chunksPath, JSON.stringify(chunks, null, 2), 'utf-8');

  const embeddingsPath = path.join(dataDir, 'embeddings.json');
  const serializableEmbeddings = embeddings.map((e) => ({
    ...e,
    vector: `[${e.dimensions} floats]`,
  }));
  fs.writeFileSync(embeddingsPath, JSON.stringify(serializableEmbeddings, null, 2), 'utf-8');
}

export function getStores(): {
  documentStore: DocumentStore;
  chunkStore: ChunkStore;
  vectorStore: VectorStore;
} {
  return { documentStore, chunkStore, vectorStore };
}

export async function querySimilar(
  queryText: string,
  topK: number,
  filter?: Partial<ChunkMetadata>,
): Promise<Array<{ chunkId: string; score: number }>> {
  const generator = getEmbeddingGenerator();
  const vector = await generator.generate(queryText);
  return vectorStore.query(vector, topK, filter);
}
