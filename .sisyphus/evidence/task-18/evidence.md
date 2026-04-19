# Task 18 Evidence: Raino Agent Memory System

## Files Created

### Bootstrap Files (project root)

- `SOUL.md` — Raino's core identity, personality traits, constraints (~50 words)
- `TOOLS.md` — Full inventory of packages, services, and workflow stages
- `IDENTITY.md` — Prompt modes (full/minimal/none) and behavior rules

### Memory Module (`packages/agents/src/memory/`)

- `types.ts` — TypeScript types for 4-layer memory stack (L0-L3), token budgets, prompt modes, store interfaces, dream consolidation config
- `memory-store.ts` — File-based + in-memory persistence with query filtering, token-budget-aware retrieval, L0/L1/L2 typed accessors
- `context-builder.ts` — Assembles L0-L3 context per invocation with token budget enforcement, auto-compaction at 80% of 32K window, L0 bootstrap file caching
- `dream-consolidator.ts` — Periodic L2→L1 summarization with LLM injection, 30-day pruning, batch processing

### Modified Files

- `packages/agents/src/index.ts` — Added memory module exports (types, MemoryStore, ContextBuilder, DreamConsolidator)

## Architecture Decisions

1. **Dependency Injection for LLM** — `@raino/agents` cannot import `@raino/llm` (circular dependency since `@raino/llm` depends on `@raino/agents`). Dream consolidator accepts a `SummarizeFn` callback, injected at orchestration layer.

2. **No new npm dependencies** — Uses only `crypto` (Node built-in) and `fs` (Node built-in).

3. **Token estimation** — `estimateTokens()` uses `Math.ceil(text.length / 4)` heuristic (character/4 ratio).

4. **Token budgets enforced**: L0: 100, L1: 800, L2: 500, compaction threshold: 25,600 (80% of 32K).

5. **L0 caching** — Bootstrap files (SOUL.md, IDENTITY.md, MEMORY.md) are cached after first read, invalidated via `invalidateL0Cache()`.

## Verification

```
pnpm typecheck — 24/25 tasks pass
  @raino/agents: PASS ✓
  @raino/llm: PASS ✓ (depends on agents, confirms no circular issues)
  @raino/core: PASS ✓
  All services: PASS ✓
  @raino/studio: FAIL (pre-existing .next/types missing, unrelated)
```

## What Was NOT Modified

- No existing agent orchestration code touched
- No existing prompt files changed
- No new npm dependencies added
- No `as any`, `@ts-ignore`, or `@ts-expect-error` used
