import { describe, it, expect, vi, beforeEach } from 'vitest';
import { z } from 'zod';
import { LLMGateway } from '../gateway';
import type { LLMProvider } from '../provider';
import type { LLMResponse } from '../types';

function createResponse(content: string): LLMResponse {
  return {
    id: 'test-id',
    content,
    model: 'kimi-k2-0711',
    usage: { promptTokens: 10, completionTokens: 5, totalTokens: 15 },
    finishReason: 'stop',
  };
}

function createMockProvider(): { provider: LLMProvider; chatMock: ReturnType<typeof vi.fn> } {
  const chatMock = vi.fn();
  const provider: LLMProvider = {
    name: 'mock',
    defaultModel: 'mock-model',
    chat: chatMock,
    chatStream: vi.fn(),
    isAvailable: vi.fn().mockResolvedValue(true),
  };
  return { provider, chatMock };
}

describe('chatStructured', () => {
  let mockProvider: ReturnType<typeof createMockProvider>;

  beforeEach(() => {
    mockProvider = createMockProvider();
  });

  it('parses valid JSON matching a Zod schema', async () => {
    const schema = z.object({
      name: z.string(),
      age: z.number(),
    });

    mockProvider.chatMock.mockResolvedValue(
      createResponse(JSON.stringify({ name: 'Alice', age: 30 })),
    );

    const gateway = new LLMGateway(mockProvider.provider);
    const result = await gateway.chatStructured(
      [{ role: 'user', content: 'describe alice' }],
      schema,
    );

    expect(result).toEqual({ name: 'Alice', age: 30 });
  });

  it('enables jsonMode on the provider', async () => {
    const schema = z.object({ ok: z.boolean() });
    mockProvider.chatMock.mockResolvedValue(createResponse(JSON.stringify({ ok: true })));

    const gateway = new LLMGateway(mockProvider.provider);
    await gateway.chatStructured([{ role: 'user', content: 'test' }], schema);

    expect(mockProvider.chatMock).toHaveBeenCalledWith(
      [{ role: 'user', content: 'test' }],
      expect.objectContaining({ jsonMode: true }),
    );
  });

  it('throws on invalid JSON response', async () => {
    const schema = z.object({ name: z.string() });
    mockProvider.chatMock.mockResolvedValue(createResponse('not valid json {{{'));

    const gateway = new LLMGateway(mockProvider.provider);

    await expect(
      gateway.chatStructured([{ role: 'user', content: 'test' }], schema),
    ).rejects.toThrow('failed to parse JSON response');
  });

  it('throws when JSON does not match schema', async () => {
    const schema = z.object({
      name: z.string(),
      age: z.number(),
    });

    mockProvider.chatMock.mockResolvedValue(
      createResponse(JSON.stringify({ name: 'Alice', age: 'not-a-number' })),
    );

    const gateway = new LLMGateway(mockProvider.provider);

    await expect(
      gateway.chatStructured([{ role: 'user', content: 'test' }], schema),
    ).rejects.toThrow('does not match schema');
  });

  it('handles nested Zod schemas', async () => {
    const schema = z.object({
      user: z.object({
        name: z.string(),
        address: z.object({
          city: z.string(),
          zip: z.string(),
        }),
      }),
    });

    mockProvider.chatMock.mockResolvedValue(
      createResponse(
        JSON.stringify({
          user: { name: 'Bob', address: { city: 'NYC', zip: '10001' } },
        }),
      ),
    );

    const gateway = new LLMGateway(mockProvider.provider);
    const result = await gateway.chatStructured([{ role: 'user', content: 'test' }], schema);

    expect(result.user.address.city).toBe('NYC');
  });

  it('handles array schemas', async () => {
    const schema = z.array(z.object({ id: z.number(), label: z.string() }));

    mockProvider.chatMock.mockResolvedValue(
      createResponse(
        JSON.stringify([
          { id: 1, label: 'a' },
          { id: 2, label: 'b' },
        ]),
      ),
    );

    const gateway = new LLMGateway(mockProvider.provider);
    const result = await gateway.chatStructured([{ role: 'user', content: 'test' }], schema);

    expect(result).toHaveLength(2);
    expect(result[0]?.label).toBe('a');
  });
});
