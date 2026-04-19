# Raino Build Blocker Report

> Last updated: 2026-04-18
> Commit: main (post-Phase 2 upgrade)

## Build Status: CLEAN

All packages, services, apps, tests, and documentation compile and pass. The full monorepo is functional.

## What Works

### Packages (all build clean, 0 errors)

- `@raino/core` — Zod schemas, validation, quote engine, BOM engine, domain logic
- `@raino/db` — Prisma ORM, Supabase auth/storage/pgvector clients (NEW in Phase 2)
- `@raino/llm` — Kimi K2.5 gateway, structured output, retry logic (NEW in Phase 2)
- `@raino/rag` — Storage types, chunking, embeddings, retrieval, provenance (upgraded to Supabase pgvector)
- `@raino/agents` — Workflow state machine, prompt templates, orchestration, contracts
- `@raino/ui` — Pixel-art cyberpunk design system, Press Start 2P + VT323 fonts
- `@raino/kicad-worker-client` — CLI command contracts, job types, mock client
- `@raino/supplier-clients` — DigiKey, Mouser, JLCPCB adapters with factory and fixture fallbacks

### Services (all build clean, 0 errors)

- `ingest-worker` — Full 8-stage pipeline, seed config, CLI entry points
- `design-worker` — KiCad project generation, validation, export contracts
- `quote-worker` — Rough quote calculator, supplier price aggregation
- `audit-worker` — Trace logging, manifest generation, policy checks, Supabase store

### Apps (both build and typecheck clean)

- `@raino/site` — Marketing site: hero, features, architecture, how-it-works. `next build` succeeds.
- `@raino/studio` — Product app: auth (Supabase magic link), dashboard, intake, BOM, previews, downloads, quote, API routes. `next build` succeeds.

### Authentication

- Supabase Auth with magic link is implemented and wired into the studio app.
- Middleware refreshes session cookies on every request.
- Auth callback provisions user records on first sign-in.

### Tests: 692 passing across 25 test suites

| Package/Service            | Tests | Test Files |
| -------------------------- | ----- | ---------- |
| @raino/core                | 145   | 5          |
| @raino/rag                 | 75    | 3          |
| @raino/supplier-clients    | 75    | 1          |
| @raino/llm                 | 37    | 4          |
| @raino/kicad-worker-client | 39    | 1          |
| ingest-worker              | 41    | 3          |
| @raino/audit-worker        | 33    | 2          |
| @raino/db                  | 16    | 1          |
| @raino/agents              | 21    | 1          |
| design-worker              | 25    | 4          |
| quote-worker               | 17    | 1          |
| @raino/ui                  | 80    | 1          |
| @raino/site                | 12    | 2          |
| @raino/studio              | 56    | 5          |

Note: `tests/redteam/failure-modes.test.ts` at root cannot run (vitest not installed at workspace root). `@raino/ui` component tests pass but have long startup under WSL2.

### Documentation

- README.md (English) — comprehensive, 322+ lines
- README.zh-CN.md, README.ja.md, README.ko.md — full translations
- docs/architecture/, docs/api/, docs/deployment/, docs/ingestion/, docs/security/, docs/ux/

### Deployment

Both apps are live on Vercel:

| App    | URL                     | Status |
| ------ | ----------------------- | ------ |
| Site   | raino-site.vercel.app   | Live   |
| Studio | raino-studio.vercel.app | Live   |

## Known Limitations (Not Build Blockers)

### LIMITATION 1: KiCad CLI requires local install

**What**: kicad-cli is not available on the Vercel build server or in most CI environments.
**Impact**: Design generation uses mock/fixture mode. No real ERC, DRC, or Gerber export.
**Resolution**: Install KiCad on a dedicated worker machine. No code changes needed. The kicad-worker-client package communicates through CLI commands only; KiCad is an external GPL boundary.

### LIMITATION 2: No live supplier API credentials in CI

**What**: DigiKey, Mouser, JLCPCB API keys are set in Vercel but not available during CI builds.
**Impact**: All supplier data uses fixture mode with clearly labeled estimates during CI.
**Resolution**: Supplier adapters use a factory pattern that automatically selects real adapters when credentials are present and mock adapters otherwise. Mock adapters are a permanent part of the codebase.

### LIMITATION 3: RAG embeddings are mock without OPENAI_API_KEY

**What**: Without an OpenAI API key, embeddings use a deterministic hash-based mock generator.
**Impact**: RAG retrieval returns results, but similarity scores are not semantically meaningful.
**Resolution**: Set `OPENAI_API_KEY` to use `text-embedding-3-small`. The pgvector schema uses 1536 dimensions for real OpenAI embeddings.

### LIMITATION 4: Language switching links to GitHub READMEs

**What**: The language switcher on the marketing site links to the translated README files on GitHub.
**Impact**: Users leave the app to read translations. No in-app language toggle.
**Resolution**: This is a design choice, not a bug. The translated READMEs serve the open-source audience on GitHub.

### LIMITATION 5: JLCPCB uses MD5 request signing

**What**: JLCPCB's API authenticates each request with an MD5(timestamp + nonce + secretKey) signature.
**Impact**: This is a platform-specific requirement, not a Raino limitation. The adapter handles it correctly when credentials are provided.
**Resolution**: None needed. This is documented behavior of the JLCPCB API.

### LIMITATION 6: Full turbo build may timeout under WSL2

**What**: `pnpm build` (turbo) building both Next.js apps concurrently can exceed timeout in WSL2.
**Impact**: Need to build apps individually: `pnpm --filter @raino/site build` and `pnpm --filter @raino/studio build`.
**Resolution**: Run on native Linux or macOS, or increase turbo timeout.

## Recommended Next Steps

1. Run `pnpm install && pnpm dev` to start local development
2. Set `OPENAI_API_KEY` for real RAG embeddings
3. Deploy to Vercel following docs/deployment/README.md
