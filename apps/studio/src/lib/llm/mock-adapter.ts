/**
 * MockLLMAdapter — deterministic canned responses for E2E testing.
 *
 * Enabled when `process.env.MOCK_LLM === 'true'`.
 * Implements the same LLMProvider interface as KimiProvider,
 * so it can be swapped in via the LLMGateway constructor.
 *
 * Pipeline steps are detected by inspecting the system message content
 * for known template identifiers used in @raino/agents prompt templates.
 */

import type { LLMMessage, LLMRequestOptions, LLMResponse, LLMStreamEvent } from '@raino/llm';

import rp2040Spec from './fixtures/rp2040-spec.json';
import rp2040Architecture from './fixtures/rp2040-architecture.json';
import rp2040Bom from './fixtures/rp2040-bom.json';

const INTAKE_RESPONSE =
  "I'll help you design a PCB. What are you building? Please describe your project — the microcontroller you have in mind, any connectivity requirements, power source, and approximate board size.";

const CLARIFY_RESPONSE = JSON.stringify({
  questions: [
    "What is your target manufacturing volume? This affects component sourcing and PCB specifications (e.g., 100 boards for prototyping vs. 10,000 for production).",
    "Do you have any specific regulatory requirements (CE, FCC, RoHS) or environmental constraints (operating temperature range, humidity)?",
  ],
  guidance:
    "These clarifications will help me select appropriate components and ensure the design meets your production and compliance needs.",
});

const SPEC_RESPONSE = JSON.stringify(rp2040Spec);
const ARCHITECTURE_RESPONSE = JSON.stringify(rp2040Architecture);
const BOM_RESPONSE = JSON.stringify(rp2040Bom);

const DEFAULT_RESPONSE =
  'Mock LLM response: no specific template detected. Please provide more context.';

type PipelineStep = 'intake' | 'clarify' | 'spec' | 'architecture' | 'bom' | 'unknown';

function detectPipelineStep(messages: LLMMessage[]): PipelineStep {
  const systemMsg = messages.find((m) => m.role === 'system');
  const systemText = systemMsg
    ? typeof systemMsg.content === 'string'
      ? systemMsg.content.toLowerCase()
      : ''
    : '';

  const allText = messages
    .map((m) => (typeof m.content === 'string' ? m.content.toLowerCase() : ''))
    .join(' ');

  if (systemText.includes('intake') || allText.includes('intake conversation')) return 'intake';
  if (systemText.includes('clarif') || allText.includes('clarification')) return 'clarify';
  if (systemText.includes('spec') || allText.includes('specification compil')) return 'spec';
  if (systemText.includes('architecture') || allText.includes('architecture selection'))
    return 'architecture';
  if (systemText.includes('bom') || allText.includes('bill of materials')) return 'bom';

  return 'unknown';
}

function getCannedResponse(step: PipelineStep, options?: LLMRequestOptions): string {
  if (options?.jsonMode) {
    switch (step) {
      case 'clarify':
        return CLARIFY_RESPONSE;
      case 'spec':
        return SPEC_RESPONSE;
      case 'architecture':
        return ARCHITECTURE_RESPONSE;
      case 'bom':
        return BOM_RESPONSE;
      case 'intake':
      case 'unknown':
      default:
        return JSON.stringify({ message: DEFAULT_RESPONSE });
    }
  }

  switch (step) {
    case 'intake':
      return INTAKE_RESPONSE;
    case 'clarify':
      return CLARIFY_RESPONSE;
    case 'spec':
      return SPEC_RESPONSE;
    case 'architecture':
      return ARCHITECTURE_RESPONSE;
    case 'bom':
      return BOM_RESPONSE;
    case 'unknown':
    default:
      return DEFAULT_RESPONSE;
  }
}

function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

export class MockLLMProvider {
  readonly name = 'mock';
  readonly defaultModel = 'mock-llm-v1';

  async chat(messages: LLMMessage[], options?: LLMRequestOptions): Promise<LLMResponse> {
    const step = detectPipelineStep(messages);
    const content = getCannedResponse(step, options);
    const promptTokens = messages.reduce((sum, m) => {
      const text = typeof m.content === 'string' ? m.content : JSON.stringify(m.content);
      return sum + estimateTokens(text);
    }, 0);

    return {
      id: `mock-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      content,
      model: this.defaultModel,
      usage: {
        promptTokens,
        completionTokens: estimateTokens(content),
        totalTokens: promptTokens + estimateTokens(content),
      },
      finishReason: 'stop',
    };
  }

  async *chatStream(
    messages: LLMMessage[],
    options?: LLMRequestOptions,
  ): AsyncGenerator<LLMStreamEvent> {
    const step = detectPipelineStep(messages);
    const fullContent = getCannedResponse(step, options);

    // 32-char chunks, no delay — completes in <1ms (well under 1-second requirement)
    const CHUNK_SIZE = 32;
    let offset = 0;

    while (offset < fullContent.length) {
      const end = Math.min(offset + CHUNK_SIZE, fullContent.length);
      yield { type: 'content', content: fullContent.slice(offset, end) };
      offset = end;
    }

    const promptTokens = messages.reduce((sum, m) => {
      const text = typeof m.content === 'string' ? m.content : JSON.stringify(m.content);
      return sum + estimateTokens(text);
    }, 0);

    yield {
      type: 'usage',
      usage: { promptTokens, completionTokens: estimateTokens(fullContent) },
    };

    yield { type: 'done' };
  }

  async isAvailable(): Promise<boolean> {
    return true;
  }
}

export function isMockLLMEnabled(): boolean {
  return process.env.MOCK_LLM === 'true';
}

/**
 * Creates a MockLLMProvider instance for wiring into LLMGateway.
 *
 * @example
 * ```ts
 * import { LLMGateway, KimiProvider } from '@raino/llm';
 * import { createMockProvider, isMockLLMEnabled } from '@/lib/llm/mock-adapter';
 *
 * const provider = isMockLLMEnabled()
 *   ? createMockProvider()
 *   : new KimiProvider(50_000);
 *
 * const gateway = new LLMGateway(provider);
 * ```
 */
export function createMockProvider(): MockLLMProvider {
  return new MockLLMProvider();
}
