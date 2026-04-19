# Raino Launch-Critical Overhaul — Execution Plan

## TL;DR

> **Quick Summary**: Fix 6 critical launch blockers, wire 3 disconnected subsystems (worker dispatch, artifact persistence, real embeddings), harden auth/tenancy, ensure cloud-first correctness, and deploy verified to production.
>
> **Deliverables**:
>
> - Fixed project ownership check preventing unauthorized data access
> - Prisma migrations for reproducible database deployment
> - Working design job dispatch (API-route-triggered polling)
> - Artifacts persisted to Supabase Storage (not ephemeral /tmp)
> - Real embedding provider for meaningful RAG retrieval
> - Fixed supplier price comparison (no $0 winning)
> - Honest degraded mode throughout (no silent fallbacks)
> - Corrected docs/README/marketing site
> - Studio E2E tests
> - Verified cloud deployment on both Vercel projects
>
> **Estimated Effort**: Large (30+ tasks, 5 waves)
> **Parallel Execution**: YES - 5 waves
> **Critical Path**: Task 1 (auth fix) → Task 3 (migrations) → Task 5 (worker dispatch) → Task 12 (docs) → Task 15 (deploy)

---

## Context

### Original Request

Create a launch-ready overhaul plan for Raino so execution agents can transform the existing repo into a finalized, cloud-first, production-usable agentic PCB/PCBA product.

### Interview Summary

**Key Discussions**:

- 4 prior phases completed; Phase 4 launched both apps to Vercel but left critical gaps
- Cloud-first runtime correctness is the top priority
- Honest degraded mode is a core product principle, not a temporary state
- KiCad CLI on server is NOT required for launch (accept honest degraded)

**Research Findings**:

- 10 parallel audit agents examined every subsystem
- 6 CRITICAL blockers prevent safe launch
- 8 HIGH issues should be fixed before launch
- 7 MEDIUM issues are acceptable as known limitations
- Metis consultation identified additional $0 price comparison bug and supplier response validation gap

### Metis Review

**Identified Gaps** (addressed):

- Project page ownership bypass: Added as Task 1 (highest priority)
- $0 price wins best-price: Added as Task 8
- Artifacts ephemeral: Added as Task 6
- No Zod validation on supplier responses: Added to Task 9
- Quote/audit workers are libraries, not services: Factored into dispatch design
- BLOCKER-REPORT.md stale: Added cleanup task

---

## Work Objectives

### Core Objective

Transform the existing Raino repo into a launch-safe, cloud-first product where every user-facing feature is either fully functional or honestly labeled as degraded, with no security vulnerabilities and no false-success states.

### Concrete Deliverables

- `apps/studio/src/app/projects/[id]/page.tsx` — ownership check added
- `packages/db/prisma/migrations/` — full migration history generated
- `packages/db/supabase/migrations/` — RLS policies + pgvector dimension migration
- `apps/studio/src/lib/workers/dispatch.ts` — design job dispatch mechanism
- `services/design-worker/src/queue/completion.ts` — artifact upload on job completion
- `packages/rag/src/embeddings/openai-generator.ts` — real embedding provider
- `packages/supplier-clients/src/common/helpers.ts` — null→0 bug fixed
- `apps/studio/src/lib/quotes/supplier-comparison.ts` — $0 price filter added
- Studio E2E test suite in `tests/e2e/studio/`
- Updated docs/README/marketing site
- Verified Vercel deployment on both projects

### Definition of Done

- [x] `pnpm build` succeeds cleanly
- [x] `pnpm typecheck` succeeds cleanly
- [x] `pnpm test` all 252+ tests pass + new tests pass
- [x] Both Vercel deployments build and render correctly
- [x] No CRITICAL or HIGH blockers remain
- [x] No `as any`, `@ts-ignore`, or empty catch blocks introduced

### Must Have

- Project ownership enforcement on ALL routes and pages
- Prisma migrations that reproduce the full schema on fresh DB
- Working design job dispatch (jobs actually get processed)
- Artifacts persisted to Supabase Storage (survive restart)
- Real embedding provider for RAG (semantic meaning, not hashes)
- Honest price comparison (no $0 winning)
- Honest degraded mode labels on every fallback path
- Cloud-correct URLs (no localhost in production)
- Updated BLOCKER-REPORT.md reflecting current state

### Must NOT Have (Guardrails)

- ❌ No `as any`, `@ts-ignore`, `@ts-expect-error`
- ❌ No empty catch blocks
- ❌ No deleting tests to pass builds
- ❌ No fabricating live supplier data when using fixtures
- ❌ No claiming live API connection when using fixture data
- ❌ No simplifying requirements into demos
- ❌ No i18n system implementation (accept GitHub README links for launch)
- ❌ No KiCad CLI server installation (accept honest degraded)
- ❌ No new npm dependencies without justification
- ❌ No touching `packages/ui` design system (it's coherent as-is)
- ❌ No changes to monorepo structure or build configuration

---

## Verification Strategy

> **ZERO HUMAN INTERVENTION** — ALL verification is agent-executed. No exceptions.

### Test Decision

- **Infrastructure exists**: YES (Vitest + Playwright configured)
- **Automated tests**: YES (tests-after, expand existing coverage)
- **Framework**: Vitest (unit) + Playwright (E2E)

### QA Policy

Every task MUST include agent-executed QA scenarios.
Evidence saved to `.sisyphus/evidence/task-{N}-{scenario-slug}.{ext}`.

- **Frontend/UI**: Use Playwright — Navigate, interact, assert DOM, screenshot
- **API/Backend**: Use Bash (curl) — Send requests, assert status + response
- **Database**: Use Bash (prisma) — Query tables, verify rows
- **Library/Module**: Use Bash (node) — Import, call functions, compare output

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Start Immediately — security + foundation, MAX PARALLEL):
├── Task 1: Fix project ownership bypass [quick] 🔴
├── Task 2: Fix auth callback error propagation [quick]
├── Task 3: Generate Prisma migrations [quick]
├── Task 4: Clean up dead env vars [quick]
├── Task 5: Wire design job dispatch [deep]
├── Task 6: Wire artifact persistence to Supabase Storage [deep]
└── Task 7: Fix null→0 price bug + best-price comparison [unspecified-high]

Wave 2 (After Wave 1 — RAG + supplier hardening):
├── Task 8: Add OpenAI embedding provider [deep] (depends: 3)
├── Task 9: Migrate pgvector dimension 384→1536 [quick] (depends: 3, 8)
├── Task 10: Add supplier response Zod validation [unspecified-high] (depends: 7)
├── Task 11: Add structured error logging to supplier adapters [quick] (depends: 10)
└── Task 12: Wire ingest-worker to studio API route [unspecified-high] (depends: 8)

Wave 3 (After Wave 2 — honesty + frontend):
├── Task 13: Add degraded-mode banners to UI [visual-engineering] (depends: 5, 6)
├── Task 14: Fix localhost URL fallbacks in marketing site [quick]
├── Task 15: Update BLOCKER-REPORT.md [writing]
├── Task 16: Update docs/ directory [writing]
├── Task 17: Update README.md + translations [writing]
└── Task 18: Audit and update marketing site content [visual-engineering]

Wave 4 (After Wave 3 — tests + verification):
├── Task 19: Add studio E2E tests (auth, project creation, workflow) [deep] (depends: 1, 5)
├── Task 20: Add API route tests for critical endpoints [deep] (depends: 1, 7)
├── Task 21: Add RAG retrieval tests with real embeddings [deep] (depends: 8)
├── Task 22: Add design job dispatch integration test [deep] (depends: 5, 6)
└── Task 23: Full build + typecheck + lint + test [quick] (depends: all above)

Wave FINAL (After ALL tasks — 4 parallel reviews, then user okay):
├── Task F1: Plan compliance audit (oracle)
├── Task F2: Code quality review (unspecified-high)
├── Task F3: Real manual QA (unspecified-high + playwright)
└── Task F4: Scope fidelity check (deep)
→ Present results → Get explicit user okay

Critical Path: Task 1 → Task 3 → Task 8 → Task 9 → Task 21 → Task 23 → F1-F4
Parallel Speedup: ~65% faster than sequential
Max Concurrent: 7 (Wave 1)
```

### Dependency Matrix

| Task | Depends On | Blocks         | Wave |
| ---- | ---------- | -------------- | ---- |
| 1    | —          | 19, 20, F1     | 1    |
| 2    | —          | F1             | 1    |
| 3    | —          | 8, 9, 12, F1   | 1    |
| 4    | —          | 15             | 1    |
| 5    | —          | 13, 19, 22, F1 | 1    |
| 6    | —          | 13, 22, F1     | 1    |
| 7    | —          | 10, 20, F1     | 1    |
| 8    | 3          | 9, 12, 21, F1  | 2    |
| 9    | 3, 8       | 21, F1         | 2    |
| 10   | 7          | 11, F1         | 2    |
| 11   | 10         | F1             | 2    |
| 12   | 8          | F1             | 2    |
| 13   | 5, 6       | F3             | 3    |
| 14   | —          | F3             | 3    |
| 15   | 4          | F1             | 3    |
| 16   | —          | F1             | 3    |
| 17   | —          | F1             | 3    |
| 18   | —          | F3             | 3    |
| 19   | 1, 5       | 23             | 4    |
| 20   | 1, 7       | 23             | 4    |
| 21   | 8          | 23             | 4    |
| 22   | 5, 6       | 23             | 4    |
| 23   | 19-22      | F1-F4          | 4    |

### Agent Dispatch Summary

- **Wave 1**: 7 tasks — T1,T2,T3,T4 → `quick`, T5,T6 → `deep`, T7 → `unspecified-high`
- **Wave 2**: 5 tasks — T8 → `deep`, T9 → `quick`, T10 → `unspecified-high`, T11 → `quick`, T12 → `unspecified-high`
- **Wave 3**: 6 tasks — T13 → `visual-engineering`, T14 → `quick`, T15,T16,T17 → `writing`, T18 → `visual-engineering`
- **Wave 4**: 5 tasks — T19,T20,T21,T22 → `deep`, T23 → `quick`
- **FINAL**: 4 tasks — F1 → `oracle`, F2 → `unspecified-high`, F3 → `unspecified-high`, F4 → `deep`

---

## TODOs

- [x] 1. Fix project ownership bypass on project detail page 🔴

  **What to do**:
  - Add `getCurrentUser()` call at the top of `apps/studio/src/app/projects/[id]/page.tsx`
  - Add `verifyProjectOwnership(id, user.id)` check before rendering
  - If ownership fails, return appropriate error response (not a redirect that leaks info)
  - Follow the exact pattern used in all API route handlers (requireAuth + verifyProjectOwnership)

  **Must NOT do**: Change any API route handler logic (those are correct)

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 2, 3, 4, 5, 6, 7)
  - **Blocks**: Tasks 19, 20
  - **Blocked By**: None

  **References**:
  - `apps/studio/src/app/projects/[id]/page.tsx` — THE file to fix (currently has no auth check)
  - `apps/studio/src/lib/auth/get-current-user.ts` — Pattern for getting current user in server components
  - `apps/studio/src/lib/auth/require-auth.ts` — Pattern for API route auth (adapt for server component)
  - `apps/studio/src/lib/data/project-queries.ts:verifyProjectOwnership()` — Ownership verification function
  - `apps/studio/src/app/api/projects/[id]/intake/route.ts` — Example of correct requireAuth + verifyProjectOwnership pattern

  **Acceptance Criteria**:
  - [ ] `apps/studio/src/app/projects/[id]/page.tsx` imports getCurrentUser and verifyProjectOwnership
  - [ ] Unauthenticated users are redirected to /login
  - [ ] Authenticated users without ownership get 403/not-found, not project data
  - [ ] `pnpm test --filter @raino/studio` passes
  - [ ] `pnpm build --filter @raino/studio` succeeds

  **QA Scenarios**:

  ```
  Scenario: Authenticated owner can view their project
    Tool: Bash (curl)
    Preconditions: User signed in, project exists for their org
    Steps:
      1. curl -s -o /dev/null -w "%{http_code}" https://raino-studio.vercel.app/projects/{owned-project-id} -H "Cookie: {session}"
      2. Assert HTTP 200
    Expected Result: Page renders with project data
    Evidence: .sisyphus/evidence/task-1-owner-access.txt

  Scenario: Unauthenticated user cannot view any project
    Tool: Bash (curl)
    Preconditions: No session cookie
    Steps:
      1. curl -s -o /dev/null -w "%{http_code}" https://raino-studio.vercel.app/projects/{any-project-id}
      2. Assert HTTP 302 redirect to /login
    Expected Result: Redirected to login, no project data leaked
    Evidence: .sisyphus/evidence/task-1-unauth-blocked.txt
  ```

  **Commit**: YES (commit 1)
  - Message: `fix(auth): add ownership check to project detail page`
  - Files: `apps/studio/src/app/projects/[id]/page.tsx`
  - Pre-commit: `pnpm test --filter @raino/studio`

- [x] 2. Fix auth callback provisioning error propagation

  **What to do**:
  - In `apps/studio/src/app/auth/callback/route.ts`, change the catch block on provisioning
  - Instead of swallowing errors silently, redirect to `/login?error=provisioning_failed`
  - Add a check in the login page to display this error message
  - Ensure user understands they need to try again or contact support

  **Must NOT do**: Break the happy path (successful provisioning still redirects to /)

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1
  - **Blocks**: F1
  - **Blocked By**: None

  **References**:
  - `apps/studio/src/app/auth/callback/route.ts` lines 68-70 — The catch block that swallows errors
  - `apps/studio/src/app/login/page.tsx` — Add error message display for ?error= param

  **Acceptance Criteria**:
  - [ ] Provisioning failure redirects to `/login?error=provisioning_failed`
  - [ ] Login page shows error message when error param present
  - [ ] Successful provisioning still redirects to `/`
  - [ ] `pnpm build --filter @raino/studio` succeeds

  **QA Scenarios**:

  ```
  Scenario: Successful auth still redirects to dashboard
    Tool: Bash (curl)
    Steps:
      1. curl -s -o /dev/null -w "%{http_code}" "https://raino-studio.vercel.app/auth/callback?code={valid-code}"
      2. Assert redirect to / (302)
    Evidence: .sisyphus/evidence/task-2-success-redirect.txt

  Scenario: Failed provisioning shows error
    Tool: Bash (curl)
    Steps:
      1. Simulate provisioning failure (DB unreachable)
      2. Assert redirect to /login?error=provisioning_failed
    Evidence: .sisyphus/evidence/task-2-provisioning-error.txt
  ```

  **Commit**: YES (commit 2)
  - Message: `fix(auth): propagate provisioning errors in auth callback`
  - Files: `apps/studio/src/app/auth/callback/route.ts`, `apps/studio/src/app/login/page.tsx`

- [x] 3. Generate Prisma migrations for reproducible deployment

  **What to do**:
  - Run `npx prisma migrate dev --name initial --create-only` in `packages/db/`
  - This generates SQL migration from schema.prisma without applying it
  - Verify the generated SQL includes all models (User, Organization, Project, Spec, Architecture, BOM, BOMRow, Quote, IntgestionManifest, DesignArtifact, DesignJob, HandoffRequest, AuditEntry, IntakeMessage)
  - Add a `packages/db/supabase/migrations/` README explaining migration order
  - Add Supabase RLS policy SQL migrations for all tenant-scoped tables
  - Create `packages/db/scripts/migrate.sh` that runs both Prisma and Supabase migrations in order

  **Must NOT do**: Run `prisma migrate reset` or `prisma db push` against production

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1
  - **Blocks**: Tasks 8, 9, 12
  - **Blocked By**: None

  **References**:
  - `packages/db/prisma/schema.prisma` — Source schema (all 13 models)
  - `packages/db/supabase/migrations/00003_vector_and_rag.sql` — Existing RAG migration pattern
  - `packages/db/AGENTS.md` — Documents the migration expectation
  - `.env.example` — DATABASE_URL format for Supabase

  **Acceptance Criteria**:
  - [ ] `packages/db/prisma/migrations/` directory exists with initial migration SQL
  - [ ] Migration covers all 13 Prisma models
  - [ ] `packages/db/supabase/migrations/` has RLS policy SQL files
  - [ ] README explains how to apply migrations on fresh Supabase instance
  - [ ] `npx prisma validate` succeeds

  **QA Scenarios**:

  ```
  Scenario: Migration validates successfully
    Tool: Bash
    Steps:
      1. cd packages/db && npx prisma validate
      2. Assert "The schema is valid"
    Evidence: .sisyphus/evidence/task-3-prisma-validate.txt

  Scenario: Migration SQL covers all models
    Tool: Bash
    Steps:
      1. grep -c "CREATE TABLE" packages/db/prisma/migrations/*/migration.sql
      2. Assert count >= 13 (one per model)
    Evidence: .sisyphus/evidence/task-3-migration-count.txt
  ```

  **Commit**: YES (commit 3)
  - Message: `feat(db): generate initial Prisma migrations and RLS policies`
  - Files: `packages/db/prisma/migrations/`, `packages/db/supabase/migrations/`, `packages/db/scripts/`

- [x] 4. Clean up dead env vars and stale docs references

  **What to do**:
  - Remove `SUPABASE_DB_URL` from `.env.example` (not used by any code)
  - Remove `SUPABASE_DB_URL` reference from `packages/db/AGENTS.md`
  - Document that `DIGIKEY_REDIRECT_URI` is unused (client_credentials doesn't need it)
  - Add comment in `.env.example` clarifying which vars are actually read by code
  - Verify `.env.example` matches actual env vars read by source code

  **Must NOT do**: Remove any env var that IS actually used

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1
  - **Blocks**: Task 15
  - **Blocked By**: None

  **References**:
  - `.env.example` — All 20 env var placeholders
  - `packages/db/AGENTS.md` — References SUPABASE_DB_URL (dead)
  - `packages/supplier-clients/src/factory.ts:20` — DIGIKEY_REDIRECT_URI passed but unused

  **Acceptance Criteria**:
  - [ ] `SUPABASE_DB_URL` removed from `.env.example`
  - [ ] `SUPABASE_DB_URL` reference removed from `packages/db/AGENTS.md`
  - [ ] `DIGIKEY_REDIRECT_URI` has comment explaining it's unused for client_credentials
  - [ ] All env vars in `.env.example` are actually read by source code

  **QA Scenarios**:

  ```
  Scenario: No dead env vars in .env.example
    Tool: Bash (grep)
    Steps:
      1. For each env var in .env.example, grep source code for usage
      2. Assert every var is referenced by at least one .ts file
    Evidence: .sisyphus/evidence/task-4-env-var-audit.txt
  ```

  **Commit**: YES (commit 4)
  - Message: `chore: remove dead SUPABASE_DB_URL, document unused vars`
  - Files: `.env.example`, `packages/db/AGENTS.md`

- [x] 5. Wire design job dispatch mechanism

  **What to do**:
  - Create `apps/studio/src/lib/workers/dispatch.ts` with a function `triggerDesignJob(projectId: string, jobType: string)`
  - This function calls `pollAndExecuteWithPrisma()` from `services/design-worker/src/queue/worker.ts` inline (import and execute within the API route's Next.js server process)
  - Alternative approach: Make the POST `/api/projects/[id]/design` route handler directly invoke the design worker's `executeJob()` function after creating the DesignJob row
  - Add a `/api/projects/[id]/design/status` GET route for polling job progress
  - The design worker functions (generateKiCadProject, runValidation, runExport) are pure functions that can be called directly from the Next.js server process
  - Update the design route response to include job progress instead of "Worker dispatch requires manual setup"

  **Architecture Decision**: Design/quote/audit workers are LIBRARIES not SERVICES. They export functions. The "dispatch" is simply calling these functions from API route handlers. No separate process, no cron, no external trigger needed. This is the simplest correct approach.

  **Must NOT do**: Create a separate worker daemon, set up cron jobs, or add Supabase pg_notify

  **Recommended Agent Profile**:
  - **Category**: `deep`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1
  - **Blocks**: Tasks 13, 19, 22
  - **Blocked By**: None

  **References**:
  - `services/design-worker/src/queue/worker.ts` — `pollAndExecuteWithPrisma()` and `executeJob()` functions
  - `services/design-worker/src/generator/project.ts` — `generateKiCadProject()` function
  - `services/design-worker/src/exporter/engine.ts` — `runExport()` function
  - `services/design-worker/src/validator/engine.ts` — `runValidation()` function
  - `apps/studio/src/app/api/projects/[id]/design/route.ts` — Current route (needs updating)
  - `packages/db/prisma/schema.prisma:DesignJob` — Job model with status tracking

  **Acceptance Criteria**:
  - [ ] POST `/api/projects/[id]/design` actually executes design generation
  - [ ] DesignJob row transitions through pending → running → completed/failed
  - [ ] GET `/api/projects/[id]/design/status` returns current job state
  - [ ] KiCad project files are generated (even if placeholder when KICAD_CLI_PATH not set)
  - [ ] `pnpm build --filter @raino/studio` succeeds

  **QA Scenarios**:

  ```
  Scenario: Design job executes end-to-end
    Tool: Bash (curl)
    Preconditions: Authenticated user, project with BOM, KICAD_CLI_PATH not set (degraded)
    Steps:
      1. curl -X POST https://raino-studio.vercel.app/api/projects/{id}/design -H "Cookie: {session}"
      2. Assert response contains job status "completed" (not "pending forever")
      3. Assert response contains isPlaceholder: true (honest degraded)
    Expected Result: Job executes, completes, honestly reports placeholder status
    Evidence: .sisyphus/evidence/task-5-design-dispatch.json

  Scenario: Design job status polling
    Tool: Bash (curl)
    Steps:
      1. curl https://raino-studio.vercel.app/api/projects/{id}/design/status -H "Cookie: {session}"
      2. Assert JSON with status, progress, result fields
    Evidence: .sisyphus/evidence/task-5-design-status.json
  ```

  **Commit**: YES (commit 5)
  - Message: `feat(workers): wire design job dispatch via direct function invocation`
  - Files: `apps/studio/src/app/api/projects/[id]/design/route.ts`, `apps/studio/src/app/api/projects/[id]/design/status/route.ts`

- [x] 6. Wire artifact persistence to Supabase Storage

  **What to do**:
  - In the design job completion path (from Task 5), call `uploadArtifactsToStorage()` from `services/design-worker/src/artifacts/manifest.ts`
  - Create a Supabase Storage bucket called `design-artifacts` (or use existing)
  - After KiCad project generation, upload all artifacts to Supabase Storage
  - Update `DesignArtifact` rows with actual `storageBucket` and `storageKey` values
  - Update the downloads API route to serve from Supabase Storage instead of /tmp/
  - Update the preview API routes to read from Supabase Storage

  **Must NOT do**: Leave artifacts only in /tmp/ (ephemeral, lost on restart)

  **Recommended Agent Profile**:
  - **Category**: `deep`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1
  - **Blocks**: Tasks 13, 22
  - **Blocked By**: None (but logically pairs with Task 5)

  **References**:
  - `services/design-worker/src/artifacts/manifest.ts:128-163` — `uploadArtifactsToStorage()` function (exists, never called)
  - `services/design-worker/src/artifacts/manifest.ts:1-50` — `generateArtifactManifest()` function
  - `apps/studio/src/app/api/projects/[id]/downloads/route.ts` — Current honest "not persisted" response
  - `packages/db/prisma/schema.prisma:DesignArtifact` — Model with storageBucket, storageKey fields
  - Supabase Storage docs: `https://supabase.com/docs/guides/storage`

  **Acceptance Criteria**:
  - [ ] `uploadArtifactsToStorage()` is called after job completion
  - [ ] DesignArtifact rows have populated storageBucket and storageKey
  - [ ] Downloads API returns actual file URLs (or signed URLs) from Supabase Storage
  - [ ] In degraded mode (no Supabase Storage), downloads honestly report unavailability

  **QA Scenarios**:

  ```
  Scenario: Artifacts persisted to Supabase Storage
    Tool: Bash (curl + prisma query)
    Steps:
      1. Trigger design generation for a project
      2. Query design_artifacts table for that project
      3. Assert storageBucket and storageKey are non-null
    Evidence: .sisyphus/evidence/task-6-artifact-persistence.json

  Scenario: Downloads serve real files
    Tool: Bash (curl)
    Steps:
      1. curl https://raino-studio.vercel.app/api/projects/{id}/downloads -H "Cookie: {session}"
      2. Assert response contains downloads[] with actual file URLs (not empty)
    Evidence: .sisyphus/evidence/task-6-downloads-real.json
  ```

  **Commit**: YES (commit 6)
  - Message: `feat(workers): persist artifacts to Supabase Storage on job completion`
  - Files: `services/design-worker/src/queue/`, `services/design-worker/src/artifacts/`, `apps/studio/src/app/api/projects/[id]/downloads/route.ts`

- [x] 7. Fix null→0 price bug and best-price comparison

  **What to do**:
  - In `packages/supplier-clients/src/common/helpers.ts`, change `resolvePrice()` to return `null` instead of `0` when no price available
  - In `apps/studio/src/lib/quotes/supplier-comparison.ts`, update `selectBestQuote()` to skip quotes where price is null or <= 0
  - In `apps/studio/src/app/api/projects/[id]/quote/route.ts`, add a minimum row count check before generating quotes (at least 1 real BOM row with valid price)
  - Add tests for the null-price and $0-price scenarios

  **Must NOT do**: Allow $0 to ever win a best-price comparison

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1
  - **Blocks**: Tasks 10, 20
  - **Blocked By**: None

  **References**:
  - `packages/supplier-clients/src/common/helpers.ts:16` — `resolvePrice()` null→0 bug
  - `apps/studio/src/lib/quotes/supplier-comparison.ts:72-91` — `selectBestQuote()` (no null filter)
  - `apps/studio/src/app/api/projects/[id]/quote/route.ts:103` — `Number(r.unitPrice)` null→0
  - `services/quote-worker/src/__tests__/calculator.test.ts:301-306` — Empty BOM test

  **Acceptance Criteria**:
  - [ ] `resolvePrice()` returns `null` when no price available (not 0)
  - [ ] `selectBestQuote()` skips null and <= 0 prices
  - [ ] Quote generation requires at least 1 BOM row with valid price
  - [ ] Empty BOM quote returns 422 or clear "insufficient data" response
  - [ ] `pnpm test --filter @raino/supplier-clients` passes
  - [ ] `pnpm test --filter @raino/studio` passes

  **QA Scenarios**:

  ```
  Scenario: $0 price does not win comparison
    Tool: Bash (node)
    Steps:
      1. Import selectBestQuote from supplier-comparison
      2. Call with [DigiKey: $2.50, Mouser: $0 (null), JLCPCB: null]
      3. Assert best price is $2.50 from DigiKey
    Expected Result: DigiKey wins, $0 and null are skipped
    Evidence: .sisyphus/evidence/task-7-price-comparison.txt

  Scenario: Quote with all-null prices fails gracefully
    Tool: Bash (curl)
    Steps:
      1. Create project with BOM that has no prices
      2. POST /api/projects/{id}/quote
      3. Assert 422 or "insufficient data" response
    Evidence: .sisyphus/evidence/task-7-no-prices-quote.json
  ```

  **Commit**: YES (commit 7)
  - Message: `fix(quote): prevent $0 from winning best-price comparison`
  - Files: `packages/supplier-clients/src/common/helpers.ts`, `apps/studio/src/lib/quotes/supplier-comparison.ts`, `apps/studio/src/app/api/projects/[id]/quote/route.ts`

- [x] 8. Add OpenAI embedding provider for RAG

  **What to do**:
  - Create `packages/rag/src/embeddings/openai-generator.ts` implementing `EmbeddingGenerator` interface
  - Uses `openai` npm package (already a dependency) to call `text-embedding-3-small` (1536 dims, $0.02/1M tokens)
  - Add `OPENAI_API_KEY` to `.env.example`
  - Update `packages/rag/src/embeddings/` factory or index to select provider based on `EMBEDDING_PROVIDER` env var
  - Update `services/ingest-worker/src/pipeline/embedding.ts` to use the factory instead of hardcoded MockEmbeddingGenerator
  - Update `services/ingest-worker/src/pipeline/vector-store.ts:querySimilar()` to use the factory (currently hardcodes MockEmbeddingGenerator)

  **Must NOT do**: Remove MockEmbeddingGenerator (needed for degraded mode)

  **Recommended Agent Profile**:
  - **Category**: `deep`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: NO (depends on Task 3 for migration context)
  - **Parallel Group**: Wave 2
  - **Blocks**: Tasks 9, 12, 21
  - **Blocked By**: Task 3

  **References**:
  - `packages/rag/src/embeddings/contracts.ts` — `EmbeddingGenerator` interface
  - `packages/rag/src/embeddings/mock-generator.ts` — Reference implementation
  - `services/ingest-worker/src/pipeline/embedding.ts` — Currently hardcoded to MockEmbeddingGenerator
  - `services/ingest-worker/src/pipeline/vector-store.ts:78` — `querySimilar()` hardcodes MockEmbeddingGenerator
  - Official docs: https://platform.openai.com/docs/guides/embeddings

  **Acceptance Criteria**:
  - [ ] `packages/rag/src/embeddings/openai-generator.ts` exists and implements EmbeddingGenerator
  - [ ] Factory selects OpenAI when `EMBEDDING_PROVIDER=openai` and `OPENAI_API_KEY` set
  - [ ] Factory falls back to MockEmbeddingGenerator when env vars absent
  - [ ] Ingest pipeline uses factory instead of hardcoded mock
  - [ ] `pnpm test --filter @raino/rag` passes

  **QA Scenarios**:

  ```
  Scenario: OpenAI generator produces 1536-dim vectors
    Tool: Bash (node)
    Steps:
      1. Import OpenAIEmbeddingGenerator
      2. Call generate("STM32F407 datasheet section")
      3. Assert vector.length === 1536
      4. Assert all values are numbers (not NaN)
    Evidence: .sisyphus/evidence/task-8-openai-embedding.txt

  Scenario: Factory falls back to mock without API key
    Tool: Bash (node)
    Steps:
      1. Call factory without OPENAI_API_KEY
      2. Assert returns MockEmbeddingGenerator instance
    Evidence: .sisyphus/evidence/task-8-factory-fallback.txt
  ```

  **Commit**: YES (commit 8)
  - Message: `feat(rag): add OpenAI embedding provider`
  - Files: `packages/rag/src/embeddings/openai-generator.ts`, `.env.example`, `services/ingest-worker/src/pipeline/embedding.ts`, `services/ingest-worker/src/pipeline/vector-store.ts`

- [x] 9. Migrate pgvector dimension from 384 to 1536

  **What to do**:
  - Create a new Supabase migration: `packages/db/supabase/migrations/00004_pgvector_1536.sql`
  - SQL: `ALTER TABLE embeddings ALTER COLUMN vector TYPE extensions.vector(1536);`
  - Recreate the HNSW index for the new dimension
  - Update the `match_documents` RPC function signature to accept `extensions.vector(1536)`
  - Update `packages/rag/src/storage/supabase-vector-store.ts` to use 1536 dimensions
  - Document the migration in a README

  **Must NOT do**: Run this against production without backing up (no real data exists yet, so this is safe)

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 2
  - **Blocks**: Task 21
  - **Blocked By**: Tasks 3, 8

  **References**:
  - `packages/db/supabase/migrations/00003_vector_and_rag.sql` — Current 384-dim schema
  - `packages/rag/src/storage/supabase-vector-store.ts` — Store implementation
  - Supabase docs: https://supabase.com/docs/guides/ai/vector-columns

  **Acceptance Criteria**:
  - [ ] New migration SQL file exists with dimension change
  - [ ] `match_documents` RPC accepts 1536-dim vectors
  - [ ] SupabaseVectorStore uses 1536 dimensions
  - [ ] `pnpm test --filter @raino/rag` passes

  **QA Scenarios**:

  ```
  Scenario: Migration SQL is valid
    Tool: Bash (grep)
    Steps:
      1. Check 00004_pgvector_1536.sql contains "vector(1536)"
      2. Check match_documents uses vector(1536)
    Evidence: .sisyphus/evidence/task-9-migration-valid.txt
  ```

  **Commit**: YES (commit 9)
  - Message: `feat(db): migrate pgvector dimension 384 to 1536`
  - Files: `packages/db/supabase/migrations/00004_pgvector_1536.sql`, `packages/rag/src/storage/supabase-vector-store.ts`

- [x] 10. Add Zod validation on supplier API responses

  **What to do**:
  - Create `packages/supplier-clients/src/common/response-schemas.ts` with Zod schemas for each supplier's API response
  - `DigiKeyProductSchema`, `MouserPartSchema`, `JLCPCBComponentSchema`
  - In each real adapter's mapping function, parse the raw response through the Zod schema before accessing fields
  - Use `safeParse` — on failure, log the validation error and skip the malformed item (don't crash)
  - This prevents malformed supplier data from becoming null→0 in the price pipeline

  **Must NOT do**: Reject valid responses (schemas should be lenient — all fields optional with defaults)

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 2
  - **Blocks**: Task 11
  - **Blocked By**: Task 7

  **References**:
  - `packages/supplier-clients/src/digikey/real-adapter.ts:232-255` — `mapProduct()` (no validation)
  - `packages/supplier-clients/src/mouser/real-adapter.ts:193-220` — `mapPart()` (no validation)
  - `packages/supplier-clients/src/jlcpcb/real-adapter.ts:270-295` — `mapComponent()` (no validation)
  - `packages/core/src/schemas/` — Reference for existing Zod schema patterns

  **Acceptance Criteria**:
  - [ ] Response schema file exists with schemas for all 3 suppliers
  - [ ] Each real adapter validates before mapping
  - [ ] Malformed responses are logged and skipped (not crashed)
  - [ ] `pnpm test --filter @raino/supplier-clients` passes

  **QA Scenarios**:

  ```
  Scenario: Malformed supplier response handled gracefully
    Tool: Bash (node)
    Steps:
      1. Feed malformed JSON (unitPrice: "free") to DigiKeyProductSchema.safeParse
      2. Assert success: false or unitPrice defaults to null
    Evidence: .sisyphus/evidence/task-10-malformed-response.txt
  ```

  **Commit**: YES (commit 10)
  - Message: `feat(suppliers): add Zod validation on API responses`
  - Files: `packages/supplier-clients/src/common/response-schemas.ts`, real adapter files

- [x] 11. Add structured error logging to supplier adapters

  **What to do**:
  - In `apps/studio/src/lib/quotes/supplier-comparison.ts:59-61`, replace silent null return with console.error + structured error info
  - Log which supplier failed, what query was attempted, what error occurred
  - Distinguish "part not found" (normal) from "API down" (warning) from "timeout" (warning)
  - Return the error info alongside null so the caller knows why

  **Must NOT do**: Throw errors that crash the comparison (still gracefully degrade)

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 2
  - **Blocks**: F1
  - **Blocked By**: Task 10

  **References**:
  - `apps/studio/src/lib/quotes/supplier-comparison.ts:59-61` — Silent catch block

  **Acceptance Criteria**:
  - [ ] Every supplier error is logged with supplier name, query, error type
  - [ ] Comparison still gracefully handles errors (returns best available data)
  - [ ] `pnpm build --filter @raino/studio` succeeds

  **Commit**: YES (commit 11)
  - Message: `feat(suppliers): add structured error logging to adapters`
  - Files: `apps/studio/src/lib/quotes/supplier-comparison.ts`

- [x] 12. Wire ingest-worker to studio API route

  **What to do**:
  - Create `apps/studio/src/app/api/projects/[id]/ingest/trigger/route.ts`
  - POST endpoint that triggers the ingest-worker pipeline for a specific project
  - Imports and calls the ingestion pipeline stages directly (same pattern as Task 5 — workers are libraries)
  - Returns streaming or polling status
  - Updates the existing `/ingest/run` route to actually invoke the pipeline

  **Must NOT do**: Create a separate ingest-worker service/process

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 2
  - **Blocks**: F1
  - **Blocked By**: Task 8

  **References**:
  - `services/ingest-worker/src/cli/bootstrap.ts` — Current CLI entry point
  - `services/ingest-worker/src/pipeline/` — All 8 pipeline stages
  - `apps/studio/src/app/api/projects/[id]/ingest/run/route.ts` — Current route
  - `apps/studio/src/app/api/projects/[id]/ingest/status/route.ts` — Status route

  **Acceptance Criteria**:
  - [ ] POST `/api/projects/{id}/ingest/trigger` invokes the pipeline
  - [ ] Ingestion progress is queryable via status endpoint
  - [ ] Pipeline uses real embedding provider (Task 8) when configured
  - [ ] `pnpm build --filter @raino/studio` succeeds

  **Commit**: YES (commit 12)
  - Message: `feat(ingest): add studio API trigger for ingestion pipeline`
  - Files: `apps/studio/src/app/api/projects/[id]/ingest/`

- [x] 13. Add degraded-mode banners to studio UI

  **What to do**:
  - Create a shared `<DegradedModeBanner>` component that checks system status
  - Show on pages where subsystem is in degraded mode:
    - Previews page: "KiCad generation is in fixture mode. No real ERC/DRC validation."
    - Quotes page: Show supplier mode (live/mock) per supplier
    - BOM page: Show if any prices are estimates
  - The banner should be dismissible but visible by default
  - Use the existing design system (NeonBorder, amber/red colors for warnings)

  **Must NOT do**: Block any functionality with banners — informational only

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: [`frontend-ui-ux`]

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 3
  - **Blocks**: F3
  - **Blocked By**: Tasks 5, 6

  **References**:
  - `packages/ui/src/components/` — Existing components (NeonBorder, Badge, StatusDot)
  - `packages/ui/src/styles/theme.ts` — Amber (#ffaa00) and red (#ff3366) for warnings
  - `packages/supplier-clients/src/factory.ts:getAdapterStatus()` — Supplier live/mock status
  - `apps/studio/src/app/projects/[id]/previews/page.tsx` — Preview page (needs banner)
  - `apps/studio/src/app/projects/[id]/quote/page.tsx` — Quote page (needs supplier status)

  **Acceptance Criteria**:
  - [ ] DegradedModeBanner component exists
  - [ ] Previews page shows fixture-mode banner when KICAD_CLI_PATH not set
  - [ ] Quote page shows per-supplier live/mock status
  - [ ] BOM page shows estimate indicators
  - [ ] `pnpm build --filter @raino/studio` succeeds

  **Commit**: YES (commit 13)
  - Message: `feat(ui): add degraded-mode banners to studio pages`
  - Files: `apps/studio/src/components/`, `apps/studio/src/app/projects/[id]/previews/`, `apps/studio/src/app/projects/[id]/quote/`

- [x] 14. Fix localhost URL fallbacks in marketing site

  **What to do**:
  - In all 4 files with `process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3001'`, change the fallback
  - Instead of localhost, use the production URL `https://raino-studio.vercel.app`
  - Or better: remove the fallback entirely and fail fast if env var is missing
  - Same for `NEXT_PUBLIC_SITE_URL` references
  - Verify both env vars are set in Vercel dashboard for the marketing site

  **Must NOT do**: Hardcode production URLs that break local development (use env vars with safe fallbacks)

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3
  - **Blocks**: F3
  - **Blocked By**: None

  **References**:
  - `apps/site/src/components/Navbar.tsx:15` — localhost fallback
  - `apps/site/src/app/docs/page.tsx:113` — localhost fallback
  - `apps/site/src/app/workflow/page.tsx:141,320` — localhost fallbacks
  - `apps/site/src/app/page.tsx:72,285` — localhost fallbacks

  **Acceptance Criteria**:
  - [ ] No `localhost:3001` fallbacks remain in marketing site code
  - [ ] Production deployment uses correct cloud URLs
  - [ ] Local development still works (env vars or sensible fallback)
  - [ ] `pnpm build --filter @raino/site` succeeds

  **Commit**: YES (commit 14)
  - Message: `fix(site): remove localhost URL fallbacks, use env-driven URLs`
  - Files: `apps/site/src/components/Navbar.tsx`, `apps/site/src/app/docs/page.tsx`, `apps/site/src/app/workflow/page.tsx`, `apps/site/src/app/page.tsx`

- [x] 15. Update BLOCKER-REPORT.md

  **What to do**:
  - Rewrite `BLOCKER-REPORT.md` to reflect the CURRENT state after all fixes
  - Remove stale items ("No authentication configured" — auth exists now)
  - Add new items: current limitations (KiCad CLI not on server, JLCPCB MD5 characteristic, language switcher external links)
  - Mark the build status and test counts accurately

  **Must NOT do**: Overstate capabilities or understate limitations

  **Recommended Agent Profile**:
  - **Category**: `writing`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3
  - **Blocks**: F1
  - **Blocked By**: Task 4

  **References**:
  - `BLOCKER-REPORT.md` — Current (stale) content
  - Audit dossier at `.sisyphus/drafts/audit-dossier.md` — Use as source of truth

  **Acceptance Criteria**:
  - [ ] No stale claims (auth exists, tests exist, deployment exists)
  - [ ] Current limitations honestly listed
  - [ ] Test count matches actual (`pnpm test` output)

  **Commit**: YES (commit 15)
  - Message: `docs: update BLOCKER-REPORT.md to reflect current state`
  - Files: `BLOCKER-REPORT.md`

- [x] 16. Update architecture and deployment docs

  **What to do**:
  - Review and update `docs/architecture/README.md` to match current codebase
  - Review and update `docs/deployment/README.md` with correct Vercel setup steps
  - Add Supabase migration instructions (Prisma migrate + raw SQL migrations)
  - Document the worker-as-library pattern (not separate services)
  - Verify all code examples in docs compile or match actual code

  **Must NOT do**: Generate filler documentation — every line must match reality

  **Recommended Agent Profile**:
  - **Category**: `writing`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3
  - **Blocks**: F1
  - **Blocked By**: None

  **References**:
  - `docs/architecture/README.md`, `docs/deployment/README.md`, `docs/api/README.md`, `docs/ingestion/README.md`, `docs/security/README.md`, `docs/ux/README.md`
  - `packages/db/AGENTS.md` — Accurate description of current setup

  **Acceptance Criteria**:
  - [ ] All docs match current codebase state
  - [ ] Deployment docs include correct Vercel + Supabase setup
  - [ ] Architecture docs show worker-as-library pattern

  **Commit**: YES (commit 16)
  - Message: `docs: update architecture and deployment docs`
  - Files: `docs/**/*.md`

- [x] 17. Update README.md and translations

  **What to do**:
  - Review `README.md` against current implementation
  - Fix any overclaims (e.g., verify 12-stage workflow matches actual stages)
  - Add "Known Limitations" section listing: KiCad CLI requires local install, language switching via GitHub READMEs, JLCPCB uses MD5 signing
  - Update test count in README if changed
  - Propagate key changes to `README.zh-CN.md`, `README.ja.md`, `README.ko.md`

  **Must NOT do**: Overstate capabilities

  **Recommended Agent Profile**:
  - **Category**: `writing`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3
  - **Blocks**: F1
  - **Blocked By**: None

  **References**:
  - `README.md` — Current English README
  - `.sisyphus/drafts/audit-dossier.md` — Source of truth for current state

  **Acceptance Criteria**:
  - [ ] README accurately describes current capabilities
  - [ ] Known Limitations section present and honest
  - [ ] Translations reflect key changes

  **Commit**: YES (commit 17)
  - Message: `docs: update README.md with known limitations`
  - Files: `README.md`, `README.zh-CN.md`, `README.ja.md`, `README.ko.md`

- [x] 18. Audit and update marketing site content

  **What to do**:
  - Review all marketing site pages for accuracy
  - Ensure feature claims match what's actually implemented
  - Verify architecture diagram matches current codebase
  - Update "How It Works" steps if they differ from actual workflow
  - Ensure CTA links point to correct cloud URLs

  **Must NOT do**: Add marketing claims that don't match implementation

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: [`frontend-ui-ux`]

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3
  - **Blocks**: F3
  - **Blocked By**: None

  **References**:
  - `apps/site/src/app/page.tsx` — Landing page
  - `apps/site/src/app/features/page.tsx` — Features page
  - `apps/site/src/app/architecture/page.tsx` — Architecture page
  - `apps/site/src/app/workflow/page.tsx` — Workflow page

  **Acceptance Criteria**:
  - [ ] All feature claims match implemented features
  - [ ] Architecture diagram matches actual codebase
  - [ ] No broken links or incorrect URLs
  - [ ] `pnpm build --filter @raino/site` succeeds

  **Commit**: YES (commit 18)
  - Message: `docs: audit and update marketing site content for accuracy`
  - Files: `apps/site/src/app/**/*.tsx`

- [x] 19. Add studio E2E tests (Playwright)

  **What to do**:
  - Create `tests/e2e/studio/` directory with Playwright tests for:
    - Auth flow: magic link sign-in → dashboard visible
    - Project creation: fill form → project appears in list
    - Project detail: navigate to project → overview renders
    - Intake: submit text → response appears
  - Update `playwright.config.ts` to include studio (port 3001)
  - These test the critical user path through the product

  **Must NOT do**: Test mock/fixture behavior — test real user flows

  **Recommended Agent Profile**:
  - **Category**: `deep`
  - **Skills**: [`playwright`]

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 4
  - **Blocks**: Task 23
  - **Blocked By**: Tasks 1, 5

  **References**:
  - `tests/e2e/site.spec.ts` — Existing site E2E test pattern
  - `tests/e2e/site-navigation.spec.ts` — Navigation test pattern
  - `playwright.config.ts` — Current config (site only)
  - `apps/studio/src/app/` — All studio pages to test

  **Acceptance Criteria**:
  - [ ] Playwright config includes studio project
  - [ ] At least 4 studio E2E test files exist
  - [ ] `pnpm test:e2e` runs both site and studio tests
  - [ ] All E2E tests pass

  **Commit**: YES (commit 19)
  - Message: `test(e2e): add studio Playwright tests`
  - Files: `tests/e2e/studio/`, `playwright.config.ts`

- [x] 20. Add API route handler tests

  **What to do**:
  - Create tests for critical API route handlers:
    - `POST /api/projects` — project creation with auth
    - `POST /api/projects/[id]/quote` — quote generation with price validation
    - `POST /api/projects/[id]/bom/generate` — BOM generation
    - `GET /api/projects/[id]` — ownership enforcement
  - Use vitest with mocked Prisma/Supabase clients
  - Test both success and auth-failure cases

  **Must NOT do**: Add tests that require live Supabase connection

  **Recommended Agent Profile**:
  - **Category**: `deep`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 4
  - **Blocks**: Task 23
  - **Blocked By**: Tasks 1, 7

  **References**:
  - `apps/studio/src/app/api/projects/route.ts` — Projects list/create
  - `apps/studio/src/app/api/projects/[id]/quote/route.ts` — Quote generation
  - `apps/studio/src/app/auth/__tests__/callback.test.ts` — Existing auth test pattern
  - `apps/studio/src/lib/data/__tests__/project-queries-ownership.test.ts` — Ownership test pattern

  **Acceptance Criteria**:
  - [ ] At least 4 API route test files created
  - [ ] Each test covers success + auth failure
  - [ ] `pnpm test --filter @raino/studio` passes

  **Commit**: YES (commit 20)
  - Message: `test(api): add API route handler tests`
  - Files: `apps/studio/src/app/api/__tests__/`

- [x] 21. Add RAG retrieval tests with real embeddings

  **What to do**:
  - Create tests that use OpenAIEmbeddingGenerator (or mock it with deterministic test doubles)
  - Test the full retrieval pipeline: chunk → embed → store → query → rank
  - Verify semantic similarity works (not just hash-based matching)
  - Test with real Supabase store (if credentials available) or memory store
  - Test provenance tracking through retrieval

  **Must NOT do**: Use MockEmbeddingGenerator for retrieval quality assertions

  **Recommended Agent Profile**:
  - **Category**: `deep`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 4
  - **Blocks**: Task 23
  - **Blocked By**: Task 8

  **References**:
  - `packages/rag/src/__tests__/retrieval.test.ts` — Existing retrieval tests
  - `packages/rag/src/__tests__/supabase-stores.test.ts` — Existing store tests
  - `packages/rag/src/retrieval/engine.ts` — Retrieval engine
  - `services/ingest-worker/src/__tests__/retrieval-smoke.test.ts` — Smoke test pattern

  **Acceptance Criteria**:
  - [ ] New test file uses real or realistic embedding generation
  - [ ] Tests verify semantic similarity (not just hash matching)
  - [ ] Provenance tracked through retrieval
  - [ ] `pnpm test --filter @raino/rag` passes

  **Commit**: YES (commit 21)
  - Message: `test(rag): add retrieval tests with real embeddings`
  - Files: `packages/rag/src/__tests__/`

- [x] 22. Add design job dispatch integration test

  **What to do**:
  - Create test that exercises the full job lifecycle:
    - POST creates DesignJob row
    - Job transitions pending → running → completed
    - Artifacts created in Supabase Storage (or honestly marked as degraded)
    - DesignArtifact rows populated
  - Test with mock Prisma client (no live DB needed)
  - Test error path: job failure updates status correctly

  **Recommended Agent Profile**:
  - **Category**: `deep`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 4
  - **Blocks**: Task 23
  - **Blocked By**: Tasks 5, 6

  **References**:
  - `services/design-worker/src/__tests__/queue.test.ts` — Existing queue test
  - `services/design-worker/src/__tests__/exporter.test.ts` — Existing export test
  - `services/design-worker/src/queue/worker.ts` — Worker functions to test

  **Acceptance Criteria**:
  - [ ] Full job lifecycle test passes (create → run → complete)
  - [ ] Error path test passes (create → run → fail)
  - [ ] `pnpm test` passes

  **Commit**: YES (commit 22)
  - Message: `test(workers): add dispatch integration test`
  - Files: `services/design-worker/src/__tests__/`

- [x] 23. Final build + typecheck + lint + test verification

  **What to do**:
  - Run full quality gate: `pnpm build && pnpm typecheck && pnpm lint && pnpm test`
  - Fix any issues found
  - Run `pnpm test:e2e` if Playwright browsers installed
  - Verify both apps build individually
  - Record final test count and build status

  **Must NOT do**: Skip failing tests or delete tests to pass

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 4 (final)
  - **Blocks**: F1-F4
  - **Blocked By**: Tasks 19, 20, 21, 22

  **References**:
  - `turbo.json` — Task configuration
  - `package.json` — Scripts

  **Acceptance Criteria**:
  - [ ] `pnpm build` exits 0
  - [ ] `pnpm typecheck` exits 0
  - [ ] `pnpm lint` exits 0
  - [ ] `pnpm test` exits 0 with 280+ tests
  - [ ] No new `as any` or `@ts-ignore` introduced

  **Commit**: YES (commit 23)
  - Message: `chore: final build verification`
  - Pre-commit: `pnpm build && pnpm typecheck && pnpm lint && pnpm test`

---

## Final Verification Wave (MANDATORY — after ALL implementation tasks)

> 4 review agents run in PARALLEL. ALL must APPROVE. Present consolidated results to user and get explicit "okay" before completing.
>
> **Do NOT auto-proceed after verification. Wait for user's explicit approval before marking work complete.**

- [x] F1. **Plan Compliance Audit** — `oracle`
      Read the plan end-to-end. For each "Must Have": verify implementation exists (read file, curl endpoint, run command). For each "Must NOT Have": search codebase for forbidden patterns — reject with file:line if found. Check evidence files exist in .sisyphus/evidence/. Compare deliverables against plan.
      Output: `Must Have [N/N] | Must NOT Have [N/N] | Tasks [N/N] | VERDICT: APPROVE/REJECT`

- [x] F2. **Code Quality Review** — `unspecified-high`
      Run `tsc --noEmit` + linter + `pnpm test`. Review all changed files for: `as any`/`@ts-ignore`, empty catches, console.log in prod, commented-out code, unused imports. Check AI slop: excessive comments, over-abstraction, generic names.
      Output: `Build [PASS/FAIL] | Lint [PASS/FAIL] | Tests [N pass/N fail] | Files [N clean/N issues] | VERDICT`

- [x] F3. **Real Manual QA** — `unspecified-high` (+ `playwright` skill)
      Start from clean state. Execute EVERY QA scenario from EVERY task — follow exact steps, capture evidence. Test cross-task integration. Test edge cases: empty state, invalid input, rapid actions. Save to `.sisyphus/evidence/final-qa/`.
      Output: `Scenarios [N/N pass] | Integration [N/N] | Edge Cases [N tested] | VERDICT`

- [x] F4. **Scope Fidelity Check** — `deep`
      For each task: read "What to do", read actual diff (git log/diff). Verify 1:1 — everything in spec was built, nothing beyond spec was built. Check "Must NOT do" compliance. Detect cross-task contamination. Flag unaccounted changes.
      Output: `Tasks [N/N compliant] | Contamination [CLEAN/N issues] | Unaccounted [CLEAN/N files] | VERDICT`

---

## Commit Strategy

| Commit | Message                                                                  | Files                                                                                                  | Pre-commit                                               |
| ------ | ------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------ | -------------------------------------------------------- |
| 1      | `fix(auth): add ownership check to project detail page`                  | `apps/studio/src/app/projects/[id]/page.tsx`                                                           | `pnpm test --filter @raino/studio`                       |
| 2      | `fix(auth): propagate provisioning errors in auth callback`              | `apps/studio/src/app/auth/callback/route.ts`                                                           | `pnpm test --filter @raino/studio`                       |
| 3      | `feat(db): generate initial Prisma migrations`                           | `packages/db/prisma/migrations/`                                                                       | `pnpm test --filter @raino/db`                           |
| 4      | `chore: remove dead SUPABASE_DB_URL env var`                             | `.env.example`, `packages/db/AGENTS.md`                                                                | —                                                        |
| 5      | `feat(workers): wire design job dispatch via API route`                  | `apps/studio/src/lib/workers/`, `apps/studio/src/app/api/projects/[id]/design/`                        | `pnpm test`                                              |
| 6      | `feat(workers): persist artifacts to Supabase Storage on job completion` | `services/design-worker/src/queue/completion.ts`, `services/design-worker/src/artifacts/`              | `pnpm test`                                              |
| 7      | `fix(quote): prevent $0 from winning best-price comparison`              | `packages/supplier-clients/src/common/helpers.ts`, `apps/studio/src/lib/quotes/supplier-comparison.ts` | `pnpm test --filter @raino/supplier-clients`             |
| 8      | `feat(rag): add OpenAI embedding provider`                               | `packages/rag/src/embeddings/openai-generator.ts`                                                      | `pnpm test --filter @raino/rag`                          |
| 9      | `feat(db): migrate pgvector dimension 384 to 1536`                       | `packages/db/supabase/migrations/`                                                                     | —                                                        |
| 10     | `feat(suppliers): add Zod validation on API responses`                   | `packages/supplier-clients/src/*/real-adapter.ts`                                                      | `pnpm test --filter @raino/supplier-clients`             |
| 11     | `feat(suppliers): add structured error logging to adapters`              | `packages/supplier-clients/src/*/real-adapter.ts`                                                      | `pnpm test`                                              |
| 12     | `feat(ingest): add studio API trigger for ingestion`                     | `apps/studio/src/app/api/projects/[id]/ingest/trigger/route.ts`                                        | `pnpm test`                                              |
| 13     | `feat(ui): add degraded-mode banners to studio pages`                    | `apps/studio/src/components/`                                                                          | `pnpm build --filter @raino/studio`                      |
| 14     | `fix(site): remove localhost URL fallbacks`                              | `apps/site/src/**/*.tsx`                                                                               | `pnpm build --filter @raino/site`                        |
| 15     | `docs: update BLOCKER-REPORT.md`                                         | `BLOCKER-REPORT.md`                                                                                    | —                                                        |
| 16     | `docs: update architecture and deployment docs`                          | `docs/**/*.md`                                                                                         | —                                                        |
| 17     | `docs: update README.md and translations`                                | `README*.md`                                                                                           | —                                                        |
| 18     | `docs: audit and update marketing site content`                          | `apps/site/src/**/*.tsx`                                                                               | `pnpm build --filter @raino/site`                        |
| 19     | `test(e2e): add studio Playwright tests`                                 | `tests/e2e/studio/`                                                                                    | `pnpm test:e2e`                                          |
| 20     | `test(api): add API route handler tests`                                 | `apps/studio/src/app/api/__tests__/`                                                                   | `pnpm test --filter @raino/studio`                       |
| 21     | `test(rag): add retrieval tests with real embeddings`                    | `packages/rag/src/__tests__/`                                                                          | `pnpm test --filter @raino/rag`                          |
| 22     | `test(workers): add dispatch integration test`                           | `services/design-worker/src/__tests__/`                                                                | `pnpm test`                                              |
| 23     | `chore: final build verification`                                        | —                                                                                                      | `pnpm build && pnpm typecheck && pnpm lint && pnpm test` |

---

## Success Criteria

### Verification Commands

```bash
pnpm build              # Expected: Clean build, 0 errors
pnpm typecheck          # Expected: 0 type errors
pnpm lint               # Expected: 0 lint errors
pnpm test               # Expected: 280+ tests pass (252 existing + ~30 new)
pnpm test:e2e           # Expected: Studio + site E2E tests pass
```

### Final Checklist

- [x] All "Must Have" present
- [x] All "Must NOT Have" absent
- [x] All tests pass
- [x] Both Vercel deployments verified
- [x] No CRITICAL or HIGH blockers remain
- [x] Audit dossier matches implementation
- [x] README matches actual capabilities
- [x] BLOCKER-REPORT.md reflects current state
