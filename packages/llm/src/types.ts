/**
 * Core types for the @raino/llm package.
 */

export interface LLMMessage {
  role: 'system' | 'user' | 'assistant';
  content: string | LLMMessageContent[];
}

export interface LLMMessageContent {
  type: 'text' | 'image_url';
  text?: string;
  image_url?: { url: string };
}

export interface LLMResponse {
  id: string;
  content: string;
  model: string;
  usage: { promptTokens: number; completionTokens: number; totalTokens: number };
  finishReason: string;
}

export interface LLMStreamEvent {
  type: 'content' | 'usage' | 'done' | 'error';
  content?: string;
  usage?: { promptTokens: number; completionTokens: number };
  error?: string;
}

export interface LLMRequestOptions {
  model?: string;
  maxTokens?: number;
  temperature?: number;
  jsonMode?: boolean;
  signal?: AbortSignal;
}
