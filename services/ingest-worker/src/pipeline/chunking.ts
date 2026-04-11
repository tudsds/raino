import type { DocumentRecord, ChunkRecord } from '@raino/rag';
import { chunkDocument, type ChunkingOptions } from '@raino/rag';

const DEFAULT_CHUNKING_OPTIONS: ChunkingOptions = {
  maxChunkSize: 2000,
  overlapSize: 200,
  preferSemanticSections: true,
};

export function chunkDocuments(
  docs: DocumentRecord[],
  options: ChunkingOptions = DEFAULT_CHUNKING_OPTIONS,
): ChunkRecord[] {
  const allChunks: ChunkRecord[] = [];

  for (const doc of docs) {
    const normalizedDoc: DocumentRecord = {
      ...doc,
      normalizedText: doc.normalizedText ?? '',
    };

    const chunks = chunkDocument(normalizedDoc, options);
    allChunks.push(...chunks);
  }

  return allChunks;
}
