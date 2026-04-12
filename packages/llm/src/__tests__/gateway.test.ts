import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LLMGateway } from '../gateway';
import type { LLMProvider } from '../provider';
import type { LLMResponse, LLMStreamEvent } from '../types';

function createResponse(content: string): LLMResponse {
  return {
    id: 'test-id',
    content,
    model: 'kimi-k2-0711',
    usage: { promptTokens: 10, completionTokens: 5, totalTokens: 15 },
    finishReason: 'stop',
  };
}

function createError(status: number, message: string): Error {
  const error = new Error(message) as Error & { status?: number };
  error.status = status;
  return error;
}

function createMockProvider(): {
  provider: LLMProvider;
  chatMock: ReturnType<typeof vi.fn>;
  chatStreamMock: ReturnType<typeof vi.fn>;
} {
  const chatMock = vi.fn();
  const chatStreamMock = vi.fn();

  const provider: LLMProvider = {
    name: 'mock',
    defaultModel: 'mock-model',
    chat: chatMock,
    chatStream: chatStreamMock,
    isAvailable: vi.fn().mockResolvedValue(true),
  };

  return { provider, chatMock, chatStreamMock };
}

describe('LLMGateway', () => {
  let mockProvider: ReturnType<typeof createMockProvider>;

  beforeEach(() => {
    mockProvider = createMockProvider();
  });

  it('chat delegates to provider', async () => {
    mockProvider.chatMock.mockResolvedValue(createResponse('hello'));

    const gateway = new LLMGateway(mockProvider.provider);
    const result = await gateway.chat([{ role: 'user', content: 'hi' }]);

    expect(result.content).toBe('hello');
    expect(mockProvider.chatMock).toHaveBeenCalledTimes(1);
  });

  it('retries on 429 (rate limit)', async () => {
    mockProvider.chatMock
      .mockRejectedValueOnce(createError(429, 'Rate limited'))
      .mockResolvedValueOnce(createResponse('success'));

    const gateway = new LLMGateway(mockProvider.provider, {
      maxRetries: 3,
      retryDelay: 10,
      retryBackoff: 1,
    });

    const result = await gateway.chat([{ role: 'user', content: 'hi' }]);
    expect(result.content).toBe('success');
    expect(mockProvider.chatMock).toHaveBeenCalledTimes(2);
  });

  it('retries on 500 (server error)', async () => {
    mockProvider.chatMock
      .mockRejectedValueOnce(createError(500, 'Internal Server Error'))
      .mockResolvedValueOnce(createResponse('recovered'));

    const gateway = new LLMGateway(mockProvider.provider, {
      maxRetries: 3,
      retryDelay: 10,
      retryBackoff: 1,
    });

    const result = await gateway.chat([{ role: 'user', content: 'hi' }]);
    expect(result.content).toBe('recovered');
    expect(mockProvider.chatMock).toHaveBeenCalledTimes(2);
  });

  it('retries on 502 and 503', async () => {
    mockProvider.chatMock
      .mockRejectedValueOnce(createError(502, 'Bad Gateway'))
      .mockRejectedValueOnce(createError(503, 'Service Unavailable'))
      .mockResolvedValueOnce(createResponse('ok'));

    const gateway = new LLMGateway(mockProvider.provider, {
      maxRetries: 3,
      retryDelay: 10,
      retryBackoff: 1,
    });

    const result = await gateway.chat([{ role: 'user', content: 'hi' }]);
    expect(result.content).toBe('ok');
    expect(mockProvider.chatMock).toHaveBeenCalledTimes(3);
  });

  it('does NOT retry on 400 (bad request)', async () => {
    mockProvider.chatMock.mockRejectedValue(createError(400, 'Bad Request'));

    const gateway = new LLMGateway(mockProvider.provider, {
      maxRetries: 3,
      retryDelay: 10,
    });

    await expect(gateway.chat([{ role: 'user', content: 'hi' }])).rejects.toThrow('Bad Request');

    expect(mockProvider.chatMock).toHaveBeenCalledTimes(1);
  });

  it('does NOT retry on 401 (auth error)', async () => {
    mockProvider.chatMock.mockRejectedValue(createError(401, 'Unauthorized'));

    const gateway = new LLMGateway(mockProvider.provider, {
      maxRetries: 3,
      retryDelay: 10,
    });

    await expect(gateway.chat([{ role: 'user', content: 'hi' }])).rejects.toThrow('Unauthorized');

    expect(mockProvider.chatMock).toHaveBeenCalledTimes(1);
  });

  it('respects maxRetries limit', async () => {
    mockProvider.chatMock.mockRejectedValue(createError(429, 'Rate limited'));

    const gateway = new LLMGateway(mockProvider.provider, {
      maxRetries: 2,
      retryDelay: 10,
      retryBackoff: 1,
    });

    await expect(gateway.chat([{ role: 'user', content: 'hi' }])).rejects.toThrow('Rate limited');

    // 1 initial + 2 retries = 3 total calls
    expect(mockProvider.chatMock).toHaveBeenCalledTimes(3);
  });

  it('uses exponential backoff', async () => {
    vi.useFakeTimers();

    mockProvider.chatMock
      .mockRejectedValueOnce(createError(500, 'err'))
      .mockRejectedValueOnce(createError(500, 'err'))
      .mockResolvedValueOnce(createResponse('ok'));

    const gateway = new LLMGateway(mockProvider.provider, {
      maxRetries: 3,
      retryDelay: 100,
      retryBackoff: 2,
    });

    const promise = gateway.chat([{ role: 'user', content: 'hi' }]);

    // Advance timers to let retries complete
    await vi.advanceTimersByTimeAsync(100);
    await vi.advanceTimersByTimeAsync(200);
    await vi.advanceTimersByTimeAsync(400);

    const result = await promise;
    expect(result.content).toBe('ok');

    vi.useRealTimers();
  });

  it('cancels on abort signal', async () => {
    const controller = new AbortController();
    controller.abort();

    mockProvider.chatMock.mockRejectedValue(createError(500, 'err'));

    const gateway = new LLMGateway(mockProvider.provider, {
      maxRetries: 3,
      retryDelay: 10,
      abortSignal: controller.signal,
    });

    await expect(gateway.chat([{ role: 'user', content: 'hi' }])).rejects.toThrow();

    expect(mockProvider.chatMock).toHaveBeenCalledTimes(0);
  });

  it('chatStream yields events from provider', async () => {
    const events: LLMStreamEvent[] = [{ type: 'content', content: 'Hello' }, { type: 'done' }];

    async function* gen() {
      for (const e of events) yield e;
    }

    mockProvider.chatStreamMock.mockReturnValue(gen());

    const gateway = new LLMGateway(mockProvider.provider);
    const collected: LLMStreamEvent[] = [];

    for await (const event of gateway.chatStream([{ role: 'user', content: 'hi' }])) {
      collected.push(event);
    }

    expect(collected).toEqual(events);
  });

  it('isAvailable delegates to provider', async () => {
    const gateway = new LLMGateway(mockProvider.provider);
    expect(await gateway.isAvailable()).toBe(true);
  });
});
