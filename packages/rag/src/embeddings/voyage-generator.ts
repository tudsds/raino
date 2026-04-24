import type { EmbeddingGenerator } from './contracts';

const VOYAGE_MODEL_NAME = 'voyage-3-lite';
const VOYAGE_DIMENSIONS = 512;
const VOYAGE_DEFAULT_BASE_URL = 'https://api.voyageai.com/v1/embeddings';
const MAX_RETRIES = 3;
const RETRY_BASE_MS = 1000;

export interface VoyageEmbeddingConfig {
  apiKey: string;
  model?: string;
  dimensions?: number;
  baseURL?: string;
}

interface VoyageEmbeddingData {
  embedding: number[];
  index: number;
}

interface VoyageEmbeddingResponse {
  data: VoyageEmbeddingData[];
  usage: { total_tokens: number };
}

async function fetchWithRetry(
  url: string,
  options: RequestInit,
  retries: number = MAX_RETRIES,
): Promise<Response> {
  const response = await fetch(url, options);

  if (response.status === 429 && retries > 0) {
    const retryAfter = response.headers.get('retry-after');
    const delay = retryAfter ? parseInt(retryAfter, 10) * 1000 : RETRY_BASE_MS;
    await new Promise((resolve) => setTimeout(resolve, delay));
    return fetchWithRetry(url, options, retries - 1);
  }

  return response;
}

export class VoyageEmbeddingGenerator implements EmbeddingGenerator {
  readonly modelName: string;
  readonly dimensions: number;
  private readonly apiKey: string;
  private readonly endpoint: string;

  constructor(config: VoyageEmbeddingConfig) {
    this.modelName = config.model ?? VOYAGE_MODEL_NAME;
    this.dimensions = config.dimensions ?? VOYAGE_DIMENSIONS;
    this.apiKey = config.apiKey;
    this.endpoint = config.baseURL ?? VOYAGE_DEFAULT_BASE_URL;
  }

  async generate(text: string): Promise<number[]> {
    const results = await this.callApi([text]);
    const embedding = results[0]?.embedding;
    if (!embedding) {
      throw new Error(
        `Voyage embedding API returned no data for input (model: ${this.modelName})`,
      );
    }
    return embedding;
  }

  async generateBatch(texts: string[]): Promise<number[][]> {
    if (texts.length === 0) {
      return [];
    }

    const results = await this.callApi(texts);
    const sorted = results.sort((a, b) => a.index - b.index);

    return sorted.map((item) => {
      if (!item.embedding) {
        throw new Error(
          `Voyage embedding API returned no embedding at index ${item.index} (model: ${this.modelName})`,
        );
      }
      return item.embedding;
    });
  }

  private async callApi(input: string[]): Promise<VoyageEmbeddingData[]> {
    const body = {
      input,
      model: this.modelName,
      input_type: 'document',
      output_dimension: this.dimensions,
    };

    const response = await fetchWithRetry(this.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'unknown error');
      throw new Error(
        `Voyage embedding API error: ${response.status} ${response.statusText} — ${errorText}`,
      );
    }

    const json = (await response.json()) as VoyageEmbeddingResponse;

    if (!json.data || !Array.isArray(json.data)) {
      throw new Error(
        `Voyage embedding API returned unexpected response format (model: ${this.modelName})`,
      );
    }

    return json.data;
  }
}
