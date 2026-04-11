// ── Mock Embedding Generator ──────────────────────────────────────────────────
// Deterministic pseudo-embedding generator for testing and fixture mode.
// Produces consistent vectors based on a hash of the input text.
// No external API calls — purely local computation.

import type { EmbeddingGenerator } from './contracts.js';

const MOCK_MODEL_NAME = 'mock-hash-384';
const MOCK_DIMENSIONS = 384;

/**
 * Compute a simple deterministic hash from a string.
 * Uses FNV-1a-inspired algorithm for good distribution.
 */
function fnvHash(text: string): number {
  let hash = 0x811c9dc5; // FNV offset basis
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193); // FNV prime
  }
  return hash >>> 0;
}

/**
 * Generate a deterministic pseudo-embedding from text.
 *
 * The algorithm seeds a simple PRNG from the text hash, then produces
 * `dimensions` values in [-1, 1]. The vector is then L2-normalized so
 * that cosine similarity equals the dot product.
 */
function textToVector(text: string, dimensions: number): number[] {
  // Seed from text hash
  let seed = fnvHash(text);

  // Simple xorshift PRNG
  const nextRandom = (): number => {
    seed ^= seed << 13;
    seed ^= seed >> 17;
    seed ^= seed << 5;
    seed = seed >>> 0;
    return (seed / 0xffffffff) * 2 - 1; // map to [-1, 1]
  };

  const vector: number[] = [];
  let normSq = 0;

  for (let i = 0; i < dimensions; i++) {
    const val = nextRandom();
    vector.push(val);
    normSq += val * val;
  }

  // L2-normalize
  const norm = Math.sqrt(normSq);
  if (norm > 0) {
    for (let i = 0; i < vector.length; i++) {
      vector[i] = vector[i]! / norm;
    }
  }

  return vector;
}

/**
 * Mock embedding generator for fixture mode and tests.
 *
 * - Deterministic: same text always produces the same vector.
 * - No external API calls.
 * - Vectors are L2-normalized, so cosine similarity = dot product.
 * - Similar texts will NOT necessarily produce similar vectors
 *   (this is intentional — mock mode is for structure, not quality).
 */
export class MockEmbeddingGenerator implements EmbeddingGenerator {
  readonly modelName = MOCK_MODEL_NAME;
  readonly dimensions = MOCK_DIMENSIONS;

  async generate(text: string): Promise<number[]> {
    return textToVector(text, this.dimensions);
  }

  async generateBatch(texts: string[]): Promise<number[][]> {
    return texts.map((text) => textToVector(text, this.dimensions));
  }
}
