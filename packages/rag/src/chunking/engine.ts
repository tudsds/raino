// ── Chunking Engine ───────────────────────────────────────────────────────────
// Engineering-aware document chunking. Splits documents along semantic section
// boundaries detected by the section-detector, then applies size/overlap
// controls to produce ChunkRecord arrays ready for embedding.

import type { DocumentRecord, ChunkRecord, ChunkMetadata } from '../storage/types.js';
import { detectSections, type SectionBoundary } from './section-detector.js';

/** Options controlling chunk size and semantic behavior. */
export interface ChunkingOptions {
  /** Maximum characters per chunk. Defaults to 2000. */
  maxChunkSize?: number;
  /** Number of characters to overlap between sub-chunks. Defaults to 200. */
  overlapSize?: number;
  /** Whether to prefer splitting at detected section headers. Defaults to true. */
  preferSemanticSections?: boolean;
}

const DEFAULT_MAX_CHUNK_SIZE = 2000;
const DEFAULT_OVERLAP_SIZE = 200;
const DEFAULT_PREFER_SEMANTIC = true;

/**
 * Split a single section into sub-chunks if it exceeds maxChunkSize.
 * Overlaps by overlapSize characters between consecutive sub-chunks
 * to preserve cross-boundary context.
 */
function splitOversizedSection(text: string, maxChunkSize: number, overlapSize: number): string[] {
  if (text.length <= maxChunkSize) {
    return [text];
  }

  const chunks: string[] = [];
  let start = 0;

  while (start < text.length) {
    let end = start + maxChunkSize;

    // Try to break at a sentence or line boundary near the limit
    if (end < text.length) {
      const searchRegion = text.slice(end - Math.min(100, maxChunkSize), end + 100);
      const newlineIdx = searchRegion.lastIndexOf('\n');
      if (newlineIdx !== -1 && newlineIdx > 0) {
        end = end - 100 + newlineIdx + 1;
      }
    }

    end = Math.min(end, text.length);
    const chunkText = text.slice(start, end).trim();
    if (chunkText.length > 0) {
      chunks.push(chunkText);
    }

    // Advance with overlap
    start = end - overlapSize;
    if (start >= text.length) break;
    // Prevent infinite loop if overlap >= chunkSize
    if (chunks.length > 0 && start <= 0) break;
  }

  return chunks;
}

/**
 * Generate a deterministic chunk ID from the document ID, chunk type,
 * and content index.
 */
function makeChunkId(documentId: string, chunkType: string, index: number): string {
  const raw = `${documentId}:${chunkType}:${index}`;
  // Simple hash for deterministic ID
  let hash = 0;
  for (let i = 0; i < raw.length; i++) {
    const char = raw.charCodeAt(i);
    hash = ((hash << 5) - hash + char) | 0;
  }
  return `chunk_${Math.abs(hash).toString(36)}_${index}`;
}

/**
 * Build ChunkMetadata from a DocumentRecord, inheriting all relevant fields.
 */
function buildMetadata(doc: DocumentRecord): ChunkMetadata {
  return {
    manufacturer: doc.manufacturer,
    partFamily: doc.partFamily,
    mpn: doc.mpn,
    documentType: doc.sourceType,
    revision: doc.revision,
    sourceUrl: doc.sourceUrl,
    fetchTimestamp: doc.fetchTimestamp,
    trustLevel: doc.trustLevel,
  };
}

/**
 * Chunk an engineering document into semantic sections.
 *
 * When preferSemanticSections is true (default), the engine first detects
 * known engineering section boundaries (e.g. "Absolute Maximum Ratings",
 * "Pin Description"), then splits oversized sections to fit maxChunkSize.
 *
 * @param doc - The document to chunk (must have normalizedText).
 * @param options - Chunking configuration.
 * @returns Array of ChunkRecord objects with inherited metadata.
 */
export function chunkDocument(doc: DocumentRecord, options?: ChunkingOptions): ChunkRecord[] {
  const maxChunkSize = options?.maxChunkSize ?? DEFAULT_MAX_CHUNK_SIZE;
  const overlapSize = options?.overlapSize ?? DEFAULT_OVERLAP_SIZE;
  const preferSemantic = options?.preferSemanticSections ?? DEFAULT_PREFER_SEMANTIC;

  const text = doc.normalizedText ?? '';
  if (text.length === 0) {
    return [];
  }

  const baseMetadata = buildMetadata(doc);

  if (!preferSemantic) {
    // Simple fixed-window chunking with overlap
    const subChunks = splitOversizedSection(text, maxChunkSize, overlapSize);
    return subChunks.map((content, index) => ({
      id: makeChunkId(doc.id, 'general', index),
      documentId: doc.id,
      content,
      chunkType: 'general' as const,
      metadata: baseMetadata,
    }));
  }

  // Semantic section-aware chunking
  const sections: SectionBoundary[] = detectSections(text);
  const chunks: ChunkRecord[] = [];
  let globalIndex = 0;

  for (const section of sections) {
    const sectionText = text.slice(section.start, section.end).trim();
    if (sectionText.length === 0) continue;

    const subChunks = splitOversizedSection(sectionText, maxChunkSize, overlapSize);

    for (const content of subChunks) {
      chunks.push({
        id: makeChunkId(doc.id, section.type, globalIndex),
        documentId: doc.id,
        content,
        chunkType: section.type,
        metadata: {
          ...baseMetadata,
        },
      });
      globalIndex++;
    }
  }

  return chunks;
}
