# packages/llm — LLM Model Gateway

## Purpose

Provides a unified interface for calling language models across Raino's agent workflows. The primary implementation targets Kimi K2.5 via the OpenAI-compatible SDK.

## Package Exports

```typescript
import { llmGateway } from '@raino/llm'; // Default gateway instance
import { LLMGateway } from '@raino/llm'; // Gateway class
import { LLMProvider } from '@raino/llm'; // Provider interface
import { KimiProvider } from '@raino/llm/kimi'; // Kimi K2.5 provider
```

## LLMProvider Interface

All model providers implement this contract:

```typescript
interface LLMProvider {
  readonly name: string;
  complete(prompt: string, options?: LLMOptions): Promise<string>;
  completeStructured<T>(prompt: string, schema: ZodSchema<T>, options?: LLMOptions): Promise<T>;
}
```

`completeStructured` returns type-safe results by parsing the model's JSON output through a Zod schema. If parsing fails, it retries up to the configured limit before throwing.

## KimiProvider Implementation

Kimi K2.5 uses the OpenAI SDK with a custom `baseURL`:

- **Model**: `moonshot-v1-auto` (auto-selects reasoning depth)
- **Base URL**: `https://api.moonshot.cn/v1`
- **Max tokens**: 4096 (fixed, not configurable per call)
- **Temperature**: 0.0 (deterministic output for structured tasks)
- **SDK**: `openai` npm package (OpenAI-compatible)

The provider does not expose model selection or temperature tuning to callers. These are fixed to ensure consistent, reproducible structured outputs. If a caller needs different settings, that is a new provider implementation.

## LLMGateway Retry Logic

The gateway wraps providers with retry and fallback behavior:

1. Calls the provider's `complete` or `completeStructured` method
2. On network error or rate limit (429), waits with exponential backoff (1s, 2s, 4s)
3. Retries up to 3 times
4. On structured parse failure, retries up to 2 times with a re-prompt asking for valid JSON
5. After all retries exhausted, throws `LLMError` with the last error and attempt count

## Structured Output with Zod Validation

For any call that needs structured data (BOM generation, spec compilation, architecture selection), use `completeStructured`. The flow:

1. Provider calls the model with the prompt
2. Model returns a JSON string (via system prompt instructions)
3. JSON is parsed and validated against the provided Zod schema
4. If valid, returns the typed result
5. If invalid, the Zod parse error details are fed back into a retry prompt

The system prompt sent to the model instructs it to respond with valid JSON matching the schema description. This is prompt-based structured output, not function calling.

## Template Wiring from @raino/agents

Agent workflows in `packages/agents` define prompt templates as strings with placeholder variables. The LLM gateway does not handle template rendering. That is the agent's job. The gateway receives a fully rendered prompt string.

Typical flow:

1. Agent selects a template from `@raino/agents/prompts/`
2. Agent renders the template with project context
3. Agent calls `llmGateway.completeStructured(renderedPrompt, schema)`
4. Agent receives typed result and continues the workflow

## Commands

```bash
pnpm build --filter @raino/llm    # tsc
pnpm dev --filter @raino/llm      # tsc --watch
pnpm test --filter @raino/llm     # vitest run
```

## Environment Variables

| Variable       | Purpose                        | Required |
| -------------- | ------------------------------ | -------- |
| `KIMI_API_KEY` | Moonshot API key for Kimi K2.5 | Yes      |

Without `KIMI_API_KEY`, the gateway throws a clear configuration error at call time. There is no fixture/mock fallback for LLM calls. The calling agent is responsible for handling `LLMError`.
