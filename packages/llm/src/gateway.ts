/**
 * LLMGateway — retry, rate-limit handling, structured output, streaming.
 */

import { ZodSchema } from 'zod';
import type { LLMMessage, LLMRequestOptions, LLMResponse, LLMStreamEvent } from './types';
import type { LLMProvider } from './provider';

export interface GatewayOptions {
  maxRetries?: number; // default 3
  retryDelay?: number; // default 1000ms
  retryBackoff?: number; // default 2 (exponential multiplier)
  abortSignal?: AbortSignal;
}

/** HTTP-status errors that are retryable. */
function isRetryable(error: unknown): boolean {
  if (error instanceof Error) {
    // OpenAI SDK wraps HTTP errors; look for status codes.
    const httpStatus = extractStatus(error);
    if (httpStatus !== null) {
      return httpStatus === 429 || (httpStatus >= 500 && httpStatus <= 599);
    }
    // Network-level errors (timeouts, connection reset) — retry.
    if (
      error.message.includes('ECONNRESET') ||
      error.message.includes('ETIMEDOUT') ||
      error.message.includes('fetch failed') ||
      error.message.includes('timed out') ||
      error.message.includes('Timed out')
    ) {
      return true;
    }
  }
  return false;
}

function extractStatus(error: Error): number | null {
  // openai SDK puts status on the error object directly
  const withStatus = error as Error & { status?: number };
  if (typeof withStatus.status === 'number') {
    return withStatus.status;
  }
  return null;
}

/** Parse Retry-After header value (seconds) from error headers. */
function getRetryAfterMs(error: unknown): number | null {
  if (error instanceof Error) {
    const withHeaders = error as Error & { headers?: { get?: (name: string) => string | null } };
    const raw = withHeaders.headers?.get?.('retry-after') ?? null;
    if (raw !== null) {
      const parsed = Number(raw);
      if (!Number.isNaN(parsed) && parsed > 0) {
        return parsed * 1000;
      }
    }
  }
  return null;
}

export class LLMGateway {
  private provider: LLMProvider;
  private maxRetries: number;
  private retryDelay: number;
  private retryBackoff: number;
  private abortSignal: AbortSignal | undefined;

  constructor(provider: LLMProvider, options?: GatewayOptions) {
    this.provider = provider;
    this.maxRetries = options?.maxRetries ?? 3;
    this.retryDelay = options?.retryDelay ?? 1000;
    this.retryBackoff = options?.retryBackoff ?? 2;
    this.abortSignal = options?.abortSignal;
  }

  async chat(messages: LLMMessage[], options?: LLMRequestOptions): Promise<LLMResponse> {
    return this.withRetry(() =>
      this.provider.chat(messages, {
        ...options,
        signal: options?.signal ?? this.abortSignal,
      }),
    );
  }

  async *chatStream(
    messages: LLMMessage[],
    options?: LLMRequestOptions,
  ): AsyncGenerator<LLMStreamEvent> {
    // Streaming doesn't get retry — just delegate.
    yield* this.provider.chatStream(messages, {
      ...options,
      signal: options?.signal ?? this.abortSignal,
    });
  }

  async chatStructured<T>(
    messages: LLMMessage[],
    schema: ZodSchema<T>,
    options?: LLMRequestOptions,
  ): Promise<T> {
    const response = await this.chat(messages, {
      ...options,
      jsonMode: true,
    });

    let parsed: unknown;
    try {
      parsed = JSON.parse(response.content);
    } catch {
      throw new Error(
        `LLMGateway: failed to parse JSON response: ${response.content.slice(0, 200)}`,
      );
    }

    const result = schema.safeParse(parsed);
    if (!result.success) {
      throw new Error(`LLMGateway: response does not match schema: ${result.error.message}`);
    }

    return result.data;
  }

  async isAvailable(): Promise<boolean> {
    return this.provider.isAvailable();
  }

  // ---- private ----

  private async withRetry<T>(fn: () => Promise<T>): Promise<T> {
    let lastError: unknown;

    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      if (this.abortSignal?.aborted) {
        throw new DOMException('Aborted', 'AbortError');
      }

      try {
        return await fn();
      } catch (error: unknown) {
        lastError = error;

        // If aborted, propagate immediately.
        if (error instanceof DOMException && error.name === 'AbortError') {
          throw error;
        }
        // If the error is an AbortError from fetch, propagate.
        if (error instanceof Error && error.name === 'AbortError') {
          throw error;
        }

        // Don't retry if we've exhausted attempts.
        if (attempt >= this.maxRetries) {
          break;
        }

        // Don't retry non-retryable errors (400, 401, etc.).
        if (!isRetryable(error)) {
          throw error;
        }

        // Wait before retrying.
        const retryAfterMs = getRetryAfterMs(error);
        const delay = retryAfterMs ?? this.retryDelay * Math.pow(this.retryBackoff, attempt);
        await this.sleep(delay);
      }
    }

    throw lastError;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(resolve, ms);
      if (this.abortSignal) {
        const onAbort = () => {
          clearTimeout(timer);
          reject(new DOMException('Aborted', 'AbortError'));
        };
        if (this.abortSignal.aborted) {
          clearTimeout(timer);
          reject(new DOMException('Aborted', 'AbortError'));
        } else {
          this.abortSignal.addEventListener('abort', onAbort, { once: true });
        }
      }
    });
  }
}
