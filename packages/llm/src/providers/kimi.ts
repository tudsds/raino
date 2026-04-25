/**
 * KimiProvider — OpenAI-compatible client for Kimi K2.5.
 *
 * Fixed params (never overridden):
 *   temperature=1.0, top_p=0.95, n=1,
 *   presence_penalty=0.0, frequency_penalty=0.0
 */

import OpenAI from 'openai';
import type { ChatCompletionChunk, ChatCompletion } from 'openai/resources/chat/completions';
import type { LLMMessage, LLMRequestOptions, LLMResponse, LLMStreamEvent } from '../types';
import type { LLMProvider } from '../provider';

const KIMI_DEFAULT_BASE_URL = 'https://api.moonshot.ai/v1';
const KIMI_DEFAULT_MODEL = 'kimi-k2.5';

/** Convert our LLMMessage[] to the shape the OpenAI SDK expects. */
function toOpenAIMessages(messages: LLMMessage[]): OpenAI.ChatCompletionMessageParam[] {
  return messages.map((msg): OpenAI.ChatCompletionMessageParam => {
    if (typeof msg.content === 'string') {
      if (msg.role === 'system') return { role: 'system' as const, content: msg.content };
      if (msg.role === 'assistant') return { role: 'assistant' as const, content: msg.content };
      return { role: 'user' as const, content: msg.content };
    }
    if (msg.role === 'system') return { role: 'system' as const, content: '' };
    if (msg.role === 'assistant') return { role: 'assistant' as const, content: '' };
    return {
      role: 'user' as const,
      content: msg.content.map((part) => {
        if (part.type === 'image_url' && part.image_url) {
          return { type: 'image_url' as const, image_url: { url: part.image_url.url } };
        }
        return { type: 'text' as const, text: part.text ?? '' };
      }),
    };
  });
}

export class KimiProvider implements LLMProvider {
  readonly name = 'kimi';
  readonly defaultModel = KIMI_DEFAULT_MODEL;

  private client: OpenAI;

  constructor() {
    this.client = new OpenAI({
      apiKey: process.env.KIMI_API_KEY ?? '',
      baseURL: process.env.KIMI_API_BASE_URL ?? KIMI_DEFAULT_BASE_URL,
      timeout: 120_000,
      maxRetries: 1,
    });
  }

  async chat(messages: LLMMessage[], options?: LLMRequestOptions): Promise<LLMResponse> {
    const completion: ChatCompletion = await this.client.chat.completions.create(
      {
        model: options?.model ?? this.defaultModel,
        messages: toOpenAIMessages(messages),
        max_tokens: options?.maxTokens ?? 32768,
        temperature: 1.0,
        top_p: 0.95,
        n: 1,
        presence_penalty: 0.0,
        frequency_penalty: 0.0,
        ...(options?.jsonMode ? { response_format: { type: 'json_object' } } : {}),
      },
      { signal: options?.signal ?? undefined },
    );

    const choice = completion.choices[0];
    if (!choice) {
      throw new Error('KimiProvider: no choices returned');
    }

    return {
      id: completion.id,
      content: choice.message.content ?? '',
      model: completion.model,
      usage: {
        promptTokens: completion.usage?.prompt_tokens ?? 0,
        completionTokens: completion.usage?.completion_tokens ?? 0,
        totalTokens: completion.usage?.total_tokens ?? 0,
      },
      finishReason: choice.finish_reason ?? 'stop',
    };
  }

  async *chatStream(
    messages: LLMMessage[],
    options?: LLMRequestOptions,
  ): AsyncGenerator<LLMStreamEvent> {
    const stream: AsyncIterable<ChatCompletionChunk> = await this.client.chat.completions.create(
      {
        model: options?.model ?? this.defaultModel,
        messages: toOpenAIMessages(messages),
        max_tokens: options?.maxTokens ?? 32768,
        temperature: 1.0,
        top_p: 0.95,
        n: 1,
        presence_penalty: 0.0,
        frequency_penalty: 0.0,
        stream: true,
        ...(options?.jsonMode ? { response_format: { type: 'json_object' } } : {}),
      },
      { signal: options?.signal ?? undefined },
    );

    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta;
      if (delta?.content) {
        yield { type: 'content', content: delta.content };
      }

      if (chunk.usage) {
        yield {
          type: 'usage',
          usage: {
            promptTokens: chunk.usage.prompt_tokens,
            completionTokens: chunk.usage.completion_tokens,
          },
        };
      }
    }

    yield { type: 'done' };
  }

  async isAvailable(): Promise<boolean> {
    return typeof process.env.KIMI_API_KEY === 'string' && process.env.KIMI_API_KEY.length > 0;
  }
}
