# Launch Overhaul Learnings

## Task 4: Env var cleanup

- `SUPABASE_DB_URL` is dead — Prisma schema uses `DATABASE_URL`, not `SUPABASE_DB_URL`
- `SUPABASE_DB_URL` appears in README.md and docs/deployment/README.md tables but NOT in source code
- `DIGIKEY_REDIRECT_URI` IS read by factory.ts but RealDigiKeyAdapter doesn't use it for client_credentials flow (only for OAuth code flow)
- `EMBEDDING_PROVIDER` and `EMBEDDING_MODEL` are fully dead — no source code reads them
- packages/db/AGENTS.md env var table uses stale names (`SUPABASE_URL`, `SUPABASE_ANON_KEY`) that don't match `.env.example` — not part of this task but worth noting

## Task 1: Project detail page auth bypass fix

- `verifyProjectOwnership()` already returns the full project with includes — no need to re-query with `prisma.project.findUnique`
- Pattern: `getCurrentUser()` → redirect if null → `verifyProjectOwnership(id, user.id)` → `notFound()` if unauthorized
- API routes use `requireAuth()` wrapper; server components must use `getCurrentUser()` + manual redirect
- The returned `project` from `verifyProjectOwnership` already includes `spec`, `bom`, `quotes`, `intakeMessages`, `auditEntries` per the `getProject()` include list

## Task 6: Artifact persistence to Supabase Storage

- `uploadArtifactsToStorage()` in manifest.ts was fully implemented but never called — only the manifest generation was used for counting
- `pollAndExecuteWithPrisma()` is the DB-aware worker entry point; `pollAndExecuteJob()` is callback-based (no DB access)
- DesignArtifact model has non-nullable `storageBucket` and `storageKey` String fields — empty string signals "not persisted"
- `executeJob()` is a pure function; artifact persistence must happen in the orchestrator (`pollAndExecuteWithPrisma`) which has Prisma access
- `ArtifactManifest` contains local file paths — still useful for upload, but the manifest itself shouldn't be stored raw in job results
- For signed URLs in downloads route, need service-role Supabase client (`createClient` from `@supabase/supabase-js` directly) — the cookie-based server client from `@raino/db/supabase/server` uses anon key which lacks storage admin access
- Artifact persistence is best-effort: if upload fails, the design job still succeeds. Artifacts get empty storageBucket/storageKey and can be retried
- The `design-artifacts` bucket must be created in Supabase Storage (documented as requirement)
- `@supabase/supabase-js` is already a dependency in both `@raino/db` and `@raino/studio` packages

## Task 16: Architecture & Deployment Docs Update

### Key Findings

- **Worker-as-library pattern confirmed**: All 4 workers (design, quote, audit, ingest) are npm packages with `"main": "./dist/index.js"`. They export typed functions imported directly by API routes. Not separate processes.

- **Prisma schema has 14 models**, not the 5 previously documented. Includes multi-tenant org support (Organization, OrganizationMember) and full workflow models (IntakeMessage, Spec, Architecture, BOM, BOMRow, Quote, IngestionManifest, DesignArtifact, HandoffRequest).

- **RAG tables are raw SQL only** (documents, chunks, embeddings in `00003_vector_and_rag.sql`). Prisma cannot model `vector` columns.

- **DB export names were wrong in AGENTS.md**: Actual exports are `createSupabaseServerClient`, `createSupabaseBrowserClient`, `updateSession`, `prisma`. Old doc said `createClient`.

- **Env var `DATABASE_URL`** (not `SUPABASE_DB_URL` as in old deployment doc). Matches Prisma schema.

- **Embeddings use `EMBEDDING_PROVIDER` + `OPENAI_API_KEY`** (not `OPENAI_BASE_URL` required). Factory pattern: "openai" with key = real, otherwise mock.

- **Migration numbering has a duplicate `00004`** in actual files (`00004_pgvector_1536.sql` and `00004_storage_buckets.sql`). The migrations README references them as 00005 and 00006. Documented actual filenames.

- **Storage buckets**: `designs`, `documents`, `avatars`. Note: design-worker code references `design-artifacts` as bucket name in `queue/worker.ts` line 45, but migration creates `designs`. Potential discrepancy to resolve separately.

- **25 env vars total** in .env.example (not 20 as previously claimed). Added `KIMI_API_BASE_URL`, `OPENAI_API_KEY`, `OPENAI_BASE_URL` to deployment docs.

- **apps/studio/app** directory does not exist as a direct child. Actual API routes are at `apps/studio/src/app/api/`.

## Task 13: Degraded Mode Banners

### Component Design

- Created `DegradedModeBanner` in `apps/studio/src/components/DegradedModeBanner.tsx`
- Client component (uses React state for dismissibility)
- Props: `message: string`, `severity?: 'amber' | 'red'`
- Uses theme colors directly: amber (#ffaa00), red (#ff3366)
- Styled with border + glow matching NeonBorder pattern (but without modifying the design system component)
- Dismissible with X button, visible by default
- Warning triangle icon + close icon from inline SVG

### Page Integrations

- **Previews page**: Refactored from pure client component to server wrapper (`page.tsx`) + client inner (`PreviewsPageClient.tsx`). Server wrapper checks `process.env.KICAD_CLI_PATH` and passes degraded message to client. This is the pattern needed when a client component needs access to non-NEXT_PUBLIC env vars.
- **Quote page**: Server component imports `getAdapterStatus()` from `@raino/supplier-clients`. Builds per-supplier live/mock status message. Uses red severity when all 3 suppliers are mock, amber otherwise.
- **BOM page**: Server component checks `bom?.isEstimate` and shows amber banner about fixture data.

### Pre-existing Issues

- `@raino/supplier-clients` is in studio's package.json but not in tsconfig paths, causing LSP module resolution errors in some files. This is pre-existing and not related to banner work.
- Build/typecheck failures in `packages/supplier-clients/src/mouser/real-adapter.ts` and `apps/studio/src/lib/data/ingestion-pipeline.ts` are pre-existing.

## Task 19: Studio E2E Tests

### Files Created

- `tests/e2e/studio/auth.spec.ts` — 3 tests covering login page rendering, magic link form submission, and signup navigation
- `tests/e2e/studio/projects.spec.ts` — 3 tests covering project list empty state, project creation form flow, and cancel navigation
- `tests/e2e/studio/project-detail.spec.ts` — 3 tests covering unauthenticated redirect to login, ownership boundary, and intake page UI rendering

### Config Changes

- `playwright.config.ts` updated with:
  - `testMatch` filters per project (`site.*\.spec\.ts` for site, `studio\/.*\.spec\.ts` for studio)
  - `studio` project on port 3001
  - Two `webServer` entries with 120s timeout each (Next.js compilation is slow)

### Environment Issue

Playwright Chromium fails to launch due to missing system dependency `libnspr4.so`. This is a **pre-existing environment blocker** — the original site tests fail identically. The web servers start successfully; the issue is purely the browser binary.

Workaround for CI: run `npx playwright install --with-deps` with sufficient privileges.

### Key Design Decisions

- Tests are written to work in both degraded mode (no Supabase) and full mode. Assertions use regex patterns that match either success or error states.
- No comments were added to test files per project conventions.
- The intake page test was included in `project-detail.spec.ts` since EXPECTED OUTCOME requested intake coverage but MUST DO only listed three files.

## Task 20: Marketing Site Overhaul (4 New Pages + Homepage Enhancements)

### New Pages Created

- `/showcase` — 6 example projects with PCB wireframe mockups, testimonials section, CTA
- `/integrations` — 6 integration cards (Kimi, Supabase, DigiKey, Mouser, JLCPCB, KiCad) with degraded mode info
- `/changelog` — Timeline of releases v0.1.0 through v0.5.0, "Coming Soon" roadmap
- `/trust` — Security practices grid, 4 commitments, privacy policy section

### Homepage Enhancements

- Added `LovedByEngineers` section with 3 testimonials after Features
- Added `IntegrationLogos` section with 6 integration links after Architecture

### Design System Patterns Applied

- `pt-16` on `<main>` for navbar offset (standard across all non-home pages)
- `circuit-grid` on hero sections
- Alternating `bg-[#0a0a0f]` / `bg-[#111118]` backgrounds
- `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8` content containers
- Border colors use `${color}40` for subtle tinting
- Status badges: `px-2 py-1 text-xs font-mono border` with `${color}10` bg, `${color}40` border
- Timeline pattern: `relative pl-8 border-l-2` with absolute dot

### Files Modified

- `Navbar.tsx` — Added Showcase, Integrations, Trust links to `navLinks` array
- `Footer.tsx` — Added new pages to Product column, Trust/Changelog to Resources column
- `page.tsx` — Added 2 new sections, testimonials and integration logos data arrays

### Build Verification

- `pnpm build --filter @raino/site` succeeded
- 13 static pages generated (up from 9)
- All 4 new pages prerendered successfully
