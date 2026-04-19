# Raino Launch-Overhaul — Execution Handoff Note

> For: Atlas (execution orchestrator via `/start-work`)  
> From: Prometheus (strategic planner)  
> Date: 2026-04-18

---

## Where the Main Plan Lives

**`.sisyphus/plans/launch-overhaul.md`** — Single source of truth. 23 implementation tasks + 4 final verification tasks across 5 waves.

## Supporting Documents

| Document       | Location                              | Purpose                                                          |
| -------------- | ------------------------------------- | ---------------------------------------------------------------- |
| Audit Dossier  | `.sisyphus/drafts/audit-dossier.md`   | Full audit findings, blocker list, risk register                 |
| Research Notes | `.sisyphus/drafts/research-notes.md`  | Official doc references for Supabase, Kimi, suppliers            |
| Draft          | `.sisyphus/drafts/launch-overhaul.md` | Working memory from interview (can be deleted after plan starts) |

## Highest-Risk Areas

### 1. Project Ownership Bypass (Task 1) — 🔴 SECURITY

- `apps/studio/src/app/projects/[id]/page.tsx` has NO ownership check
- Any authenticated user can view any project by UUID
- **Must be first task executed** — security vulnerability

### 2. Design Job Dispatch (Task 5) — 🟡 ARCHITECTURE

- Workers are libraries, not services — this is correct but non-obvious
- The "dispatch" is calling worker functions directly from API routes
- Don't create separate processes, cron jobs, or external triggers

### 3. $0 Price Bug (Task 7) — 🔴 DATA INTEGRITY

- `resolvePrice()` converts null→0
- $0 wins best-price comparison against real prices
- Affects all quotes generated from supplier data

### 4. RAG Embedding Provider (Task 8) — 🟡 EXTERNAL DEPENDENCY

- Requires `OPENAI_API_KEY` (new env var)
- pgvector dimension must change from 384→1536
- Existing fixture data won't be semantically meaningful with real embeddings

### 5. Artifact Persistence (Task 6) — 🟡 INFRASTRUCTURE

- `uploadArtifactsToStorage()` function exists but is never called
- Must wire into job completion path
- Requires Supabase Storage bucket `design-artifacts` to exist

## What Must Be Done First

**Wave 1 — All 7 tasks can run in parallel:**

1. Task 1: Fix project ownership bypass (SECURITY — do first)
2. Task 2: Fix auth callback error propagation
3. Task 3: Generate Prisma migrations (FOUNDATION — blocks RAG work)
4. Task 4: Clean up dead env vars
5. Task 5: Wire design job dispatch (CORE — unblocks preview/download)
6. Task 6: Wire artifact persistence (CORE — unblocks downloads)
7. Task 7: Fix $0 price bug (DATA — unblocks supplier validation)

## What Must NOT Be Broken During Execution

### Never Change

- `packages/ui/` — Design system is coherent and complete
- Monorepo structure (pnpm + turbo)
- Build configuration (`turbo.json`, `tsconfig.json`)
- Existing 252+ tests (all must continue passing)
- Auth middleware pattern (it's correct)
- Supplier factory pattern (it's correct)

### Never Introduce

- `as any`, `@ts-ignore`, `@ts-expect-error`
- Empty catch blocks
- Hardcoded credentials
- Claims of live connections when using fixtures
- New npm dependencies without justification

### Never Delete

- Existing tests
- Mock adapters (they're permanent honest fallbacks)
- Fixture data (used for testing without credentials)
- Any Prisma model

## Key Architecture Decisions (Don't Revisit)

1. **Workers are libraries** — Quote, audit, ingest, and design workers export functions. They are NOT separate services/processes. API routes call them directly.

2. **Honest degraded mode** — When credentials are missing, show honest labels. Never pretend to have a live connection. Mock adapters are permanent fallbacks.

3. **KiCad CLI NOT on server** — Accept fixture mode for launch. The KiCad CLI requires a local install that can't run on Vercel. Honestly label previews as fixtures.

4. **JLCPCB MD5 is platform characteristic** — JLCPCB's API requires MD5 signing. This is not a Raino security choice. Document it. Don't try to change it.

5. **No i18n system** — Language switcher links to GitHub README translations. Accept this for launch.

6. **Embedding provider is OpenAI** — Moonshot has NO embedding API. Use OpenAI `text-embedding-3-small` (1536 dims, $0.02/1M tokens).

## Deployment Checklist (Post-Execution)

1. Verify all env vars set in Vercel dashboard for BOTH projects
2. Add new `OPENAI_API_KEY` env var to Vercel studio project
3. Run Supabase migrations in order: 00001 → 00002 → 00003 → 00004
4. Run `prisma migrate deploy` against Supabase
5. Create `design-artifacts` storage bucket in Supabase
6. Push to main → verify Vercel builds succeed
7. Test live sites: raino-site.vercel.app and raino-studio.vercel.app
8. Run full E2E test suite

## Commit Order

23 atomic commits in execution order. Each has a pre-commit verification command. See the Commit Strategy section in the main plan.
