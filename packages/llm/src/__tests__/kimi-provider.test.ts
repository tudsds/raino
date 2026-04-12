import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { LLMStreamEvent } from '../types';

function createMockResponse(
  overrides?: Partial<{
    id: string;
    content: string;
    model: string;
    finish_reason: string;
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  }>,
) {
  return {
    id: overrides?.id ?? 'chatcmpl-test123',
    object: 'chat.completion' as const,
    created: Date.now(),
    model: overrides?.model ?? 'kimi-k2-0711',
    choices: [
      {
        index: 0,
        message: {
          role: 'assistant' as const,
          content: overrides?.content ?? 'Hello from Kimi!',
        },
        finish_reason: overrides?.finish_reason ?? 'stop',
      },
    ],
    usage: {
      prompt_tokens: overrides?.prompt_tokens ?? 10,
      completion_tokens: overrides?.completion_tokens ?? 5,
      total_tokens: overrides?.total_tokens ?? 15,
    },
  };
}

const mockCreate = vi.fn();

vi.mock('openai', () => {
  return {
    default: class MockOpenAI {
      chat = {
        completions: {
          create: (...args: unknown[]) => mockCreate(...args),
        },
      };
    },
  };
});

import { KimiProvider } from '../providers/kimi';

describe('KimiProvider', () => {
  let provider: KimiProvider;

  beforeEach(() => {
    mockCreate.mockReset();
    provider = new KimiProvider();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('has correct name and defaultModel', () => {
    expect(provider.name).toBe('kimi');
    expect(provider.defaultModel).toBe('kimi-k2-0711');
  });

  it('isAvailable returns false without KIMI_API_KEY', async () => {
    const original = process.env.KIMI_API_KEY;
    delete process.env.KIMI_API_KEY;
    const p = new KimiProvider();
    expect(await p.isAvailable()).toBe(false);
    if (original) process.env.KIMI_API_KEY = original;
  });

  it('isAvailable returns true with KIMI_API_KEY set', async () => {
    const original = process.env.KIMI_API_KEY;
    process.env.KIMI_API_KEY = 'test-key';
    const p = new KimiProvider();
    expect(await p.isAvailable()).toBe(true);
    if (original) process.env.KIMI_API_KEY = original;
    else delete process.env.KIMI_API_KEY;
  });

  it('chat returns a valid LLMResponse', async () => {
    mockCreate.mockResolvedValue(createMockResponse({ content: 'Test response' }));

    const result = await provider.chat([{ role: 'user', content: 'Hello' }]);

    expect(result.content).toBe('Test response');
    expect(result.id).toBe('chatcmpl-test123');
    expect(result.model).toBe('kimi-k2-0711');
    expect(result.usage.promptTokens).toBe(10);
    expect(result.usage.completionTokens).toBe(5);
    expect(result.usage.totalTokens).toBe(15);
    expect(result.finishReason).toBe('stop');
  });

  it('chat passes fixed params to openai create', async () => {
    mockCreate.mockResolvedValue(createMockResponse());

    await provider.chat([{ role: 'user', content: 'test' }]);

    expect(mockCreate).toHaveBeenCalledTimes(1);
    const callArgs = mockCreate.mock.calls[0]![0];
    expect(callArgs.temperature).toBe(1.0);
    expect(callArgs.top_p).toBe(0.95);
    expect(callArgs.n).toBe(1);
    expect(callArgs.presence_penalty).toBe(0.0);
    expect(callArgs.frequency_penalty).toBe(0.0);
    expect(callArgs.max_tokens).toBe(32768);
    expect(callArgs.model).toBe('kimi-k2-0711');
  });

  it('chat supports jsonMode', async () => {
    mockCreate.mockResolvedValue(createMockResponse({ content: '{"key": "value"}' }));

    await provider.chat([{ role: 'user', content: 'test' }], { jsonMode: true });

    const callArgs = mockCreate.mock.calls[0]![0];
    expect(callArgs.response_format).toEqual({ type: 'json_object' });
  });

  it('chat does not set response_format when jsonMode is false', async () => {
    mockCreate.mockResolvedValue(createMockResponse());

    await provider.chat([{ role: 'user', content: 'test' }]);

    const callArgs = mockCreate.mock.calls[0]![0];
    expect(callArgs.response_format).toBeUndefined();
  });

  it('chat uses custom model from options', async () => {
    mockCreate.mockResolvedValue(createMockResponse());

    await provider.chat([{ role: 'user', content: 'test' }], { model: 'kimi-k2-custom' });

    const callArgs = mockCreate.mock.calls[0]![0];
    expect(callArgs.model).toBe('kimi-k2-custom');
  });

  it('chatStream yields content events', async () => {
    const chunks = [
      { choices: [{ delta: { content: 'Hello' } }] },
      { choices: [{ delta: { content: ' world' } }] },
      { usage: { prompt_tokens: 10, completion_tokens: 5 }, choices: [{ delta: {} }] },
    ];

    mockCreate.mockResolvedValue(chunks);

    const events: LLMStreamEvent[] = [];
    for await (const event of provider.chatStream([{ role: 'user', content: 'test' }])) {
      events.push(event);
    }

    expect(events).toEqual([
      { type: 'content', content: 'Hello' },
      { type: 'content', content: ' world' },
      { type: 'usage', usage: { promptTokens: 10, completionTokens: 5 } },
      { type: 'done' },
    ]);
  });

  it('chatStream passes fixed params', async () => {
    mockCreate.mockResolvedValue([]);

    for await (const _ of provider.chatStream([{ role: 'user', content: 'test' }])) {
      void _;
    }

    const callArgs = mockCreate.mock.calls[0]![0];
    expect(callArgs.temperature).toBe(1.0);
    expect(callArgs.top_p).toBe(0.95);
    expect(callArgs.stream).toBe(true);
  });

  it('chat with system and user messages', async () => {
    mockCreate.mockResolvedValue(createMockResponse());

    await provider.chat([
      { role: 'system', content: 'You are a helpful assistant.' },
      { role: 'user', content: 'Hello' },
    ]);

    const callArgs = mockCreate.mock.calls[0]![0];
    expect(callArgs.messages).toEqual([
      { role: 'system', content: 'You are a helpful assistant.' },
      { role: 'user', content: 'Hello' },
    ]);
  });
});
