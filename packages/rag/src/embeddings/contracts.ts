// ── Embedding Generation Contracts ────────────────────────────────────────────
// Interface that every embedding backend must implement. Production adapters
// call external APIs (OpenAI, local models, etc.); mock implementations return
// deterministic pseudo-vectors for testing.

/** Contract for embedding generation. */
export interface EmbeddingGenerator {
  /** Generate an embedding vector for a single text string. */
  generate(text: string): Promise<number[]>;

  /** Generate embedding vectors for a batch of text strings. */
  generateBatch(texts: string[]): Promise<number[][]>;

  /** The model identifier (e.g. "text-embedding-3-small", "mock-hash-384"). */
  readonly modelName: string;

  /** Dimensionality of the output vectors. */
  readonly dimensions: number;
}
