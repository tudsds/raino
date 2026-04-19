// ── OpenAI Embedding Generator ────────────────────────────────────────────────
// Production embedding generator using OpenAI's text-embedding-3-small model.
// Produces 1536-dimensional vectors suitable for pgvector similarity search.
// Falls back gracefully when credentials are missing.

import OpenAI from 'openai';
import type { EmbeddingGenerator } from './contracts';

const OPENAI_MODEL_NAME = 'text-embedding-3-small';
const OPENAI_DIMENSIONS = 1536;

/** Configuration for the OpenAI embedding generator. */
export interface OpenAIEmbeddingConfig {
  /** OpenAI API key. Required for live calls. */
  apiKey: string;
  /** Optional base URL override (e.g. for proxies or compatible APIs). */
  baseURL?: string;
  /** Model name. Defaults to "text-embedding-3-small". */
  model?: string;
  /** Output dimensions. Defaults to 1536. */
  dimensions?: number;
}

/**
 * OpenAI embedding generator using text-embedding-3-small.
 *
 * - Produces semantically meaningful 1536-dim vectors.
 * - Supports batch embedding for throughput.
 * - Configurable base URL for OpenAI-compatible endpoints.
 * - Throws clear errors when API key is missing or calls fail.
 */
export class OpenAIEmbeddingGenerator implements EmbeddingGenerator {
  readonly modelName: string;
  readonly dimensions: number;
  private readonly client: OpenAI;

  constructor(config: OpenAIEmbeddingConfig) {
    this.modelName = config.model ?? OPENAI_MODEL_NAME;
    this.dimensions = config.dimensions ?? OPENAI_DIMENSIONS;
    this.client = new OpenAI({
      apiKey: config.apiKey,
      baseURL: config.baseURL,
    });
  }

  async generate(text: string): Promise<number[]> {
    const response = await this.client.embeddings.create({
      model: this.modelName,
      input: text,
      dimensions: this.dimensions,
    });

    const embedding = response.data[0]?.embedding;
    if (!embedding) {
      throw new Error(`OpenAI embedding API returned no data for input (model: ${this.modelName})`);
    }
    return embedding;
  }

  async generateBatch(texts: string[]): Promise<number[][]> {
    if (texts.length === 0) {
      return [];
    }

    const response = await this.client.embeddings.create({
      model: this.modelName,
      input: texts,
      dimensions: this.dimensions,
    });

    // Response data is ordered by index; sort to guarantee order matches input.
    const sorted = response.data.sort((a, b) => a.index - b.index);

    return sorted.map((item) => {
      if (!item.embedding) {
        throw new Error(
          `OpenAI embedding API returned no embedding at index ${item.index} (model: ${this.modelName})`,
        );
      }
      return item.embedding;
    });
  }
}
