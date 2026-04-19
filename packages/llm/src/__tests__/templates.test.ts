import { describe, it, expect, vi, beforeEach } from 'vitest';
import { templateToMessages, chatWithTemplate } from '../templates';
import { LLMGateway } from '../gateway';
import type { LLMProvider } from '../provider';
import type { LLMResponse } from '../types';

function createResponse(content: string): LLMResponse {
  return {
    id: 'test-id',
    content,
    model: 'kimi-k2.5',
    usage: { promptTokens: 10, completionTokens: 5, totalTokens: 15 },
    finishReason: 'stop',
  };
}

describe('templateToMessages', () => {
  it('converts an intake template to system + user messages', () => {
    const messages = templateToMessages('intake', {
      message: 'I need an IoT sensor board',
      files: '',
      fileList: '',
    });

    expect(messages).toHaveLength(2);
    expect(messages[0]!.role).toBe('system');
    expect(messages[0]!.content).toContain('Raino');
    expect(messages[1]!.role).toBe('user');
    expect(messages[1]!.content).toContain('IoT sensor board');
  });

  it('substitutes variables in user prompt', () => {
    const messages = templateToMessages('intake', {
      message: 'Build a motor controller',
      files: '',
      fileList: '',
    });

    const userMsg = messages[1]!;
    expect(typeof userMsg.content).toBe('string');
    expect(userMsg.content).toContain('Build a motor controller');
    expect(userMsg.content).not.toContain('{{message}}');
  });

  it('includes conditional section when files variable is present', () => {
    const messages = templateToMessages('intake', {
      message: 'Hello',
      files: 'yes',
      fileList: 'schematic.pdf',
    });

    const userMsg = messages[1]!;
    expect(typeof userMsg.content).toBe('string');
    expect(userMsg.content).toContain('Attached files');
    expect(userMsg.content).toContain('schematic.pdf');
  });

  it('omits conditional section when files variable is empty', () => {
    const messages = templateToMessages('intake', {
      message: 'Hello',
      files: '',
      fileList: '',
    });

    const userMsg = messages[1]!;
    expect(typeof userMsg.content).toBe('string');
    expect(userMsg.content).not.toContain('Attached files');
  });

  it('handles clarification template', () => {
    const messages = templateToMessages('clarification', {
      projectContext: 'User wants a sensor board',
      currentSpec: 'Partial spec: needs WiFi',
    });

    expect(messages).toHaveLength(2);
    expect(messages[0]!.role).toBe('system');
    expect(messages[1]!.content).toContain('sensor board');
    expect(messages[1]!.content).toContain('Partial spec');
  });

  it('throws for unknown template id', () => {
    expect(() => templateToMessages('nonexistent_template', {})).toThrow(
      'Template not found: nonexistent_template',
    );
  });

  it('handles architecture_selection template with all variables', () => {
    const messages = templateToMessages('architecture_selection', {
      spec: 'IoT sensor with WiFi',
      requirementCount: '5',
      keyInterfaces: 'SPI, UART',
      powerSource: 'Battery',
      targetVolume: '1000',
    });

    const userMsg = messages[1]!;
    expect(userMsg.content).toContain('IoT sensor with WiFi');
    expect(userMsg.content).toContain('5');
    expect(userMsg.content).toContain('SPI, UART');
  });
});

describe('chatWithTemplate', () => {
  let chatMock: ReturnType<typeof vi.fn>;
  let gateway: LLMGateway;

  beforeEach(() => {
    chatMock = vi.fn();
    const provider: LLMProvider = {
      name: 'mock',
      defaultModel: 'mock-model',
      chat: chatMock,
      chatStream: vi.fn(),
      isAvailable: vi.fn().mockResolvedValue(true),
    };
    gateway = new LLMGateway(provider);
  });

  it('sends template messages through gateway', async () => {
    chatMock.mockResolvedValue(createResponse('analyzed'));

    const result = await chatWithTemplate(gateway, 'intake', {
      message: 'I need a board',
      files: '',
      fileList: '',
    });

    expect(result.content).toBe('analyzed');
    expect(chatMock).toHaveBeenCalledTimes(1);

    const callMessages = chatMock.mock.calls[0]![0];
    expect(callMessages).toHaveLength(2);
    expect(callMessages[0]!.role).toBe('system');
    expect(callMessages[1]!.role).toBe('user');
  });

  it('uses chatStructured when schema is provided', async () => {
    const { z } = await import('zod');
    const schema = z.object({ productType: z.string() });

    chatMock.mockResolvedValue(createResponse(JSON.stringify({ productType: 'IoT sensor' })));

    const result = await chatWithTemplate(
      gateway,
      'intake',
      { message: 'IoT sensor', files: '', fileList: '' },
      schema,
    );

    expect(result).toEqual({ productType: 'IoT sensor' });
    expect(chatMock).toHaveBeenCalledWith(
      expect.any(Array),
      expect.objectContaining({ jsonMode: true }),
    );
  });
});
