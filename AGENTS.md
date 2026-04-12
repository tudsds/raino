# Raino — Agentic PCB & PCBA Workflow Platform

## Mission

Raino is an MIT-licensed, constrained, auditable, source-traceable hardware-design and manufacturing-handoff system. It converts fuzzy hardware intent into structured specs, selects approved architectures, resolves procurement data, generates KiCad projects, and produces manufacturing bundles with rough quotes.

## Stop-and-Ask Policy

- If blocked by missing credentials, missing API access, or missing environment → STOP. Report blocker.
- If a design decision could go multiple ways with 2x+ effort difference → ASK.
- Never fake live integration data. Use fixture/degraded mode and label it.

## Architecture Boundaries

- KiCad is an EXTERNAL worker boundary. GPL-licensed. Not embedded.
- Supplier adapters (DigiKey, Mouser, JLCPCB) are INTERFACE + ADAPTER pattern. No live credentials assumed.
- RAG is for engineering knowledge retrieval. NOT for live pricing/stock/order state.
- Quote source of truth = structured supplier adapters, not RAG.

## Monorepo Structure

```
apps/site          → Next.js marketing site (port 3000)
apps/studio        → Next.js product app (port 3001)
packages/core      → Zod schemas, validation, domain logic
packages/rag       → Chunking, embeddings, retrieval
packages/agents    → Workflow contracts, orchestration
packages/ui        → Cyberpunk design system
packages/kicad-worker-client → KiCad CLI contracts
packages/supplier-clients    → Supplier adapter interfaces
services/ingest-worker       → Doc ingestion pipeline
services/design-worker       → KiCad project generation
services/quote-worker        → Rough quote engine
services/audit-worker        → Traces, manifests, provenance
```

## Commands

```bash
pnpm install          # Install all deps
pnpm dev              # Run all apps in dev mode
pnpm build            # Build all packages and apps
pnpm test             # Run all tests
pnpm lint             # Lint all
pnpm typecheck        # Type check all
```

## Testing Requirements

- Every Zod schema must have parse success + failure tests
- Quote engine must have golden-output tests
- Ingestion pipeline must have sufficiency-gate tests
- RAG retrieval must have provenance verification tests
- Failure modes must be tested (hallucinated parts, missing errata, etc.)

## Documentation

- READMEs in EN, zh-CN, ja, ko
- docs/architecture, docs/api, docs/deployment, docs/ingestion, docs/security, docs/ux

## No-Fake-Integration Policy

- Never fabricate live pricing. Use fixture data labeled as estimates.
- Never claim a live API connection when using fixtures.
- Every degraded-mode path must be inspectable and reported.

## Licensing

- Raino: MIT
- KiCad: External GPL boundary. KiCad libraries and generated designs have different license considerations.

## Anti-Patterns

- Do NOT use `as any`, `@ts-ignore`, `@ts-expect-error`
- Do NOT leave empty catch blocks
- Do NOT delete tests to pass builds
- Do NOT simplify user requirements into demos

## Phase 2 Upgrade Status (IN PROGRESS)

### Architecture Changes

- NEW: `packages/db/` — Prisma + Supabase persistence layer
- NEW: `packages/llm/` — Kimi K2.5 model gateway
- UPGRADED: `packages/rag/` — Supabase-backed stores (pgvector)
- UPGRADED: `packages/supplier-clients/` — Real API adapters + factory
- UPGRADED: `packages/ui/` — Pixel-art cyberpunk design system
- UPGRADED: `apps/studio/` — Real auth, Supabase, server components
- UPGRADED: All 4 services — Real backing stores

### New Dependencies

- @supabase/ssr, @supabase/supabase-js — Auth + Postgres + Storage
- openai — Kimi K2.5 client (OpenAI-compatible)
- prisma, @prisma/client — Database ORM

### Environment Variables

See `.env.example` for all 20 required placeholders.
App runs in degraded/fixture mode without credentials.

### Key Decisions

- ORM: Prisma (coexists with Supabase RLS)
- Auth: Supabase Auth (magic link)
- LLM: Kimi K2.5 via OpenAI SDK (baseURL: moonshot.ai)
- Fonts: Press Start 2P (headings) + VT323 (body)
- Job Queue: Supabase pg tables (design_jobs)
- Mock adapters: Kept as permanent honest fallbacks
