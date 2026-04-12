/**
 * LLMProvider — abstraction over LLM backends.
 */

import type { LLMMessage, LLMRequestOptions, LLMResponse, LLMStreamEvent } from './types';

export interface LLMProvider {
  readonly name: string;
  readonly defaultModel: string;

  chat(messages: LLMMessage[], options?: LLMRequestOptions): Promise<LLMResponse>;

  chatStream(messages: LLMMessage[], options?: LLMRequestOptions): AsyncGenerator<LLMStreamEvent>;

  isAvailable(): Promise<boolean>;
}
