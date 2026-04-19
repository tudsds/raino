// ── Embedding Generator Factory ──────────────────────────────────────────────
// Selects the appropriate embedding backend based on environment configuration.
// OpenAI provider when credentials are present; mock as honest fallback.

import type { EmbeddingGenerator } from './contracts';
import { MockEmbeddingGenerator } from './mock-generator';
import { OpenAIEmbeddingGenerator } from './openai-generator';

export interface EmbeddingFactoryConfig {
  /** Provider to use: "openai" or "mock". Defaults to "mock". */
  provider?: string;
  /** OpenAI API key (required when provider is "openai"). */
  openaiApiKey?: string;
  /** Optional base URL for OpenAI-compatible API. */
  openaiBaseURL?: string;
  /** Optional model name override. */
  openaiModel?: string;
  /** Optional dimension override. */
  openaiDimensions?: number;
}

let cachedGenerator: EmbeddingGenerator | null = null;

/**
 * Create an EmbeddingGenerator based on configuration.
 *
 * - When provider="openai" and an API key is provided → OpenAIEmbeddingGenerator
 * - Otherwise → MockEmbeddingGenerator (deterministic, no API calls)
 */
export function createEmbeddingGenerator(config: EmbeddingFactoryConfig = {}): EmbeddingGenerator {
  if (config.provider === 'openai' && config.openaiApiKey && config.openaiApiKey.length > 0) {
    return new OpenAIEmbeddingGenerator({
      apiKey: config.openaiApiKey,
      baseURL: config.openaiBaseURL,
      model: config.openaiModel,
      dimensions: config.openaiDimensions,
    });
  }

  return new MockEmbeddingGenerator();
}

/**
 * Create or return a cached EmbeddingGenerator from environment variables.
 *
 * Reads EMBEDDING_PROVIDER, OPENAI_API_KEY, OPENAI_BASE_URL at call time
 * so it can be used in any context (server, worker, CLI).
 */
export function getEmbeddingGenerator(): EmbeddingGenerator {
  if (cachedGenerator) return cachedGenerator;

  cachedGenerator = createEmbeddingGenerator({
    provider: process.env.EMBEDDING_PROVIDER,
    openaiApiKey: process.env.OPENAI_API_KEY,
    openaiBaseURL: process.env.OPENAI_BASE_URL,
  });

  return cachedGenerator;
}

/** Reset cached generator (useful for tests). */
export function resetEmbeddingGenerator(): void {
  cachedGenerator = null;
}
