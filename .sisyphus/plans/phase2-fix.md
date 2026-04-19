# Raino Phase 2: Comprehensive Fix Plan

## TL;DR

> **Quick Summary**: Fix all issues discovered during exhaustive audit of Raino's live sites, GitHub repo, codebase, and external integrations. Bring professionalism to match reference frameworks (oh-my-opencode, OpenHarness, Hermes Agent, OpenClaw).
> 
> **Deliverables**:
> - All site nav/footer/meta/favicon inconsistencies fixed
> - All code bugs fixed (CSS typo, auth inconsistency, env var naming, Kimi model)
> - GitHub repo polished (community files, CI badge, description, topics, corrupted dir removed)
> - README overhauled to match reference frameworks' professionalism
> - Custom error/404 pages added
> - /api/health endpoint added
> - CI pipeline parallelized
> - Supabase storage bucket mismatch fixed (CRITICAL)
> - DigiKey OAuth dead code removed
> - Agent memory system (4-layer L0-L3 stack) inspired by MemPalace/Nanobot/OpenClaw
> - NOTICES.md with legal acknowledgements for all 8 reference frameworks
> - raino-site expanded with 4 new pages (showcase, integrations, changelog, trust)
> - raino-studio enhanced with settings page, integration status, auth fix
> - Resend config cleaned up (remove dead config)
> - Post-fix audit cycle (2 rounds) to verify all fixes
> 
> **Estimated Effort**: Large (25 tasks + 2 audit rounds)
> **Parallel Execution**: YES - 6 waves
> **Critical Path**: Wave 1 → Wave 2 → Wave 3 → Wave 4 → Wave 5 → Wave 6 → Final Verification

---

## Context

### Original Request
User requested exhaustive audit of raino-site.vercel.app, raino-studio.vercel.app, github.com/tudsds/raino, all external integrations, and comparison against reference open-source frameworks (oh-my-opencode, OpenHarness, Hermes Agent, OpenClaw). All discovered issues must be fixed, and the README/site must match the professionalism of these frameworks.

### Audit Summary
**7 parallel agents** audited every dimension:
- raino-site.vercel.app: All 5 pages, links, content, meta tags
- raino-studio.vercel.app: All pages, auth flow, 25 API routes, degraded mode
- GitHub repo: Structure, CI, community files, professionalism scorecard
- Codebase: 28 API routes, 8 packages, 4 services, 692 tests
- External integrations: Supabase, JLCPCB, DigiKey, Mouser, Kimi, OpenAI
- Reference frameworks: README structure, site design, community patterns

**Issues Found**: 23 total (6 HIGH, 9 MEDIUM, 8 LOW)

### Metis Review
**Identified Gaps** (addressed):
- Nav/Footer problem is structural (inline copies per page, not shared via layout) — plan uses layout-based fix
- Kimi model name verified: `kimi-k2.5` IS the correct API model ID (confirmed from platform.moonshot.ai)
- Supabase env var rename must be atomic across 7 source files + .env.example + Vercel env
- Auth inconsistency needs user decision — plan defaults to magic link for both (matching AGENTS.md)
- Favicon/OG image need design — plan includes generating cyberpunk-themed assets
- Mobile nav needs a hamburger menu — plan includes basic implementation

---

## Work Objectives

### Core Objective
Fix every issue found during the comprehensive audit and bring Raino's presentation to the same professional level as oh-my-opencode, OpenHarness, Hermes Agent, and OpenClaw.

### Concrete Deliverables
- Shared Navbar + Footer via root layout in apps/site
- Unique page titles + OG meta tags on all marketing pages
- Cyberpunk favicon + OG image
- Mobile hamburger menu
- CSS typo fix (py-32xl → py-3)
- Auth consistency (both login/signup use magic link)
- Supabase env var renamed to standard naming
- Kimi model updated to kimi-k2.5
- dispatch.ts created for design job queueing
- /api/health endpoint
- Custom not-found.tsx + error.tsx for both apps
- CONTRIBUTING.md, SECURITY.md, CODE_OF_CONDUCT.md, issue/PR templates
- README overhauled with founder voice, badges, screenshot, docs table
- Corrupted directory removed
- CI parallelized into separate jobs
- Copyright year updated
- Supabase storage bucket names aligned with actual instance
- DigiKey OAuth dead code removed
- SOUL.md, TOOLS.md, IDENTITY.md bootstrap files
- Agent memory module (context-builder, memory-store, dream-consolidator)
- NOTICES.md with acknowledgements for all 8 frameworks
- raino-site: 4 new pages (showcase, integrations, changelog, trust)
- raino-studio: Settings page with integration status
- Resend config resolved (removed or wired)
- Post-fix audit Round 1 report
- Audit Round 1 fixes
- Post-fix audit Round 2 report with final verdict

### Definition of Done
- [ ] `pnpm typecheck && pnpm lint && pnpm test && pnpm build` all pass
- [ ] Both Vercel deployments live with fixes applied
- [ ] GitHub CI green
- [ ] All QA scenarios pass

### Must Have
- Every HIGH and MEDIUM issue fixed
- README matches reference framework professionalism
- No test regressions (692+ tests still pass)
- Both sites render correctly on desktop and mobile

### Must NOT Have (Guardrails)
- No new npm dependencies (unless justified — Task 22 Resend is the exception)
- No prisma schema changes
- No worker service modifications (design-worker, ingest-worker, quote-worker, audit-worker)
- No i18n implementation (language switcher to GitHub READMEs stays)
- No cyberpunk theme redesign (CSS fixes only)
- No `as any`, `@ts-ignore`, `@ts-expect-error`, empty catch blocks
- No deleting tests to pass builds
- No touching packages/ui design system

---

## Agent Consultation Protocol (MANDATORY — for Atlas executor)

> The following rules apply to ALL tasks. Atlas MUST follow these protocols.

### Rule 1: Consult Official Docs Before Implementation
Before implementing ANY integration change (Tasks 16-22), Atlas MUST:
1. Read the official documentation for the relevant platform
2. Verify the current Raino implementation matches the documented API
3. If there's a mismatch, use the OFFICIAL docs as the source of truth

**Platform Documentation URLs:**
- **Kimi/Moonshot**: https://platform.moonshot.ai/docs/api/chat
- **Supabase Auth**: https://supabase.com/docs/guides/auth/server-side-rendering
- **Supabase Storage**: https://supabase.com/docs/guides/storage
- **DigiKey API**: https://developer.digikey.com/documentation
- **Mouser API**: https://api.mouser.com/api/docs/v2
- **JLCPCB/LCSC**: https://api.jlcpcb.com/
- **Resend**: https://resend.com/docs/api-reference/emails/send-email
- **Vercel**: https://vercel.com/docs/monorepos/turborepo

### Rule 2: Stop and Ask If Blocked
If Atlas encounters ANY of the following blockers, it MUST STOP and create a step-by-step guide for the user:
- Missing credentials that cannot be found in `.env.example` or environment
- Platform configuration that requires dashboard access (e.g., Supabase dashboard, Vercel settings)
- API behavior that contradicts official documentation
- Unclear business logic that could go multiple ways with 2x+ effort difference

**Step-by-step guide format (MANDATORY):**
```
### Manual Step Required: [Description]

**URL to open**: [Exact URL]
**What to do**:
1. [Exact button/link to click]
2. [Exact text to input in specific textbox]
3. [Exact dropdown value to select]
4. [Screenshot of expected state]
```

### Rule 3: No Faking Integration Data
- Never fabricate live supplier pricing data — always use fixture/degraded mode when credentials are missing
- Never claim a live API connection when using fixture data
- Every degraded-mode path must be clearly labeled and inspectable

### Rule 4: Verify Before Proceeding
After each wave, Atlas MUST:
1. Run `pnpm typecheck && pnpm lint && pnpm test && pnpm build`
2. Verify all tests pass (692+ tests)
3. Check for any new TypeScript errors
4. Only proceed to the next wave if ALL checks pass

---

## Verification Strategy

> **ZERO HUMAN INTERVENTION** — ALL verification is agent-executed.

### Test Decision
- **Infrastructure exists**: YES (Vitest + Playwright)
- **Automated tests**: YES (Tests-after — update existing tests that reference changed values)
- **Framework**: Vitest

### QA Policy
Every task includes agent-executed QA scenarios.
Evidence saved to `.sisyphus/evidence/task-{N}-{scenario-slug}.{ext}`.

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Start Immediately — zero-risk cosmetic + metadata fixes):
├── Task 1:  Fix CSS typo + .env.example comment + copyright year [quick]
├── Task 2:  Fix site metadata (unique titles, OG tags, favicon, OG image) [unspecified-high]
├── Task 3:  Fix site nav/footer into shared layout components [visual-engineering]
└── Task 4:  Add mobile hamburger menu to site Navbar [visual-engineering]

Wave 2 (After Wave 1 — code fixes):
├── Task 5:  Fix auth consistency (signup → magic link) [quick]
├── Task 6:  Rename Supabase env vars to standard naming [deep]
├── Task 7:  Update Kimi model to kimi-k2.5 [quick]
├── Task 8:  Create dispatch.ts + wire design job queue [deep]
├── Task 9:  Add /api/health endpoint [quick]
└── Task 10: Add custom not-found.tsx + error.tsx to both apps [visual-engineering]

Wave 3 (After Wave 2 — repo + README overhaul):
├── Task 11: Create all community files (CONTRIBUTING, SECURITY, CoC, templates) [writing]
├── Task 12: Overhaul README to match reference frameworks [writing]
└── Task 13: Fix CI pipeline (parallelize + add badge) + remove corrupted dir [unspecified-high]

Wave 4 (After Wave 3 — GitHub manual steps + final deploy):
├── Task 14: Push all changes + verify CI green + Vercel deployments [quick]
└── Task 15: Manual user steps guide for GitHub settings + Vercel env vars [writing]

Wave 5 (After Wave 4 — agent enhancement, integration fixes, content overhaul):
├── Task 16: Fix Supabase Storage bucket mismatch (CRITICAL) [quick]
├── Task 17: Fix DigiKey OAuth integration & remove dead code [quick]
├── Task 18: Add Raino agent memory system (MemPalace + Nanobot + OpenClaw) [deep]
├── Task 19: Add legal acknowledgements (NOTICES.md) [quick]
├── Task 20: Overhaul raino-site (4 new pages + SEO + mobile) [visual-engineering]
├── Task 21: Overhaul raino-studio (settings + auth fix + UX) [visual-engineering]
└── Task 22: Wire Resend for sending design docs via email [unspecified-high]

Wave 6 (After Wave 5 deployed — post-fix audit cycle):
├── Task 23: Post-fix comprehensive audit (Round 1) [unspecified-high]
├── Task 24: Fix issues from audit Round 1 [unspecified-high]
└── Task 25: Post-fix re-audit (Round 2 — final verification) [unspecified-high]

Wave FINAL (After ALL tasks — 4 parallel reviews):
├── F1: Plan compliance audit (oracle)
├── F2: Code quality review (unspecified-high)
├── F3: Real manual QA — both sites (unspecified-high + playwright)
└── F4: Scope fidelity check (deep)
→ Present results → Get explicit user okay

Critical Path: T1 → T6 → T8 → T14 → T18 → T23 → T24 → T25 → F1-F4 → user okay
Parallel Speedup: ~70% faster than sequential
Max Concurrent: 7 (Wave 5), 6 (Wave 2)
```

### Dependency Matrix

| Task | Depends On | Blocks | Wave |
|------|-----------|--------|------|
| T1 | - | T6, T14 | 1 |
| T2 | - | T4, T14 | 1 |
| T3 | - | T4, T14 | 1 |
| T4 | T3 | T14 | 1 |
| T5 | - | T14 | 2 |
| T6 | T1 | T14 | 2 |
| T7 | T1 | T14 | 2 |
| T8 | - | T14 | 2 |
| T9 | - | T14 | 2 |
| T10 | - | T14 | 2 |
| T11 | - | T14 | 3 |
| T12 | T11 | T14 | 3 |
| T13 | - | T14 | 3 |
| T14 | All above (T1-T13) | T16-T22 | 4 |
| T15 | - | User | 4 |
| T16 | - | T20, F1-F4 | 5 |
| T17 | - | T20, F1-F4 | 5 |
| T18 | - | T20, T21, T22, F1-F4 | 5 |
| T19 | - | T20, F1-F4 | 5 |
| T20 | T3, T16, T17, T19 | T22, F1-F4 | 5 |
| T21 | T18 | T22, F1-F4 | 5 |
| T22 | T20, T21 | F1-F4 | 5 |
| T23 | ALL Waves 1-5 (T1-T22) | T24 | 6 |
| T24 | T23 | T25 | 6 |
| T25 | T24 | F1-F4 | 6 |

### Agent Dispatch Summary

- **Wave 1**: 4 — T1 → `quick`, T2 → `unspecified-high`, T3 → `visual-engineering`, T4 → `visual-engineering`
- **Wave 2**: 6 — T5 → `quick`, T6 → `deep`, T7 → `quick`, T8 → `deep`, T9 → `quick`, T10 → `visual-engineering`
- **Wave 3**: 3 — T11 → `writing`, T12 → `writing`, T13 → `unspecified-high`
- **Wave 4**: 2 — T14 → `quick`, T15 → `writing`
- **Wave 5**: 7 — T16 → `quick`, T17 → `quick`, T18 → `deep`, T19 → `quick`, T20 → `visual-engineering`, T21 → `visual-engineering`, T22 → `unspecified-high`
- **Wave 6**: 3 — T23 → `unspecified-high`, T24 → `unspecified-high`, T25 → `unspecified-high`
- **FINAL**: 4 — F1 → `oracle`, F2 → `unspecified-high`, F3 → `unspecified-high`, F4 → `deep`

---

## TODOs

- [x] 1. Fix CSS typo, .env.example comment, and copyright year

  **What to do**:
  - In `apps/studio/src/app/projects/[id]/intake/page.tsx` line 179: change `py-32xl` to `py-3`
  - In `.env.example`: fix the comment on `KIMI_API_BASE_URL` line — change `moonshot.cn` to `moonshot.ai`
  - In all 5 marketing site pages, update "© 2024" to "© 2024-2026" in Footer functions:
    - `apps/site/src/app/page.tsx` (line 344)
    - `apps/site/src/app/features/page.tsx` (line 290)
    - `apps/site/src/app/architecture/page.tsx` (line 279)
    - `apps/site/src/app/workflow/page.tsx` (line 185)
    - `apps/site/src/app/docs/page.tsx` (line 157)

  **Must NOT do**:
  - Do not change any other CSS classes
  - Do not modify any other .env values
  - Do not redesign any pages

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 2, 3, 4)
  - **Blocks**: Task 6 (env var rename needs .env.example clean first), Task 14
  - **Blocked By**: None

  **References**:
  - `apps/studio/src/app/projects/[id]/intake/page.tsx:179` — The `py-32xl` typo in chat message className
  - `.env.example` — The `KIMI_API_BASE_URL` comment references `moonshot.cn` but code uses `moonshot.ai`
  - All 5 page.tsx files in `apps/site/src/app/` — Footer functions containing "© 2024"

  **Acceptance Criteria**:
  - [ ] `grep -r "py-32xl" apps/studio/` returns zero matches
  - [ ] `grep "moonshot.cn" .env.example` returns zero matches
  - [ ] `grep "© 2024 " apps/site/src/app/` returns zero matches (all updated to "© 2024-2026")
  - [ ] `pnpm typecheck && pnpm lint && pnpm test` pass

  **QA Scenarios**:
  ```
  Scenario: CSS typo fixed
    Tool: Bash (grep)
    Steps:
      1. grep -r "py-32xl" apps/studio/src/
    Expected Result: Zero matches
    Evidence: .sisyphus/evidence/task-1-css-fix.txt

  Scenario: Copyright updated
    Tool: Bash (grep)
    Steps:
      1. grep -r "© 2024 " apps/site/src/app/
    Expected Result: Zero matches (all say 2024-2026 now)
    Evidence: .sisyphus/evidence/task-1-copyright.txt
  ```

  **Commit**: YES (groups with Wave 1)
  - Message: `fix: resolve CSS typo, env comment, and copyright year`
  - Files: intake/page.tsx, .env.example, 5 site page.tsx files

- [x] 2. Fix site metadata (unique titles, OG tags, favicon, OG image)

  **What to do**:
  - Create `apps/site/src/app/layout.tsx` root metadata with base OG tags
  - Add unique `<title>` and `description` metadata to each page using Next.js Metadata API:
    - `/` → "Raino — Design PCBs with Structured Intelligence"
    - `/features` → "Features — Raino"
    - `/architecture` → "Architecture — Raino"
    - `/workflow` → "Workflow — Raino"
    - `/docs` → "Documentation — Raino"
  - Add OpenGraph + Twitter card meta tags to each page (og:title, og:description, og:image, og:url, twitter:card)
  - Create a cyberpunk-themed favicon: `apps/site/public/favicon.ico` (16x16, 32x32, 48x48) — use a simple PCB-trace or circuit-grid pattern in cyan/neon green
  - Create OG image: `apps/site/public/og-image.png` (1200x630) — dark background with Raino logo and tagline
  - Create `apps/site/src/app/opengraph-image.tsx` using Next.js ImageResponse API for dynamic OG image generation
  - Reference favicon in layout.tsx

  **Must NOT do**:
  - Do not add new npm dependencies (use Next.js built-in Metadata API)
  - Do not modify page content, only metadata
  - Do not add i18n

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 3, 4)
  - **Blocks**: Task 4 (favicon must exist before hamburger menu work)
  - **Blocked By**: None

  **References**:
  - `apps/site/src/app/page.tsx` — Currently no metadata export
  - `apps/site/src/app/features/page.tsx` — Same
  - `apps/site/src/app/architecture/page.tsx` — Same
  - `apps/site/src/app/workflow/page.tsx` — Same
  - `apps/site/src/app/docs/page.tsx` — Same
  - Next.js Metadata API: https://nextjs.org/docs/app/api-reference/functions/generate-metadata
  - Reference: oh-my-opencode and OpenClaw both have unique page titles and OG tags

  **Acceptance Criteria**:
  - [ ] Each page has a unique `<title>` in the rendered HTML
  - [ ] Each page has `og:title`, `og:description`, `og:image`, `twitter:card` meta tags
  - [ ] `favicon.ico` exists at `apps/site/public/favicon.ico`
  - [ ] OG image exists at `apps/site/public/og-image.png`
  - [ ] `pnpm build --filter @raino/site` succeeds

  **QA Scenarios**:
  ```
  Scenario: Unique page titles
    Tool: Bash (curl)
    Steps:
      1. curl -s https://raino-site.vercel.app/ | grep '<title>'
      2. curl -s https://raino-site.vercel.app/features | grep '<title>'
      3. curl -s https://raino-site.vercel.app/architecture | grep '<title>'
    Expected Result: Each returns a DIFFERENT title string
    Evidence: .sisyphus/evidence/task-2-titles.txt

  Scenario: OG tags present
    Tool: Bash (curl + grep)
    Steps:
      1. curl -s https://raino-site.vercel.app/ | grep 'og:'
    Expected Result: Finds og:title, og:description, og:image
    Evidence: .sisyphus/evidence/task-2-og-tags.txt

  Scenario: Favicon accessible
    Tool: Bash (curl)
    Steps:
      1. curl -sI https://raino-site.vercel.app/favicon.ico | head -1
    Expected Result: HTTP 200
    Evidence: .sisyphus/evidence/task-2-favicon.txt
  ```

  **Commit**: YES (groups with Wave 1)
  - Message: `feat(site): add unique page titles, OG meta tags, and favicon`
  - Files: layout.tsx (new), 5 page.tsx files, public/favicon.ico, public/og-image.png

- [x] 3. Fix site nav/footer — refactor into shared layout components

  **What to do**:
  - Create `apps/site/src/components/Footer.tsx` — extract the rich 4-column footer from `apps/site/src/app/page.tsx` (the homepage version with logo+description, Product links, Resources links, copyright+KiCad disclaimer)
  - Update `apps/site/src/app/layout.tsx` to include shared `<Navbar />` and `<Footer />` at the layout level
  - For each of the 5 pages, remove the inline `Navbar()` and `Footer()` function definitions and their JSX usage
  - For `workflow/page.tsx` and `docs/page.tsx`: delete their inline Navbar functions and rely on layout-level Navbar
  - The shared Navbar already exists at `apps/site/src/components/Navbar.tsx` — it just needs to be used via layout instead of imported per-page
  - Add "Home" link to the shared Navbar (currently missing for workflow/docs pages since they had inline copies)
  - Ensure the `activePath` prop still works — use `usePathname()` client-side or pass from server component

  **Must NOT do**:
  - Do not change the visual design of navbar or footer
  - Do not add new pages or routes
  - Do not modify the cyberpunk theme

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 2, 4)
  - **Blocks**: Task 4 (hamburger menu needs shared Navbar to exist in layout)
  - **Blocked By**: None

  **References**:
  - `apps/site/src/components/Navbar.tsx` — Shared Navbar component (89 lines)
  - `apps/site/src/app/page.tsx` — Has rich 4-column Footer (lines 266-352) — use THIS as the template
  - `apps/site/src/app/features/page.tsx` — Has simpler Footer (lines 260-295) — DELETE this
  - `apps/site/src/app/architecture/page.tsx` — Has simpler Footer (lines 249-284) — DELETE this
  - `apps/site/src/app/workflow/page.tsx` — Has inline Navbar (lines 102-150) + simple Footer (lines 152-190) — DELETE both
  - `apps/site/src/app/docs/page.tsx` — Has inline Navbar (lines 71-122) + simple Footer (lines 124-162) — DELETE both
  - `apps/site/src/app/layout.tsx` — Currently minimal; needs Navbar + Footer added at layout level

  **Acceptance Criteria**:
  - [ ] `apps/site/src/components/Footer.tsx` exists with the rich 4-column design
  - [ ] `apps/site/src/app/layout.tsx` includes `<Navbar />` and `<Footer />`
  - [ ] No page.tsx file in apps/site has an inline `Navbar()` or `Footer()` function
  - [ ] `grep -r "function Navbar" apps/site/src/app/` returns zero matches
  - [ ] `grep -r "function Footer" apps/site/src/app/` returns zero matches
  - [ ] All 5 pages render correctly with consistent nav and footer
  - [ ] `pnpm build --filter @raino/site` succeeds

  **QA Scenarios**:
  ```
  Scenario: No inline nav/footer functions
    Tool: Bash (grep)
    Steps:
      1. grep -r "function Navbar" apps/site/src/app/
      2. grep -r "function Footer" apps/site/src/app/
    Expected Result: Both return zero matches
    Evidence: .sisyphus/evidence/task-3-no-inline.txt

  Scenario: All pages have consistent footer
    Tool: Bash (curl)
    Steps:
      1. curl -s https://raino-site.vercel.app/ | grep -c 'Resources'
      2. curl -s https://raino-site.vercel.app/features | grep -c 'Resources'
      3. curl -s https://raino-site.vercel.app/architecture | grep -c 'Resources'
    Expected Result: All return 1 or more (rich footer with Resources column)
    Evidence: .sisyphus/evidence/task-3-footer-consistency.txt
  ```

  **Commit**: YES (groups with Wave 1)
  - Message: `refactor(site): extract nav/footer into shared layout components`
  - Files: Footer.tsx (new), layout.tsx, 5 page.tsx files

- [x] 4. Add mobile hamburger menu to site Navbar

  **What to do**:
  - Convert `apps/site/src/components/Navbar.tsx` to a client component (add `"use client"`)
  - Add mobile hamburger button (visible below `md` breakpoint, uses `md:hidden`)
  - Add mobile slide-down/drawer menu with all nav links: Home, Features, Architecture, Workflow, Docs, GitHub, language switcher, Launch Studio
  - Use existing cyberpunk design tokens (neon cyan, dark background, pixel font)
  - Ensure the hamburger button is a simple 3-line icon (CSS, no SVG dependency)
  - Toggle menu visibility with React state
  - Close menu on link click
  - Add `aria-label` for accessibility

  **Must NOT do**:
  - Do not add animations beyond simple show/hide
  - Do not change desktop nav behavior
  - Do not add new dependencies
  - Do not redesign the nav

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: YES (but preferred after Task 3 completes for clean base)
  - **Parallel Group**: Wave 1
  - **Blocks**: Task 14
  - **Blocked By**: Task 3 (Navbar must be in shared layout first)

  **References**:
  - `apps/site/src/components/Navbar.tsx` — The shared Navbar to modify (89 lines)
  - Current nav has `hidden md:flex` for desktop links — mobile sees NOTHING below md breakpoint
  - Design system: cyberpunk theme with sharp corners, `#00f0ff` cyan accent, Press Start 2P + VT323 fonts
  - `apps/site/src/app/globals.css` — Tailwind v4 with custom theme tokens

  **Acceptance Criteria**:
  - [ ] Navbar.tsx has `"use client"` directive
  - [ ] Hamburger button visible on mobile (below md breakpoint)
  - [ ] Mobile menu shows all nav links + Launch Studio button
  - [ ] Mobile menu closes on link click
  - [ ] Desktop nav unchanged
  - [ ] `pnpm build --filter @raino/site` succeeds

  **QA Scenarios**:
  ```
  Scenario: Hamburger menu exists in HTML
    Tool: Bash (grep)
    Steps:
      1. grep -r "md:hidden" apps/site/src/components/Navbar.tsx
    Expected Result: Found (hamburger button class)
    Evidence: .sisyphus/evidence/task-4-hamburger.txt

  Scenario: Navbar is client component
    Tool: Bash (grep)
    Steps:
      1. head -5 apps/site/src/components/Navbar.tsx | grep "use client"
    Expected Result: Found
    Evidence: .sisyphus/evidence/task-4-client.txt
  ```

  **Commit**: YES (groups with Wave 1)
  - Message: `feat(site): add mobile hamburger menu to Navbar`
  - Files: Navbar.tsx

- [ ] 5. Fix auth consistency — make signup use magic link

  **What to do**:
  - Update `apps/studio/src/app/signup/page.tsx` to use magic link (signInWithOtp) instead of password-based signup (signUp with password)
  - Remove the password input field from the signup form
  - Change the form to only have an email field + "Send Magic Link" button
  - Update the success message to match the login page: "Check your email for the login link"
  - Update the page heading/subheading to say "Sign Up" with magic link description
  - Keep the link to /login and the overall page structure
  - Update any heading text to clarify this is magic link signup

  **Must NOT do**:
  - Do not add OAuth providers
  - Do not add password reset flow
  - Do not add email verification beyond what Supabase provides
  - Do not create a user profile page

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 6, 7, 8, 9, 10)
  - **Blocks**: Task 14
  - **Blocked By**: None

  **References**:
  - `apps/studio/src/app/signup/page.tsx` — Current password-based signup (uses `supabase.auth.signUp`)
  - `apps/studio/src/app/login/page.tsx` — Current magic link login (uses `signInWithOtp`) — COPY this pattern
  - Supabase docs: `signInWithOtp({ email })` sends a magic link by default

  **Acceptance Criteria**:
  - [ ] `grep "signUp" apps/studio/src/app/signup/page.tsx` returns zero matches (replaced with signInWithOtp)
  - [ ] `grep "password" apps/studio/src/app/signup/page.tsx` returns zero matches (no password field)
  - [ ] Signup page has email input + "Send Magic Link" button
  - [ ] `pnpm typecheck && pnpm test` pass

  **QA Scenarios**:
  ```
  Scenario: Signup uses magic link
    Tool: Bash (grep)
    Steps:
      1. grep -c "signInWithOtp" apps/studio/src/app/signup/page.tsx
    Expected Result: >= 1
    Evidence: .sisyphus/evidence/task-5-magic-link.txt

  Scenario: No password field
    Tool: Bash (grep)
    Steps:
      1. grep -i "password" apps/studio/src/app/signup/page.tsx
    Expected Result: Zero matches
    Evidence: .sisyphus/evidence/task-5-no-password.txt
  ```

  **Commit**: YES (groups with Wave 2)
  - Message: `fix(auth): make signup use magic link to match login`
  - Files: signup/page.tsx

- [ ] 6. Rename Supabase env vars to standard naming

  **What to do**:
  This is a HIGH blast radius change — must be atomic across ALL files. The current code uses `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` but Supabase's official convention is `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

  Update ALL 7 source files + .env.example simultaneously:
  1. `apps/studio/src/middleware.ts` line 8
  2. `apps/studio/src/lib/auth/get-current-user.ts` line 4
  3. `apps/studio/src/app/auth/callback/route.ts` line 14
  4. `packages/db/src/supabase/server.ts` line 8
  5. `packages/db/src/supabase/middleware.ts` line 11
  6. `packages/db/src/supabase/browser.ts` line 6
  7. `.env.example` line 17

  In each file, replace `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` with `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

  Also search for any AGENTS.md references and update those too.

  **Must NOT do**:
  - Do not split this across multiple commits — ALL renames must be in ONE commit
  - Do not change the actual Supabase key VALUE (only the env var NAME)
  - Do not modify prisma schema
  - Do not touch any other env vars

  **Recommended Agent Profile**:
  - **Category**: `deep`
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: YES (but ensure atomic commit)
  - **Parallel Group**: Wave 2
  - **Blocks**: Task 14
  - **Blocked By**: Task 1 (.env.example should be clean first)

  **References**:
  - `apps/studio/src/middleware.ts:8` — `process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
  - `apps/studio/src/lib/auth/get-current-user.ts:4`
  - `apps/studio/src/app/auth/callback/route.ts:14`
  - `packages/db/src/supabase/server.ts:8`
  - `packages/db/src/supabase/middleware.ts:11`
  - `packages/db/src/supabase/browser.ts:6`
  - `.env.example:17`
  - Supabase official docs: https://supabase.com/docs/guides/auth/server-side/nextjs — uses `NEXT_PUBLIC_SUPABASE_ANON_KEY`

  **Acceptance Criteria**:
  - [ ] `grep -r "PUBLISHABLE_KEY" apps/ packages/ .env.example` returns zero matches
  - [ ] `grep -r "SUPABASE_ANON_KEY" apps/ packages/ .env.example` returns 7+ matches
  - [ ] `pnpm typecheck && pnpm lint && pnpm test && pnpm build` all pass

  **QA Scenarios**:
  ```
  Scenario: Old name completely removed
    Tool: Bash (grep)
    Steps:
      1. grep -r "PUBLISHABLE_KEY" apps/ packages/ .env.example
    Expected Result: Zero matches
    Evidence: .sisyphus/evidence/task-6-old-name-removed.txt

  Scenario: New name present in all files
    Tool: Bash (grep)
    Steps:
      1. grep -rc "SUPABASE_ANON_KEY" apps/ packages/ .env.example
    Expected Result: 7+ files with matches
    Evidence: .sisyphus/evidence/task-6-new-name-present.txt

  Scenario: Build still succeeds
    Tool: Bash
    Steps:
      1. pnpm typecheck && pnpm build
    Expected Result: Both succeed
    Evidence: .sisyphus/evidence/task-6-build.txt
  ```

  **Commit**: YES (single atomic commit)
  - Message: `refactor: rename SUPABASE_PUBLISHABLE_KEY to SUPABASE_ANON_KEY (official convention)`
  - Files: 6 source files + .env.example

- [ ] 7. Update Kimi model from kimi-k2-0711 to kimi-k2.5

  **What to do**:
  Update the default Kimi model name in the LLM provider and all associated test files.

  Files to update:
  1. `packages/llm/src/providers/kimi.ts` line 15: Change `KIMI_DEFAULT_MODEL` from `'kimi-k2-0711'` to `'kimi-k2.5'`
  2. `packages/llm/src/__tests__/kimi-provider.test.ts`: Update all references to `'kimi-k2-0711'` to `'kimi-k2.5'`
  3. `packages/llm/src/__tests__/gateway.test.ts` line 10: Update model reference
  4. `packages/llm/src/__tests__/structured-output.test.ts` line 11: Update model reference
  5. `packages/llm/src/__tests__/templates.test.ts` line 11: Update model reference

  **Must NOT do**:
  - Do not change the base URL (already correct at `https://api.moonshot.ai/v1`)
  - Do not modify the OpenAI SDK configuration
  - Do not add new model parameters

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2
  - **Blocks**: Task 14
  - **Blocked By**: Task 1 (.env.example should be clean first)

  **References**:
  - `packages/llm/src/providers/kimi.ts:15` — `const KIMI_DEFAULT_MODEL = 'kimi-k2-0711'`
  - `packages/llm/src/__tests__/kimi-provider.test.ts` — 5 references to `'kimi-k2-0711'`
  - `packages/llm/src/__tests__/gateway.test.ts:10`
  - `packages/llm/src/__tests__/structured-output.test.ts:11`
  - `packages/llm/src/__tests__/templates.test.ts:11`
  - Official Moonshot API docs: https://platform.moonshot.ai/docs/api/chat — model `kimi-k2.5` is the current recommended model
  - Model list: https://platform.kimi.ai/docs/models — `kimi-k2.5` is the latest, `kimi-k2-0711-preview` is an older K2 variant

  **Acceptance Criteria**:
  - [ ] `grep -r "kimi-k2-0711" packages/llm/` returns zero matches
  - [ ] `grep "kimi-k2.5" packages/llm/src/providers/kimi.ts` returns 1 match
  - [ ] `pnpm test --filter @raino/llm` passes with updated model name

  **QA Scenarios**:
  ```
  Scenario: Old model name removed
    Tool: Bash (grep)
    Steps:
      1. grep -r "kimi-k2-0711" packages/llm/
    Expected Result: Zero matches
    Evidence: .sisyphus/evidence/task-7-old-model-removed.txt

  Scenario: Tests pass with new model
    Tool: Bash
    Steps:
      1. pnpm test --filter @raino/llm
    Expected Result: All tests pass
    Evidence: .sisyphus/evidence/task-7-llm-tests.txt
  ```

  **Commit**: YES (groups with Wave 2)
  - Message: `fix(llm): update default Kimi model from kimi-k2-0711 to kimi-k2.5`
  - Files: kimi.ts, 4 test files

- [ ] 8. Create dispatch.ts and wire design job queue

  **What to do**:
  The Phase 1 plan specified `apps/studio/src/lib/workers/dispatch.ts` but it was never created. The design route currently runs generation synchronously. Create a proper dispatch module:

  1. Create `apps/studio/src/lib/workers/dispatch.ts` with a `triggerDesignJob(projectId: string, spec: unknown): Promise<{ jobId: string }>` function
  2. This function should:
     - Create a DesignJob record via Prisma with status `pending`
     - Call `generateKiCadProject()` from `@raino/design-worker`
     - Update the job status to `running`, then `completed`/`failed`
     - If artifacts generated, call `uploadArtifactsToStorage()` from design-worker
     - Return the job ID for status polling
  3. Update `apps/studio/src/app/api/projects/[id]/design/route.ts` to use `triggerDesignJob()` instead of inline generation
  4. Keep the synchronous execution model (no background worker process) — just better organized code

  **Must NOT do**:
  - Do not create a separate worker process or background job runner
  - Do not modify prisma schema
  - Do not modify design-worker, ingest-worker, quote-worker, or audit-worker source code
  - Do not add new npm dependencies

  **Recommended Agent Profile**:
  - **Category**: `deep`
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2
  - **Blocks**: Task 14
  - **Blocked By**: None

  **References**:
  - `apps/studio/src/app/api/projects/[id]/design/route.ts` — Current inline implementation (calls generateKiCadProject directly)
  - `services/design-worker/src/index.ts` — Exports `generateKiCadProject`
  - `services/design-worker/src/artifacts/manifest.ts` — Has `uploadArtifactsToStorage()` (lines 140-179)
  - `services/design-worker/src/queue/worker.ts` — Has `pollAndExecuteWithPrisma()` (unused polling function) and `persistArtifactsToStorage()`
  - `packages/db/prisma/schema.prisma` — DesignJob model with status field
  - `apps/studio/src/app/api/projects/[id]/design/status/route.ts` — Status polling endpoint

  **Acceptance Criteria**:
  - [ ] `apps/studio/src/lib/workers/dispatch.ts` exists
  - [ ] `triggerDesignJob()` function is exported
  - [ ] Design route uses `triggerDesignJob()` instead of inline generation
  - [ ] `pnpm typecheck && pnpm test` pass

  **QA Scenarios**:
  ```
  Scenario: dispatch.ts exists with triggerDesignJob
    Tool: Bash (grep)
    Steps:
      1. grep "triggerDesignJob" apps/studio/src/lib/workers/dispatch.ts
    Expected Result: Function found
    Evidence: .sisyphus/evidence/task-8-dispatch-exists.txt

  Scenario: Design route uses dispatch
    Tool: Bash (grep)
    Steps:
      1. grep "triggerDesignJob" apps/studio/src/app/api/projects/[id]/design/route.ts
    Expected Result: Found (route delegates to dispatch)
    Evidence: .sisyphus/evidence/task-8-route-uses-dispatch.txt
  ```

  **Commit**: YES (groups with Wave 2)
  - Message: `feat(studio): create dispatch.ts and wire design job queue`
  - Files: dispatch.ts (new), design/route.ts

- [ ] 9. Add /api/health endpoint

  **What to do**:
  Create a simple health check endpoint for monitoring:

  1. Create `apps/studio/src/app/api/health/route.ts`
  2. Return JSON with: `{ status: "ok", timestamp: new Date().toISOString(), version: "0.1.0" }`
  3. Optionally check Supabase connectivity (try a simple query, report degraded if unavailable)
  4. Return 200 if basic services available, 503 if degraded

  **Must NOT do**:
  - Do not expose any credentials or internal state
  - Do not add authentication requirement (health checks must be unauthenticated)
  - Do not create any other API routes

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2
  - **Blocks**: Task 14
  - **Blocked By**: None

  **References**:
  - `apps/studio/src/app/api/` — Existing API route pattern
  - `apps/studio/src/middleware.ts` — Matcher excludes `api` routes from auth (health will be accessible without auth)

  **Acceptance Criteria**:
  - [ ] `apps/studio/src/app/api/health/route.ts` exists
  - [ ] Returns 200 with `{ status: "ok" }` JSON
  - [ ] `pnpm build --filter @raino/studio` succeeds

  **QA Scenarios**:
  ```
  Scenario: Health endpoint returns 200
    Tool: Bash (curl)
    Steps:
      1. curl -s https://raino-studio.vercel.app/api/health | head -c 200
    Expected Result: JSON with "status": "ok"
    Evidence: .sisyphus/evidence/task-9-health.txt
  ```

  **Commit**: YES (groups with Wave 2)
  - Message: `feat(studio): add /api/health endpoint`
  - Files: health/route.ts (new)

- [ ] 10. Add custom not-found.tsx and error.tsx to both apps

  **What to do**:
  Create custom error pages matching the cyberpunk theme for both apps:

  1. `apps/site/src/app/not-found.tsx` — 404 page with Raino branding, "Page Not Found" message, and link back to homepage
  2. `apps/site/src/app/error.tsx` — Generic error boundary with error message + "Try Again" button (must be client component)
  3. `apps/studio/src/app/not-found.tsx` — 404 page with Raino Studio branding and link to dashboard
  4. `apps/studio/src/app/error.tsx` — Error boundary with error message + "Go to Dashboard" button

  Design: Use existing cyberpunk theme (dark bg #0a0a0f, neon cyan #00f0ff, Press Start 2P headings, sharp corners, circuit-grid background).

  **Must NOT do**:
  - Do not add new dependencies
  - Do not create loading.tsx (not needed for this fix cycle)
  - Do not redesign existing pages

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2
  - **Blocks**: Task 14
  - **Blocked By**: None

  **References**:
  - `apps/site/src/app/globals.css` — Cyberpunk theme tokens
  - `apps/studio/src/app/globals.css` — Studio cyberpunk theme
  - Next.js docs: `not-found.tsx` and `error.tsx` conventions
  - Reference: oh-my-opencode and OpenClaw have custom error pages

  **Acceptance Criteria**:
  - [ ] All 4 files exist
  - [ ] `apps/site/src/app/not-found.tsx` contains "Raino" branding and link to "/"
  - [ ] `apps/studio/src/app/not-found.tsx` contains "Raino Studio" branding and link to "/"
  - [ ] Both error.tsx files are client components with `"use client"`
  - [ ] `pnpm build` succeeds for both apps

  **QA Scenarios**:
  ```
  Scenario: Custom 404 for site
    Tool: Bash (curl)
    Steps:
      1. curl -s https://raino-site.vercel.app/nonexistent-page | grep -c "Not Found"
    Expected Result: >= 1
    Evidence: .sisyphus/evidence/task-10-site-404.txt
  ```

  **Commit**: YES (groups with Wave 2)
  - Message: `feat: add custom not-found and error pages to both apps`
  - Files: 4 new files (not-found.tsx × 2, error.tsx × 2)

- [ ] 11. Create all community files

  **What to do**:
  Create the standard open-source community files that all 4 reference frameworks have:

  1. `CONTRIBUTING.md` — Development setup guide (clone, install, env vars, dev commands), PR process, code standards (from AGENTS.md), testing requirements. Use honest tone: "This is a young project. PRs welcome but response times may vary."

  2. `SECURITY.md` — Security policy: how to report vulnerabilities (email 27jamesgong@gmail.com), what's in scope (auth bypass, data leaks, credential exposure), response timeline expectations. Note the No-Fake-Integration Policy as a security feature.

  3. `CODE_OF_CONDUCT.md` — Use Contributor Covenant v2.1 (standard, recognized). Add enforcement contact (27jamesgong@gmail.com).

  4. `.github/ISSUE_TEMPLATE/bug_report.yml` — Bug report template with fields: description, steps to reproduce, expected behavior, actual behavior, environment (browser/OS), screenshots

  5. `.github/ISSUE_TEMPLATE/feature_request.yml` — Feature request template with fields: problem description, proposed solution, alternatives considered, additional context

  6. `.github/PULL_REQUEST_TEMPLATE.md` — PR template with sections: description, type of change (bug/feature/docs/refactor), testing steps, checklist (typecheck, lint, test, self-review)

  7. `.github/FUNDING.yml` — Optional: link to sponsorship if applicable (can be empty/skip)

  **Must NOT do**:
  - Do not create a Discord server or community infrastructure
  - Do not write a governance model
  - Do not write a roadmap document
  - Do not overpromise on response times or maintenance commitments

  **Recommended Agent Profile**:
  - **Category**: `writing`
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 12, 13)
  - **Blocks**: Task 12 (README overhaul should reference CONTRIBUTING.md)
  - **Blocked By**: None

  **References**:
  - `AGENTS.md` — Code standards to include in CONTRIBUTING.md
  - `README.md` — Project description and setup instructions
  - `.env.example` — Environment variables to document in contributing guide
  - Reference frameworks:
    - oh-my-opencode: CONTRIBUTING.md with setup script
    - OpenHarness: Contributing guide in docs
    - Hermes Agent: CONTRIBUTING.md with `setup-hermes.sh`
    - OpenClaw: CONTRIBUTING.md + SECURITY.md

  **Acceptance Criteria**:
  - [ ] `CONTRIBUTING.md` exists at repo root (200+ words)
  - [ ] `SECURITY.md` exists at repo root
  - [ ] `CODE_OF_CONDUCT.md` exists at repo root
  - [ ] `.github/ISSUE_TEMPLATE/bug_report.yml` exists
  - [ ] `.github/ISSUE_TEMPLATE/feature_request.yml` exists
  - [ ] `.github/PULL_REQUEST_TEMPLATE.md` exists
  - [ ] All files have professional, honest content

  **QA Scenarios**:
  ```
  Scenario: All community files exist
    Tool: Bash (ls)
    Steps:
      1. ls CONTRIBUTING.md SECURITY.md CODE_OF_CONDUCT.md
      2. ls .github/ISSUE_TEMPLATE/ .github/PULL_REQUEST_TEMPLATE.md
    Expected Result: All files exist
    Evidence: .sisyphus/evidence/task-11-community-files.txt
  ```

  **Commit**: YES (groups with Wave 3)
  - Message: `docs: add community files (CONTRIBUTING, SECURITY, CoC, templates)`
  - Files: 6 new files

- [ ] 12. Overhaul README to match reference frameworks

  **What to do**:
  Overhaul the README to match the professionalism, structure, and voice of oh-my-opencode, OpenHarness, Hermes Agent, and OpenClaw. Keep the existing technical content but restructure and enhance it.

  **New README structure** (follow reference frameworks):

  1. **Hero section**: Logo/ASCII art banner + tagline "From fuzzy hardware idea to manufacturing-ready PCB" + badge row (CI status, MIT license, GitHub repo)
  2. **"What is Raino?" explainer**: 3-4 sentences like OpenHarness's "What is an Agent Harness" — explain the problem Raino solves and why it's different from a chatbot
  3. **Screenshot/Demo**: ASCII art or embedded image placeholder showing the workflow
  4. **Quick Start**: Same as current but with one-command feel — `git clone && cd && pnpm install && pnpm dev`
  5. **Highlights table**: Emoji + feature name + description in table format (like oh-my-opencode and OpenClaw)
  6. **The Workflow**: Keep the 12-step list (it's good)
  7. **Architecture**: Keep the ASCII diagram (it's excellent — better than most reference frameworks)
  8. **Tech Stack table**: Keep (it's good)
  9. **Project Structure tree**: Keep (it's good)
  10. **Documentation navigation table**: NEW — like OpenClaw's docs nav table, link to all docs sections
  11. **Degraded Mode**: Keep (unique differentiator)
  12. **No-Fake-Integration Policy**: Keep (trust signal)
  13. **Testing**: Keep
  14. **Contributing**: Brief section + link to CONTRIBUTING.md
  15. **License**: Keep
  16. **Footer**: GitHub link + MIT license + "Built with TypeScript, Next.js, Supabase, and KiCad"

  **Key additions**:
  - CI badge: `[![CI](https://github.com/tudsds/raino/actions/workflows/ci.yml/badge.svg)]`
  - Highlights table with emojis
  - Docs navigation table
  - Link to CONTRIBUTING.md
  - Personal founder voice in "What is Raino" section

  **Must NOT do**:
  - Do not rewrite docs/ content
  - Do not add blog posts or changelog entries
  - Do not fabricate testimonials or reviews
  - Do not delete any existing technical content

  **Recommended Agent Profile**:
  - **Category**: `writing`
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: YES (but preferred after Task 11 completes for CONTRIBUTING.md link)
  - **Parallel Group**: Wave 3
  - **Blocks**: Task 14
  - **Blocked By**: Task 11 (needs CONTRIBUTING.md to link to)

  **References**:
  - `README.md` — Current README (322 lines) — keep all technical content
  - `CONTRIBUTING.md` — Created in Task 11 — link to it
  - Reference framework READMEs (from research):
    - oh-my-opencode (~800 words): Badge row, personal founder voice, emoji highlights table, dual-audience install, author's note
    - OpenHarness (~600 words): "What is an Agent Harness" analogy, ASCII tree, feature tables
    - Hermes Agent (~700 words): ☤ branding, feature comparison table, contributing guide
    - OpenClaw (~1000+ words): ASCII lobster art, docs navigation table, star history, contributor avatars
  - CI badge URL: `https://github.com/tudsds/raino/actions/workflows/ci.yml/badge.svg`

  **Acceptance Criteria**:
  - [ ] README has CI status badge in first 10 lines
  - [ ] README has "What is Raino?" explainer section
  - [ ] README has highlights table with emojis
  - [ ] README has documentation navigation table
  - [ ] README links to CONTRIBUTING.md
  - [ ] README retains all existing technical content (workflow, architecture, tech stack, env vars, deployment)
  - [ ] Translated READMEs (zh-CN, ja, ko) updated to match new structure

  **QA Scenarios**:
  ```
  Scenario: README has CI badge
    Tool: Bash (grep)
    Steps:
      1. head -15 README.md | grep "badge.svg"
    Expected Result: Found CI badge link
    Evidence: .sisyphus/evidence/task-12-ci-badge.txt

  Scenario: README has highlights table
    Tool: Bash (grep)
    Steps:
      1. grep "| 💬" README.md || grep "| 🏗️" README.md
    Expected Result: Emoji-prefixed table rows found
    Evidence: .sisyphus/evidence/task-12-highlights.txt
  ```

  **Commit**: YES (groups with Wave 3)
  - Message: `docs: overhaul README to match reference framework professionalism`
  - Files: README.md, README.zh-CN.md, README.ja.md, README.ko.md

- [ ] 13. Fix CI pipeline (parallelize) and remove corrupted directory

  **What to do**:

  **Part A — Remove corrupted directory**:
  - Remove the corrupted directory from git: `git rm -r ': []\n  }\n}\n<'`
  - Verify it's gone: `ls -la` in root should not show the corrupted name

  **Part B — Parallelize CI pipeline**:
  - Update `.github/workflows/ci.yml` to use parallel jobs instead of sequential steps
  - Split the single `quality` job into 4 parallel jobs:
    1. `lint` — runs `pnpm lint`
    2. `typecheck` — runs `pnpm typecheck`
    3. `test` — runs `pnpm test`
    4. `build` — runs `pnpm build` (depends on lint + typecheck passing)
  - Each job should: checkout, setup Node 20, setup pnpm, install deps (with cache), run its command
  - Add concurrency control (cancel in-progress runs for same branch)

  **Must NOT do**:
  - Do not add deployment pipelines
  - Do not add staging environments
  - Do not add security scanning
  - Do not add performance benchmarks

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3
  - **Blocks**: Task 14
  - **Blocked By**: None

  **References**:
  - `.github/workflows/ci.yml` — Current single-job CI (23 lines)
  - Reference: oh-my-opencode CI has parallel jobs (test, typecheck, build)
  - Corrupted directory confirmed at: `ls -la /mnt/d/raino/` shows `: []\n  }\n}\n<`

  **Acceptance Criteria**:
  - [ ] `ls -la` in repo root does NOT show the corrupted directory
  - [ ] `.github/workflows/ci.yml` has 4 jobs: lint, typecheck, test, build
  - [ ] lint, typecheck, test run in parallel
  - [ ] build depends on lint + typecheck
  - [ ] Concurrency control is configured

  **QA Scenarios**:
  ```
  Scenario: Corrupted directory removed
    Tool: Bash (ls)
    Steps:
      1. ls -la /mnt/d/raino/ | grep -c ":"
    Expected Result: 0 (no entries starting with special chars)
    Evidence: .sisyphus/evidence/task-13-dir-removed.txt

  Scenario: CI has parallel jobs
    Tool: Bash (grep)
    Steps:
      1. grep -c "job:" .github/workflows/ci.yml || grep -c "jobs:" .github/workflows/ci.yml
      2. grep "lint:" .github/workflows/ci.yml
      3. grep "typecheck:" .github/workflows/ci.yml
    Expected Result: Multiple jobs defined
    Evidence: .sisyphus/evidence/task-13-ci-parallel.txt
  ```

  **Commit**: YES (groups with Wave 3)
  - Message: `chore: parallelize CI and remove corrupted directory`
  - Files: ci.yml, remove corrupted dir

- [ ] 14. Push all changes, verify CI green, verify Vercel deployments

  **What to do**:
  After all Waves 1-3 are complete:
  1. Run full verification: `pnpm typecheck && pnpm lint && pnpm test && pnpm build`
  2. If all pass, commit and push to GitHub
  3. **Wait for CI to complete** — use `gh run list --limit 1` to check status, then `gh run watch` to wait for completion
  4. **If CI fails**: Read the failure log with `gh run view --log`, fix the issue, commit and push again, re-verify
  5. **Verify Vercel deployments** are live and error-free:
     - https://raino-site.vercel.app/ — all pages render correctly (200 status)
     - https://raino-studio.vercel.app/ — login page loads, health endpoint works
     - Check Vercel deployment logs if either site returns errors
  6. **If Vercel deployment fails**: Check build logs in Vercel dashboard, fix the build error, push again
  7. Spot-check key fixes:
     - Unique page titles on each marketing page
     - Consistent nav/footer on all marketing pages
     - Mobile menu visible on narrow viewport
     - Favicon loads
     - /api/health returns 200

  **Must NOT do**:
  - Do not force push
  - Do not modify any code during this task (only verify)
  - If anything fails, stop and report the issue

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: NO (must wait for all prior tasks)
  - **Parallel Group**: Sequential
  - **Blocks**: F1-F4
  - **Blocked By**: Tasks 1-13

  **References**:
  - Vercel dashboards: raino-site and raino-studio
  - GitHub Actions: https://github.com/tudsds/raino/actions

  **Acceptance Criteria**:
  - [ ] `pnpm typecheck && pnpm lint && pnpm test && pnpm build` all pass
  - [ ] CI run is green on GitHub
  - [ ] raino-site.vercel.app renders all 5 pages
  - [ ] raino-studio.vercel.app loads login page
  - [ ] /api/health returns 200

  **QA Scenarios**:
  ```
  Scenario: Full verification passes
    Tool: Bash
    Steps:
      1. pnpm typecheck && pnpm lint && pnpm test && pnpm build
    Expected Result: All pass
    Evidence: .sisyphus/evidence/task-14-verify.txt

  Scenario: Sites are live
    Tool: Bash (curl)
    Steps:
      1. curl -sI https://raino-site.vercel.app/ | head -1
      2. curl -sI https://raino-studio.vercel.app/ | head -1
    Expected Result: Both return HTTP 200
    Evidence: .sisyphus/evidence/task-14-sites-live.txt
  ```

  **Commit**: YES (final push)
  - Message: `chore: finalize Phase 2 fixes and verify deployments`
  - Pre-commit: `pnpm typecheck && pnpm lint && pnpm test && pnpm build`

- [ ] 15. Manual user steps guide for GitHub settings + Vercel env vars

  **What to do**:
  Create a detailed step-by-step guide in `.sisyphus/drafts/manual-steps.md` for the user to perform manually. These are configuration changes that cannot be done via code.

  **Manual Step 1: GitHub Repository Settings**
  - URL: https://github.com/tudsds/raino
  - Click the gear icon ⚙️ next to "About" on the repo main page
  - In "Description": Type `Agentic PCB & PCBA Workflow Platform`
  - In "Website": Type `https://raino-site.vercel.app`
  - In "Topics": Add: `pcb`, `eda`, `kicad`, `nextjs`, `supabase`, `typescript`, `ai-agent`, `hardware`, `manufacturing`, `open-source`
  - Check "Include in the home page" for Website
  - Click "Save changes"

  **Manual Step 2: GitHub Discussions**
  - URL: https://github.com/tudsds/raino/settings
  - Scroll to "Features" section
  - Check "Discussions" checkbox
  - Click "Save changes" (or it saves automatically)

  **Manual Step 3: Vercel Environment Variables (CRITICAL — do after Task 6 is deployed)**
  - For **raino-studio** project:
    - URL: https://vercel.com/dashboard → Click raino-studio → Settings → Environment Variables
    - Find `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
    - Click the three dots → "Remove"
    - Add new variable: Name = `NEXT_PUBLIC_SUPABASE_ANON_KEY`, Value = (same value as the old PUBLISHABLE_KEY), Environments = Production + Preview + Development
    - Click "Save"
    - Redeploy: Deployments tab → Click "..." on latest → "Redeploy"
  - For **raino-site** project:
    - Same steps if it has the old variable name
    - Redeploy after updating

  **Manual Step 4: Supabase Redirect URLs**
  - URL: https://supabase.com/dashboard → Select your project → Authentication → URL Configuration
  - Under "Redirect URLs", ensure these are listed:
    - `https://raino-studio.vercel.app/auth/callback`
    - `http://localhost:3001/auth/callback`
  - Save if changes were made

  **Manual Step 5: Create First Release Tag**
  - URL: https://github.com/tudsds/raino/releases/new
  - Tag: `v0.1.0`
  - Target: `main` branch
  - Title: `v0.1.0 — Initial Public Release`
  - Description: `First public release of Raino. Includes marketing site, studio app, 8 packages, 4 worker services, and 692 tests.`
  - Check "This is a pre-release"
  - Click "Publish release"

  **Must NOT do**:
  - This task only creates the guide — it does NOT execute the steps
  - The user must perform these manually

  **Recommended Agent Profile**:
  - **Category**: `writing`
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 4
  - **Blocks**: User action (not code)
  - **Blocked By**: None

  **References**:
  - GitHub repo: https://github.com/tudsds/raino
  - Vercel dashboard: https://vercel.com/dashboard
  - Supabase dashboard: https://supabase.com/dashboard

  **Acceptance Criteria**:
  - [ ] `.sisyphus/drafts/manual-steps.md` exists with all 5 manual steps detailed

  **QA Scenarios**:
  ```
  Scenario: Manual steps guide exists
    Tool: Bash (ls)
    Steps:
      1. ls .sisyphus/drafts/manual-steps.md
    Expected Result: File exists
    Evidence: .sisyphus/evidence/task-15-guide.txt
  ```

  **Commit**: YES
  - Message: `docs: add manual configuration steps guide`
  - Files: .sisyphus/drafts/manual-steps.md

---

### Wave 5: Agent Enhancement, Integration Fixes & Content Overhaul

> Fixes critical integration mismatches, adds agent memory system inspired by reference frameworks,
> overhauls raino-site/raino-studio/README to match reference professionalism, adds legal acknowledgements.

- [ ] 16. Fix Supabase Storage Bucket Mismatch (CRITICAL)

  **What to do**:
  - Three different configurations exist for storage buckets — NONE match:
    - **User's actual Supabase**: `reports`, `artifacts`, `uploads` (all public, 50MB, any MIME)
    - **Code references**: `services/design-worker/src/queue/worker.ts:45` uses `'design-artifacts'`
    - **Migration creates**: `designs`, `documents`, `avatars` in `00004_storage_buckets.sql`
  - Standardize on the user's actual bucket names: `reports`, `artifacts`, `uploads`
  - Update `services/design-worker/src/queue/worker.ts` — change `STORAGE_BUCKET` from `'design-artifacts'` to `'artifacts'`
  - Update `packages/db/supabase/migrations/00004_storage_buckets.sql` — change bucket names from `designs`/`documents`/`avatars` to `reports`/`artifacts`/`uploads`
  - Update ALL RLS policies in the migration to reference the new bucket names
  - Search the ENTIRE codebase for any other references to `design-artifacts`, `designs`, `documents`, `avatars` as bucket names and update them
  - Add a comment in `.env.example` documenting the three bucket names and their purpose:
    - `reports` — Generated reports and audit trails
    - `artifacts` — Design artifacts (KiCad projects, Gerber files)
    - `uploads` — User-uploaded documents (datasheets, specs)

  **Must NOT do**:
  - Do NOT rename the user's actual Supabase buckets — change the code to match reality
  - Do NOT delete the migration file — modify it in place
  - Do NOT skip any file that references old bucket names

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Well-scoped search-and-replace with clear before/after values
  - **Skills**: []
  - **Skills Evaluated but Omitted**:
    - `git-master`: Not a git operation

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 5 (with Tasks 17, 18, 19)
  - **Blocks**: Tasks 20, 21, 22, F1-F4
  - **Blocked By**: None

  **References**:

  **Pattern References** (existing code to follow):
  - `services/design-worker/src/queue/worker.ts:45` — Current `STORAGE_BUCKET = 'design-artifacts'` — CHANGE THIS
  - `packages/db/supabase/migrations/00004_storage_buckets.sql` — Current migration creating `designs`, `documents`, `avatars` — CHANGE THIS
  - Supabase Storage docs: https://supabase.com/docs/guides/storage — Bucket creation patterns

  **API/Type References**:
  - `packages/db/src/server.ts` — Supabase server client that may reference bucket names

  **WHY Each Reference Matters**:
  - `worker.ts:45` — This is the PRIMARY consumer of the artifacts bucket; if wrong, design output is lost
  - `00004_storage_buckets.sql` — This migration creates buckets + RLS policies; must match actual Supabase

  **Acceptance Criteria**:
  - [ ] `grep -r "design-artifacts" --include="*.ts" --include="*.sql" .` returns ZERO matches
  - [ ] `grep -r "'designs'" --include="*.ts" --include="*.sql" .` returns ZERO matches (as bucket name)
  - [ ] Worker references `'artifacts'` bucket
  - [ ] Migration references `reports`, `artifacts`, `uploads`
  - [ ] `.env.example` has comment documenting bucket names

  **QA Scenarios**:
  ```
  Scenario: No stale bucket references in codebase
    Tool: Bash (grep)
    Preconditions: All files updated
    Steps:
      1. grep -rn "design-artifacts" --include="*.ts" --include="*.tsx" --include="*.sql" /mnt/d/raino/
      2. grep -rn "'designs'" --include="*.ts" --include="*.tsx" --include="*.sql" /mnt/d/raino/packages/db/
      3. grep -rn "'documents'" --include="*.sql" /mnt/d/raino/packages/db/
      4. grep -rn "'avatars'" --include="*.sql" /mnt/d/raino/packages/db/
    Expected Result: All four greps return zero matches (exit code 1 = no match found)
    Failure Indicators: Any match found means a stale bucket reference remains
    Evidence: .sisyphus/evidence/task-16-bucket-grep.txt

  Scenario: Worker uses correct bucket name
    Tool: Bash (grep)
    Preconditions: worker.ts updated
    Steps:
      1. grep -n "STORAGE_BUCKET" /mnt/d/raino/services/design-worker/src/queue/worker.ts
    Expected Result: Line shows STORAGE_BUCKET = 'artifacts'
    Failure Indicators: Any other bucket name
    Evidence: .sisyphus/evidence/task-16-worker-bucket.txt

  Scenario: Migration creates correct buckets
    Tool: Bash (grep)
    Preconditions: Migration file updated
    Steps:
      1. grep -n "INSERT INTO storage.buckets" /mnt/d/raino/packages/db/supabase/migrations/00004_storage_buckets.sql
    Expected Result: Three INSERT statements with names 'reports', 'artifacts', 'uploads'
    Failure Indicators: Any old bucket name (designs, documents, avatars)
    Evidence: .sisyphus/evidence/task-16-migration-buckets.txt
  ```

  **Commit**: YES (groups with 17)
  - Message: `fix(storage): resolve critical bucket name mismatch across code, migration, and Supabase`
  - Files: `services/design-worker/src/queue/worker.ts`, `packages/db/supabase/migrations/00004_storage_buckets.sql`, `.env.example`

- [ ] 17. Fix DigiKey OAuth Integration & Remove Dead Code

  **What to do**:
  - **DISCOVERY**: DigiKey API uses `client_credentials` (2-legged OAuth), NOT authorization code flow
  - The `DIGIKEY_REDIRECT_URI` env var in `.env.example` is dead code — no callback is needed
  - The current adapter at `packages/supplier-clients/src/digikey/real-adapter.ts` is CORRECT — it uses `grant_type: 'client_credentials'`
  - Remove `DIGIKEY_REDIRECT_URI` from `.env.example` — it is unused and misleading
  - Add a comment in the DigiKey adapter explaining this is 2-legged OAuth (no callback needed)
  - Verify no other files reference `DIGIKEY_REDIRECT_URI`
  - **CONSULT**: Read DigiKey API docs at https://developer.digikey.com/documentation before making changes

  **Must NOT do**:
  - Do NOT change the OAuth flow in the adapter — it's already correct
  - Do NOT create a callback route — it's unnecessary for client_credentials flow
  - Do NOT change the token endpoint or auth headers

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Removing one env var and adding comments
  - **Skills**: []
  - **Skills Evaluated but Omitted**:
    - `git-master`: Not a git operation

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 5 (with Tasks 16, 18, 19)
  - **Blocks**: Tasks 20, F1-F4
  - **Blocked By**: None

  **References**:

  **Pattern References**:
  - `packages/supplier-clients/src/digikey/real-adapter.ts:187` — Correct `grant_type: 'client_credentials'` implementation
  - DigiKey API docs: https://developer.digikey.com/documentation — Confirms 2-legged OAuth

  **WHY Each Reference Matters**:
  - `real-adapter.ts:187` — Already correct; verify and document, don't change flow
  - `.env.example` — Remove misleading `DIGIKEY_REDIRECT_URI`

  **Acceptance Criteria**:
  - [ ] `grep -r "DIGIKEY_REDIRECT_URI" .` returns ZERO matches in code files
  - [ ] `.env.example` has no `DIGIKEY_REDIRECT_URI` line
  - [ ] DigiKey adapter has comment explaining 2-legged OAuth

  **QA Scenarios**:
  ```
  Scenario: No DigiKey redirect URI references
    Tool: Bash (grep)
    Preconditions: Dead code removed
    Steps:
      1. grep -rn "DIGIKEY_REDIRECT_URI" /mnt/d/raino/ --include="*.ts" --include="*.env*" --include="*.example"
    Expected Result: Zero matches
    Failure Indicators: Any file still references DIGIKEY_REDIRECT_URI
    Evidence: .sisyphus/evidence/task-17-digikey-cleanup.txt

  Scenario: DigiKey adapter still works with client_credentials
    Tool: Bash (grep)
    Preconditions: Comments added
    Steps:
      1. grep -n "client_credentials" /mnt/d/raino/packages/supplier-clients/src/digikey/real-adapter.ts
    Expected Result: Found at the correct line with grant_type
    Failure Indicators: Missing or changed to wrong grant type
    Evidence: .sisyphus/evidence/task-17-digikey-adapter.txt
  ```

  **Commit**: YES (groups with 16)
  - Message: `fix(supplier): remove misleading DigiKey OAuth redirect URI, document 2-legged flow`
  - Files: `.env.example`, `packages/supplier-clients/src/digikey/real-adapter.ts`

- [ ] 18. Add Raino Agent Memory System (Inspired by MemPalace + Nanobot + OpenClaw)

  **What to do**:
  - Implement a 4-layer agent memory system inspired by reference framework research:
    - **L0 Identity** (~100 tokens): `SOUL.md` — Raino's core identity, personality, constraints
    - **L1 Essential Context** (~500-800 tokens): `IDENTITY.md` — Current project state, active agents, key decisions
    - **L2 On-Demand Memory** (~200-500 tokens): `MEMORY.md` — Recent interactions, session context, scratch pad
    - **L3 Deep Knowledge**: RAG-backed retrieval via existing pgvector infrastructure
  - Create the following bootstrap files at project root (inspired by OpenClaw/Nanobot patterns):
    - `SOUL.md` — Raino's identity, personality traits, design philosophy, constraints (modeled on OpenClaw's SOUL.md)
    - `TOOLS.md` — Inventory of all Raino tools/agents with descriptions (modeled on OpenClaw's TOOLS.md)
    - `IDENTITY.md` — Agent behavior template with prompt modes (full, minimal, none) (modeled on OpenClaw's AGENTS.md user template)
  - Extend `packages/agents/src/` with a new `memory/` directory:
    - `packages/agents/src/memory/context-builder.ts` — Assembles context from L0-L3 layers (modeled on Nanobot's ContextBuilder)
    - `packages/agents/src/memory/memory-store.ts` — File-based + Supabase-backed memory persistence
    - `packages/agents/src/memory/dream-consolidator.ts` — Periodic memory cleanup/summarization (modeled on Nanobot's Dream Memory)
    - `packages/agents/src/memory/types.ts` — TypeScript types for memory layers
  - The `context-builder.ts` should:
    - Load SOUL.md + IDENTITY.md + MEMORY.md on each agent invocation
    - Estimate token count per layer, enforce budgets (L0: 100, L1: 800, L2: 500)
    - Trigger L3 RAG retrieval when context budget would overflow (modeled on Opencode's 20K buffer compaction)
    - Include overflow detection (if total context > 80% of model context window, auto-compact L2)
  - The `dream-consolidator.ts` should:
    - Run after each workflow stage completes
    - Summarize L2 (recent interactions) into L1 (essential context)
    - Prune entries older than a configurable TTL (default: 30 days)
    - Use Kimi K2.5 for summarization via existing `@raino/llm` package

  **Must NOT do**:
  - Do NOT install new npm dependencies — use existing `@raino/llm`, `@raino/db`, `fs` module
  - Do NOT modify existing agent orchestration code — ADD new memory module alongside
  - Do NOT change existing prompt files in `prompts/` directory
  - Do NOT make this overly complex — keep it file-based with Supabase as persistence layer

  **Recommended Agent Profile**:
  - **Category**: `deep`
    - Reason: Requires understanding multiple reference architectures and designing a cohesive system
  - **Skills**: []
  - **Skills Evaluated but Omitted**:
    - `git-master`: Not a git operation

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 5 (with Tasks 16, 17, 19)
  - **Blocks**: Tasks 20, 21, 22, F1-F4
  - **Blocked By**: None

  **References**:

  **Pattern References**:
  - `packages/agents/src/` — Current agent orchestration code; memory module lives alongside
  - `packages/llm/src/` — Kimi K2.5 gateway; use for summarization in dream-consolidator
  - `packages/db/src/server.ts` — Supabase server client; use for persistence layer

  **API/Type References**:
  - `packages/core/src/schemas/` — Existing Zod schemas; add memory-related schemas
  - `packages/rag/src/` — Existing RAG infrastructure; L3 deep knowledge layer uses this

  **External References**:
  - MemPalace: https://github.com/milla-jovovich/mempalace — L0-L3 memory stack, agent discovery
  - Nanobot: https://github.com/HKUDS/nanobot — ContextBuilder, Dream consolidation, file-based memory
  - OpenClaw: https://github.com/openclaw/openclaw — SOUL.md, TOOLS.md, IDENTITY.md bootstrap files
  - Opencode: https://github.com/anomalyco/opencode — Context compaction with 20K buffer

  **WHY Each Reference Matters**:
  - `packages/agents/src/` — New memory module must export cleanly without breaking existing orchestration
  - `packages/llm/src/` — Dream consolidator calls Kimi for summarization; reuse existing retry/backoff logic
  - `packages/rag/src/` — L3 layer is already implemented; just wire context-builder to call existing retrieval

  **Acceptance Criteria**:
  - [ ] `SOUL.md`, `TOOLS.md`, `IDENTITY.md` exist at project root
  - [ ] `packages/agents/src/memory/` directory exists with 4 files
  - [ ] `context-builder.ts` exports a `buildContext()` function that assembles L0-L3
  - [ ] `dream-consolidator.ts` exports a `consolidate()` function
  - [ ] `pnpm typecheck` passes with new files
  - [ ] `pnpm test` still passes (692+ tests)

  **QA Scenarios**:
  ```
  Scenario: Memory bootstrap files exist and are well-formed
    Tool: Bash (cat/wc)
    Preconditions: Files created
    Steps:
      1. test -f /mnt/d/raino/SOUL.md && echo "SOUL.md exists"
      2. test -f /mnt/d/raino/TOOLS.md && echo "TOOLS.md exists"
      3. test -f /mnt/d/raino/IDENTITY.md && echo "IDENTITY.md exists"
      4. wc -l /mnt/d/raino/SOUL.md /mnt/d/raino/TOOLS.md /mnt/d/raino/IDENTITY.md
    Expected Result: All three files exist, each has 20-200 lines (not empty, not bloated)
    Failure Indicators: Any file missing or empty (0 lines)
    Evidence: .sisyphus/evidence/task-18-bootstrap-files.txt

  Scenario: Memory module compiles and exports correctly
    Tool: Bash (pnpm)
    Preconditions: Code written
    Steps:
      1. pnpm typecheck 2>&1 | tail -5
    Expected Result: "Tasks: ... successful, ... tasks completed, ... errors"
    Failure Indicators: TypeScript errors in memory module files
    Evidence: .sisyphus/evidence/task-18-typecheck.txt

  Scenario: Context builder assembles layers
    Tool: Bash (node)
    Preconditions: Module built
    Steps:
      1. node -e "const { buildContext } = require('./packages/agents/src/memory/context-builder'); console.log(typeof buildContext);"
    Expected Result: "function" — the buildContext export exists
    Failure Indicators: Module not found or export missing
    Evidence: .sisyphus/evidence/task-18-context-builder.txt

  Scenario: Existing tests still pass
    Tool: Bash (pnpm)
    Preconditions: Memory module added
    Steps:
      1. pnpm test 2>&1 | tail -10
    Expected Result: 692+ tests pass, 0 fail
    Failure Indicators: Any test failure
    Evidence: .sisyphus/evidence/task-18-tests.txt
  ```

  **Commit**: YES
  - Message: `feat(agents): add 4-layer agent memory system with dream consolidation`
  - Files: `SOUL.md`, `TOOLS.md`, `IDENTITY.md`, `packages/agents/src/memory/*`
  - Pre-commit: `pnpm typecheck && pnpm test`

- [ ] 19. Add Legal Acknowledgements (NOTICES.md)

  **What to do**:
  - Create `NOTICES.md` at project root — NOT in README or website (user's explicit requirement)
  - Follow the legal acknowledgement patterns from reference frameworks:
    - **OpenClaw**: Has a `credits.md` page at `docs/reference/credits.md` — lists all inspirations with license info
    - **Oh-my-opencode**: "Author's Note" section in README credits influences — we go further with dedicated file
    - **Hermes Agent**: MIT license with proper attribution
    - **EvoMap**: GPL-3.0 with contributor acknowledgements
  - Structure of NOTICES.md:
    ```markdown
    # Notices & Acknowledgements

    ## Raino License
    Raino is released under the MIT License. See [LICENSE](LICENSE) for full text.

    ## Third-Party Open Source Acknowledgements
    The following open-source projects inspired or informed Raino's architecture:

    ### Agent Frameworks
    - **Oh-my-opencode** — Dual-prompt agent orchestration, hook system, MCP integration
      - Repository: https://github.com/code-yeongyu/oh-my-openagent
      - License: SUL-1.0
    - **Opencode** — Context compaction, skill system, agent memory patterns
      - Repository: https://github.com/anomalyco/opencode
      - License: MIT
    - **OpenHarness** — Multi-agent benchmarking and evaluation framework
      - Repository: https://github.com/HKUDS/OpenHarness
      - License: MIT
    - **MemPalace** — 4-layer memory stack (L0-L3), agent discovery, knowledge graph
      - Repository: https://github.com/milla-jovovich/mempalace
      - License: MIT
    - **Hermes Agent** — Self-improving agent loop, structured output patterns
      - Repository: https://github.com/NousResearch/hermes-agent
      - License: MIT
    - **EvoMap** — GEP protocol, memory graph with confidence decay, skill distillation
      - Repository: https://github.com/EvoMap/evolver
      - License: GPL-3.0
    - **OpenClaw** — Bootstrap files (SOUL.md, TOOLS.md, IDENTITY.md), skill system, docs structure
      - Repository: https://github.com/openclaw/openclaw
      - License: MIT
    - **Nanobot** — File-based memory, dream consolidation, ContextBuilder pattern
      - Repository: https://github.com/HKUDS/nanobot
      - License: MIT

    ### Platform Integrations
    - **KiCad** — EDA tool (external GPL boundary, not embedded)
    - **Supabase** — Auth, database, storage, pgvector
    - **Moonshot AI (Kimi)** — LLM reasoning via OpenAI-compatible API
    - **DigiKey** — Component search API
    - **Mouser** — Component search API
    - **JLCPCB/LCSC** — Component search API
    ```
  - Add a brief reference to NOTICES.md at the END of README.md (after License section):
    ```
    ## Acknowledgements
    See [NOTICES.md](NOTICES.md) for third-party attributions and licence information.
    ```
  - Do NOT add acknowledgements to the marketing site or studio app — only in the repo

  **Must NOT do**:
  - Do NOT add acknowledgements to README body — only a one-liner reference at the end
  - Do NOT add acknowledgements to raino-site or raino-studio
  - Do NOT claim code was copied — use "inspired" or "informed" language
  - Do NOT list EvoMap as MIT — it is GPL-3.0

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Creating a well-structured markdown file with known content
  - **Skills**: []
  - **Skills Evaluated but Omitted**:
    - `writing`: Content is technical/legal, not creative prose

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 5 (with Tasks 16, 17, 18)
  - **Blocks**: Tasks 20, F1-F4
  - **Blocked By**: None

  **References**:

  **Pattern References**:
  - OpenClaw credits: `docs/reference/credits.md` pattern — list with license per entry
  - Oh-my-opencode: Author's Note section in README — credit style language

  **External References**:
  - All 8 framework repos (URLs in NOTICES.md content above)
  - License texts for each: MIT, SUL-1.0, GPL-3.0

  **WHY Each Reference Matters**:
  - OpenClaw pattern is the gold standard for this — structured, per-project, with license
  - Must get each license right (EvoMap = GPL-3.0, oh-my-opencode = SUL-1.0)

  **Acceptance Criteria**:
  - [ ] `NOTICES.md` exists at project root
  - [ ] All 8 frameworks listed with correct license
  - [ ] README.md has one-line reference to NOTICES.md at the end
  - [ ] No acknowledgements in raino-site or raino-studio pages

  **QA Scenarios**:
  ```
  Scenario: NOTICES.md exists with all 8 frameworks
    Tool: Bash (grep)
    Preconditions: File created
    Steps:
      1. grep -c "Repository:" /mnt/d/raino/NOTICES.md
    Expected Result: Count >= 8 (one per framework)
    Failure Indicators: Fewer than 8 means a framework was missed
    Evidence: .sisyphus/evidence/task-19-notices.txt

  Scenario: Correct licenses listed
    Tool: Bash (grep)
    Preconditions: File created
    Steps:
      1. grep -n "GPL-3.0" /mnt/d/raino/NOTICES.md
      2. grep -n "SUL-1.0" /mnt/d/raino/NOTICES.md
      3. grep -c "MIT" /mnt/d/raino/NOTICES.md
    Expected Result: GPL-3.0 found (EvoMap), SUL-1.0 found (oh-my-opencode), MIT count >= 5
    Failure Indicators: Wrong license assigned to any framework
    Evidence: .sisyphus/evidence/task-19-licenses.txt

  Scenario: README references NOTICES.md
    Tool: Bash (grep)
    Preconditions: README updated
    Steps:
      1. grep -n "NOTICES.md" /mnt/d/raino/README.md
    Expected Result: Found, at line near end of file (after License section)
    Failure Indicators: Missing or placed before License section
    Evidence: .sisyphus/evidence/task-19-readme-ref.txt
  ```

  **Commit**: YES
  - Message: `docs: add NOTICES.md with third-party acknowledgements and licence info`
  - Files: `NOTICES.md`, `README.md`

- [ ] 20. Overhaul raino-site to Match Reference Framework Professionalism

  **What to do**:
  - Based on analysis of 8 reference framework websites, raino-site needs these new pages:
    - **`/showcase`** — Projects built with Raino (inspired by OpenClaw's Showcase page)
    - **`/integrations`** — Grid of all integrations (Kimi, Supabase, DigiKey, Mouser, JLCPCB, KiCad) with logos and descriptions (inspired by OpenClaw's Integrations page)
    - **`/changelog`** — Version history and release notes (inspired by reference frameworks)
    - **`/trust`** — Security, privacy, no-fake-integration policy (inspired by OpenClaw's Trust page)
  - Enhance existing pages:
    - **Homepage**: Add "Loved by engineers" section (inspired by oh-my-opencode), add integration logos grid (inspired by OpenClaw), add animated architecture diagram
    - **Workflow page**: Add interactive step-by-step visualization (currently just static text)
    - **Docs page**: Add sidebar navigation, API reference section, deployment guide
  - Add proper SEO meta to ALL pages:
    - Unique `<title>` per page: "Raino — Agentic PCB Design", "Raino — Workflow", etc.
    - Open Graph tags: `og:title`, `og:description`, `og:image`, `og:url`
    - Twitter Card tags: `twitter:card`, `twitter:title`, `twitter:description`
  - Fix footer inconsistency: All pages should use the rich 4-column footer (currently only homepage has it)
  - Add favicon (Raino logo or pixel-art icon matching design system)
  - Add mobile hamburger menu (currently nav is `hidden md:flex` with no mobile alternative)
  - **CONSULT**: Study OpenClaw website structure (7 pages: Home, Blog, Showcase, Press, Shoutouts, Integrations, Trust) before implementing

  **Must NOT do**:
  - Do NOT change the pixel-art cyberpunk design system (`packages/ui`)
  - Do NOT add i18n system
  - Do NOT use placeholder text — all content must be real and meaningful
  - Do NOT add emoji to page titles or buttons
  - Do NOT change the monorepo structure or build config

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: UI/UX work requiring design sensibility, multiple pages, layout design
  - **Skills**: [`frontend-ui-ux`]
    - `frontend-ui-ux`: Multiple page layouts, responsive design, SEO meta tags

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 5 (with Tasks 18, 19, 21)
  - **Blocks**: Task 22, F1-F4
  - **Blocked By**: Task 3 (shared Navbar/Footer layout — if not yet merged, handle conflicts)

  **References**:

  **Pattern References**:
  - `apps/site/src/components/Navbar.tsx` — Current navbar (needs mobile hamburger)
  - `apps/site/src/app/page.tsx` — Homepage (needs integration logos, testimonials)
  - `apps/site/src/app/workflow/page.tsx` — Workflow page (needs interactive viz)
  - `apps/site/src/app/docs/page.tsx` — Docs page (needs sidebar, API reference)

  **API/Type References**:
  - `packages/ui/` — Design system components to use
  - `apps/site/src/app/layout.tsx` — Root layout (needs favicon, meta)

  **External References**:
  - OpenClaw website: https://openclaw.ai — Showcase, Integrations, Trust page patterns
  - Oh-my-opencode: "Loved by professionals" section pattern
  - Tailwind CSS v4 docs: For responsive hamburger menu pattern

  **WHY Each Reference Matters**:
  - `Navbar.tsx` — Must add hamburger menu; current `hidden md:flex` hides nav on mobile with no alternative
  - `layout.tsx` — Must add favicon and default meta tags
  - OpenClaw website — Best reference for page structure (7 pages with clear purpose)

  **Acceptance Criteria**:
  - [ ] `/showcase`, `/integrations`, `/changelog`, `/trust` pages exist and render
  - [ ] Each page has unique `<title>` and OG/Twitter meta tags
  - [ ] Footer is consistent across all pages (rich 4-column)
  - [ ] Favicon is present in browser tab
  - [ ] Mobile hamburger menu works on all pages
  - [ ] No placeholder text anywhere
  - [ ] `pnpm build` succeeds for `@raino/site`

  **QA Scenarios**:
  ```
  Scenario: All new pages render correctly
    Tool: Bash (curl)
    Preconditions: Site built and running
    Steps:
      1. curl -s -o /dev/null -w "%{http_code}" https://raino-site.vercel.app/showcase
      2. curl -s -o /dev/null -w "%{http_code}" https://raino-site.vercel.app/integrations
      3. curl -s -o /dev/null -w "%{http_code}" https://raino-site.vercel.app/changelog
      4. curl -s -o /dev/null -w "%{http_code}" https://raino-site.vercel.app/trust
    Expected Result: All return HTTP 200
    Failure Indicators: Any 404 or 500
    Evidence: .sisyphus/evidence/task-20-pages.txt

  Scenario: Unique meta titles per page
    Tool: Bash (curl + grep)
    Preconditions: Pages deployed
    Steps:
      1. curl -s https://raino-site.vercel.app/ | grep -o '<title>[^<]*</title>'
      2. curl -s https://raino-site.vercel.app/workflow | grep -o '<title>[^<]*</title>'
      3. curl -s https://raino-site.vercel.app/docs | grep -o '<title>[^<]*</title>'
      4. curl -s https://raino-site.vercel.app/showcase | grep -o '<title>[^<]*</title>'
    Expected Result: Each page has a DIFFERENT <title> tag
    Failure Indicators: Any two pages share the same <title>
    Evidence: .sisyphus/evidence/task-20-titles.txt

  Scenario: Mobile hamburger menu exists in DOM
    Tool: Bash (grep)
    Preconditions: Navbar updated
    Steps:
      1. grep -n "md:hidden" /mnt/d/raino/apps/site/src/components/Navbar.tsx
    Expected Result: At least one element with md:hidden (mobile-only menu button)
    Failure Indicators: No mobile-specific element found
    Evidence: .sisyphus/evidence/task-20-hamburger.txt

  Scenario: Favicon exists
    Tool: Bash (ls)
    Preconditions: Favicon added
    Steps:
      1. ls /mnt/d/raino/apps/site/src/app/favicon.ico || ls /mnt/d/raino/apps/site/src/app/icon.svg
    Expected Result: At least one favicon file exists
    Failure Indicators: Neither file found
    Evidence: .sisyphus/evidence/task-20-favicon.txt
  ```

  **Commit**: YES
  - Message: `feat(site): add showcase, integrations, changelog, trust pages with SEO and mobile nav`
  - Files: `apps/site/src/app/showcase/`, `apps/site/src/app/integrations/`, `apps/site/src/app/changelog/`, `apps/site/src/app/trust/`, `apps/site/src/components/Navbar.tsx`, `apps/site/src/app/layout.tsx`, `apps/site/src/app/page.tsx`
  - Pre-commit: `pnpm build --filter @raino/site`

- [ ] 21. Overhaul raino-studio UX and Add Settings Page

  **What to do**:
  - Based on analysis of reference frameworks, raino-studio needs these enhancements:
    - **Settings page** (`/settings`): User profile, integration status panel (showing which adapters are live vs fixture), API key configuration UI
    - **Integration status indicators**: In the dashboard, show real-time status of each integration (Kimi, Supabase, DigiKey, Mouser, JLCPCB) — green = live, yellow = degraded, red = error
    - **Enhanced activity feed**: Show design job history with status (pending, running, complete, failed) and timestamps
  - Fix the auth inconsistency:
    - Login uses `signInWithOtp` (magic link) — CORRECT per architecture
    - Signup uses `signUp` with email+password — WRONG, should use magic link too
    - Update signup to use `signInWithOtp` for consistency
  - Fix the CSS typo in intake page (if not already fixed by Task 1):
    - `apps/studio/src/app/projects/[id]/intake/page.tsx:179` has `py-32xl` — if still present, change to `py-3`
    - Note: Task 1 should have already fixed this in Wave 1. Verify and skip if already done.
  - Fix the downloads page tab navigation (currently incomplete)
  - Add proper loading states and error boundaries to all pages
  - **CONSULT**: Study Supabase Auth docs at https://supabase.com/docs/guides/auth/server-side-rendering for correct magic link pattern

  **Must NOT do**:
  - Do NOT change the pixel-art cyberpunk design system
  - Do NOT add new npm dependencies
  - Do NOT modify existing auth callback logic (it works correctly)
  - Do NOT change the monorepo structure

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: UI/UX work with multiple pages, status indicators, and layout design
  - **Skills**: [`frontend-ui-ux`]
    - `frontend-ui-ux`: Settings page layout, status indicators, responsive design

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 5 (with Tasks 18, 19, 20)
  - **Blocks**: Task 22, F1-F4
  - **Blocked By**: None

  **References**:

  **Pattern References**:
  - `apps/studio/src/app/signup/page.tsx` — Current signup with password; needs magic link
  - `apps/studio/src/app/projects/[id]/intake/page.tsx:179` — `py-32xl` typo
  - `apps/studio/src/app/(dashboard)/` — Dashboard layout for status indicators
  - `apps/studio/src/app/downloads/` — Downloads page with incomplete tab nav

  **API/Type References**:
  - `packages/db/src/browser.ts` — Supabase browser client for settings page
  - `packages/supplier-clients/src/factory.ts` — Factory pattern to check adapter status

  **External References**:
  - Supabase Auth SSR docs: https://supabase.com/docs/guides/auth/server-side-rendering
  - Supabase magic link: `signInWithOtp` API reference

  **WHY Each Reference Matters**:
  - `signup/page.tsx` — Must change from password auth to magic link to match login flow
  - `intake/page.tsx:179` — `py-32xl` is invalid Tailwind; causes layout issues
  - `factory.ts` — Use factory to determine which adapters are live vs fixture

  **Acceptance Criteria**:
  - [ ] `/settings` page exists with integration status panel
  - [ ] Signup page uses magic link (no password field)
  - [ ] No `py-32xl` in intake page (fixed to `py-32`)
  - [ ] Downloads page tab nav is complete
  - [ ] Loading states on all pages with async data
  - [ ] `pnpm build --filter @raino/studio` succeeds

  **QA Scenarios**:
  ```
  Scenario: Settings page renders
    Tool: Bash (curl)
    Preconditions: Studio built and deployed
    Steps:
      1. curl -s -o /dev/null -w "%{http_code}" https://raino-studio.vercel.app/settings
    Expected Result: HTTP 200 (or 302 to login if not authenticated — both acceptable)
    Failure Indicators: HTTP 404 or 500
    Evidence: .sisyphus/evidence/task-21-settings.txt

  Scenario: No py-32xl in intake page
    Tool: Bash (grep)
    Preconditions: File updated
    Steps:
      1. grep -rn "py-32xl" /mnt/d/raino/apps/studio/
    Expected Result: Zero matches (exit code 1)
    Failure Indicators: Any match found means typo not fixed
    Evidence: .sisyphus/evidence/task-21-css-fix.txt

  Scenario: Signup page has no password field
    Tool: Bash (grep)
    Preconditions: Signup page updated
    Steps:
      1. grep -n "type=\"password\"" /mnt/d/raino/apps/studio/src/app/signup/page.tsx
    Expected Result: Zero matches
    Failure Indicators: Password field still present
    Evidence: .sisyphus/evidence/task-21-signup.txt

  Scenario: Studio builds successfully
    Tool: Bash (pnpm)
    Preconditions: All changes made
    Steps:
      1. pnpm build --filter @raino/studio 2>&1 | tail -10
    Expected Result: Build succeeds
    Failure Indicators: Build errors
    Evidence: .sisyphus/evidence/task-21-build.txt
  ```

  **Commit**: YES
  - Message: `feat(studio): add settings page, fix auth consistency, enhance UX`
  - Files: `apps/studio/src/app/settings/`, `apps/studio/src/app/signup/page.tsx`, `apps/studio/src/app/projects/[id]/intake/page.tsx`, `apps/studio/src/app/downloads/`, `apps/studio/src/app/(dashboard)/`
  - Pre-commit: `pnpm build --filter @raino/studio`

- [ ] 22. Wire Resend for Sending Design Documents via Email

  **What to do**:
  - Install `resend` npm package in `apps/studio`
  - **CONSULT**: Read Resend docs at https://resend.com/docs/api-reference/emails/send-email before implementing

  **Part 1: Create Email Infrastructure**
  - Create `apps/studio/src/lib/resend.ts` — Resend client initialization:
    ```typescript
    import { Resend } from 'resend';
    export const resend = new Resend(process.env.RESEND_API_KEY);
    ```
  - Create `apps/studio/src/lib/email.ts` — Email sending functions:
    - `sendDesignQuoteEmail({ to, projectName, artifacts })` — Sends design documents to user for a better quote
    - Uses the `path` attachment approach with Supabase Storage public URLs (Resend fetches files server-side, no buffering needed)
    - Max email size: 40MB total (including Base64-encoded attachments)
    - Rate limit: 5 req/sec (per team)

  **Part 2: Create API Route for Sending Quote Email**
  - Create `apps/studio/src/app/api/quotes/send-email/route.ts`:
    - POST endpoint accepting `{ projectId, artifactUrls, userEmail }`
    - Requires authentication (check session)
    - Validates with Zod schema
    - Fetches Supabase public URLs for design artifacts from the `artifacts` bucket
    - Calls `sendDesignQuoteEmail()` with attachments using `path` parameter
    - Returns `{ success: true, emailId }` or `{ success: false, error }`
  - **CONSULT**: Read Supabase Storage docs at https://supabase.com/docs/guides/storage for public URL retrieval

  **Part 3: Add "Send for Better Quote" UI**
  - In the quotes/results page of the studio, add a "Request Professional Quote" button
  - When clicked, shows a modal/dialog asking:
    - "Would you like us to send your design files to a manufacturer for a professional quote?"
    - Email input field (pre-filled with user's email from session)
    - Checkbox: "Include Gerber files" (default: checked)
    - Checkbox: "Include BOM" (default: checked)
    - Checkbox: "Include schematic" (default: unchecked)
    - "Send" and "Cancel" buttons
  - On submit, calls `/api/quotes/send-email` route
  - Shows success/error toast notification

  **Part 4: Update .env.example**
  - Keep `RESEND_API_KEY` — now it's actually used
  - Add `RESEND_FROM_EMAIL` — The verified sender email (e.g., `Raino <quotes@yourdomain.com>`)
  - Add comment explaining that for testing, use `onboarding@resend.dev` as the from address
  - Add comment: "Resend is used for sending design documents to users for professional quotes"

  **Must NOT do**:
  - Do NOT use `@react-email/components` — adds unnecessary dependency. Use plain HTML email template.
  - Do NOT buffer large files in serverless memory — always use `path` (URL) approach for attachments
  - Do NOT hardcode the from email — use `RESEND_FROM_EMAIL` env var
  - Do NOT send emails without checking auth

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Multi-part task requiring API route, email template, UI modal, and Supabase integration
  - **Skills**: [`frontend-ui-ux`]
    - `frontend-ui-ux`: The "Send for Better Quote" modal UI needs good design

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 5 (with Tasks 20, 21)
  - **Blocks**: F1-F4
  - **Blocked By**: Task 16 (storage bucket names must be correct before wiring)

  **References**:

  **Pattern References**:
  - `apps/studio/src/app/api/` — Existing API route patterns (auth, validation, error handling)
  - `apps/studio/src/app/projects/[id]/quotes/` — Quote display page (where the button goes)
  - `packages/db/src/server.ts` — Supabase server client for storage URL retrieval

  **API/Type References**:
  - Resend `send()` API: `{ from, to, subject, html, attachments: [{ path, filename, content_type }] }`
  - Supabase Storage: `supabase.storage.from('artifacts').getPublicUrl('path/to/file')`

  **External References**:
  - Resend docs: https://resend.com/docs/api-reference/emails/send-email — Send API with attachments
  - Resend attachments: Use `path` for remote URLs, `content` for Base64. `path` is preferred for Supabase.
  - Supabase Storage public URLs: `https://[project_id].supabase.co/storage/v1/object/public/[bucket]/[filepath]`
  - Resend rate limit: 5 req/sec. Free plan: 3,000 emails/month.

  **WHY Each Reference Matters**:
  - `apps/studio/src/app/api/` — Must match existing route pattern (auth check, Zod validation, error response)
  - Supabase Storage public URL — The `path` parameter in Resend attachment needs a publicly accessible URL
  - Quote display page — The "Request Professional Quote" button goes here
  - Resend `path` approach — Avoids buffering large files in serverless function memory

  **Acceptance Criteria**:
  - [ ] `resend` package installed in `apps/studio`
  - [ ] `apps/studio/src/lib/resend.ts` exists and initializes client
  - [ ] `apps/studio/src/lib/email.ts` exists with `sendDesignQuoteEmail()` function
  - [ ] `apps/studio/src/app/api/quotes/send-email/route.ts` exists with POST handler
  - [ ] "Request Professional Quote" button exists on quote results page
  - [ ] Modal/dialog with email input and file selection checkboxes
  - [ ] `.env.example` has `RESEND_API_KEY` and `RESEND_FROM_EMAIL` with usage comments
  - [ ] `pnpm build --filter @raino/studio` succeeds

  **QA Scenarios**:
  ```
  Scenario: Resend package installed and client initialized
    Tool: Bash (grep)
    Preconditions: Package installed
    Steps:
      1. grep -n "from 'resend'" /mnt/d/raino/apps/studio/src/lib/resend.ts
    Expected Result: "import { Resend } from 'resend';" found
    Failure Indicators: Package not installed or import missing
    Evidence: .sisyphus/evidence/task-22-resend-init.txt

  Scenario: Send email API route exists and handles auth
    Tool: Bash (grep)
    Preconditions: Route created
    Steps:
      1. grep -n "POST" /mnt/d/raino/apps/studio/src/app/api/quotes/send-email/route.ts
      2. grep -n "session\|auth" /mnt/d/raino/apps/studio/src/app/api/quotes/send-email/route.ts
    Expected Result: POST handler found, auth check found
    Failure Indicators: Missing route or no auth check
    Evidence: .sisyphus/evidence/task-22-api-route.txt

  Scenario: UI button exists on quote page
    Tool: Bash (grep)
    Preconditions: UI added
    Steps:
      1. grep -rn "Request Professional Quote\|send-email\|better quote" /mnt/d/raino/apps/studio/src/app/
    Expected Result: At least one match in the quotes/results area
    Failure Indicators: Button not added
    Evidence: .sisyphus/evidence/task-22-ui-button.txt

  Scenario: Email function uses path-based attachments
    Tool: Bash (grep)
    Preconditions: email.ts created
    Steps:
      1. grep -n "path:" /mnt/d/raino/apps/studio/src/lib/email.ts
    Expected Result: Attachment objects use "path" (Supabase public URL)
    Failure Indicators: Uses "content" with buffering instead
    Evidence: .sisyphus/evidence/task-22-path-attachments.txt

  Scenario: Studio builds successfully
    Tool: Bash (pnpm)
    Preconditions: All changes made
    Steps:
      1. pnpm build --filter @raino/studio 2>&1 | tail -10
    Expected Result: Build succeeds
    Failure Indicators: Build errors
    Evidence: .sisyphus/evidence/task-22-build.txt
  ```

  **Manual User Steps Required** (after code is deployed):
  Atlas should create `.sisyphus/drafts/manual-steps-resend.md` with these exact steps:
  1. **Verify Resend domain**: Go to https://resend.com/domains → Add Domain → enter `quotes.yourdomain.com` → Add the provided DNS records (SPF, DKIM) to your DNS provider → Click "Verify DNS"
  2. **Set RESEND_FROM_EMAIL in Vercel**: Go to https://vercel.com/dashboard → Select raino-studio project → Settings → Environment Variables → Add `RESEND_FROM_EMAIL` = `Raino <quotes@yourdomain.com>` (use `onboarding@resend.dev` for testing)
  3. **Set RESEND_API_KEY in Vercel**: Ensure `RESEND_API_KEY` is set in raino-studio's Vercel environment variables (Settings → Environment Variables)

  **Commit**: YES
  - Message: `feat(studio): wire Resend for sending design documents via email for professional quotes`
  - Files: `apps/studio/src/lib/resend.ts`, `apps/studio/src/lib/email.ts`, `apps/studio/src/app/api/quotes/send-email/route.ts`, `apps/studio/src/app/projects/[id]/quotes/`, `.env.example`
  - Pre-commit: `pnpm build --filter @raino/studio`

---

### Wave 6: Post-Fix Comprehensive Audit Cycle

> After Waves 1-5 are deployed, conduct TWO full audit rounds to verify all fixes.
> Each round audits the ENTIRE product — not just the fixes.
> Atlas must CONSULT OFFICIAL DOCS during audit, and STOP AND ASK if blocked.

- [ ] 23. Post-Fix Comprehensive Audit (Round 1)

  **What to do**:
  - Deploy all Waves 1-5 changes to GitHub and Vercel (push to main, wait for CI green, verify deployment)
  - Conduct a FULL re-audit of the entire product, covering:
    - **raino-site.vercel.app**: Every page (existing + new), every link, every form, mobile responsiveness, SEO meta, accessibility
    - **raino-studio.vercel.app**: Login flow, dashboard, intake form, design workflow, BOM, quotes, downloads, settings, all API routes
    - **GitHub repo**: README, NOTICES.md, SOUL.md, TOOLS.md, IDENTITY.md, community files, CI, PR templates
    - **Codebase**: `pnpm typecheck`, `pnpm lint`, `pnpm test` — all must pass
    - **External integrations**: Verify each supplier adapter (DigiKey, Mouser, JLCPCB) in degraded mode; verify Supabase storage bucket alignment; verify Kimi model is correct
    - **Agent memory system**: Verify context-builder loads SOUL.md, TOOLS.md, IDENTITY.md; verify dream-consolidator runs
  - **CONSULT**: Check official docs for each platform (Kimi, Supabase, JLCPCB, DigiKey, Mouser) to verify integration correctness
  - **STOP AND ASK**: If blocked on any configuration or credential issue, create a step-by-step guide for the user
  - Record ALL findings in `.sisyphus/evidence/audit-round-1/` directory
  - Create a summary report at `.sisyphus/drafts/audit-round-1-report.md` with:
    - List of all issues found (severity, description, affected file/component)
    - List of all verifications passed
    - Any manual steps needed from user

  **Must NOT do**:
  - Do NOT fix issues during audit — just record them
  - Do NOT skip any page, route, or integration
  - Do NOT fabricate test results — run actual commands

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Comprehensive QA requiring multiple tools, thoroughness, and critical thinking
  - **Skills**: [`playwright`]
    - `playwright`: Browser automation for testing site and studio UI

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Sequential (Wave 6 start)
  - **Blocks**: Task 24
  - **Blocked By**: ALL Waves 1-5 tasks (Tasks 1-22)

  **References**:

  **Pattern References**:
  - `.sisyphus/evidence/` — Previous audit evidence from Phase 2 initial audit
  - `.sisyphus/drafts/audit-round-1-report.md` — Output report location

  **API/Type References**:
  - All API routes in `apps/studio/src/app/api/` — Must test each one
  - All pages in `apps/site/src/app/` — Must visit each one

  **External References**:
  - Kimi docs: https://platform.moonshot.ai/docs/api/chat
  - Supabase docs: https://supabase.com/docs/guides/storage
  - DigiKey docs: https://developer.digikey.com/documentation
  - JLCPCB/LCSC docs: https://api.jlcpcb.com/

  **WHY Each Reference Matters**:
  - Previous evidence — Compare against baseline to verify fixes
  - API routes — Must test every endpoint for auth, validation, error handling
  - Official docs — Verify integration patterns match current best practices

  **Acceptance Criteria**:
  - [ ] `.sisyphus/drafts/audit-round-1-report.md` exists with comprehensive findings
  - [ ] `.sisyphus/evidence/audit-round-1/` directory has evidence files
  - [ ] Every page, route, and integration tested
  - [ ] All issues classified by severity (HIGH/MEDIUM/LOW)

  **QA Scenarios**:
  ```
  Scenario: Audit report exists and is comprehensive
    Tool: Bash (wc)
    Preconditions: Audit complete
    Steps:
      1. wc -l .sisyphus/drafts/audit-round-1-report.md
      2. grep -c "HIGH\|MEDIUM\|LOW" .sisyphus/drafts/audit-round-1-report.md
    Expected Result: Report has 50+ lines, at least 1 severity classification
    Failure Indicators: Report missing or empty
    Evidence: .sisyphus/evidence/task-23-audit-report.txt

  Scenario: Evidence directory populated
    Tool: Bash (ls)
    Preconditions: Audit complete
    Steps:
      1. ls .sisyphus/evidence/audit-round-1/ | wc -l
    Expected Result: At least 10 evidence files
    Failure Indicators: Directory empty or missing
    Evidence: .sisyphus/evidence/task-23-evidence-count.txt
  ```

  **Commit**: YES
  - Message: `docs: add post-fix comprehensive audit round 1 report`
  - Files: `.sisyphus/drafts/audit-round-1-report.md`, `.sisyphus/evidence/audit-round-1/`

- [ ] 24. Fix Issues from Audit Round 1

  **What to do**:
  - Read `.sisyphus/drafts/audit-round-1-report.md` for all issues found in Task 23
  - For each issue, implement the fix following the same quality standards as Waves 1-5:
    - No `as any`, `@ts-ignore`, `@ts-expect-error`
    - No empty catch blocks
    - No placeholder text
    - QA evidence captured for each fix
  - Prioritize fixes: HIGH first, then MEDIUM, then LOW
  - If an issue requires user intervention (e.g., platform configuration, credential setup):
    - STOP and create a step-by-step guide at `.sisyphus/drafts/manual-steps-round-2.md`
    - Guide must include: exact URL, which button to click, what to input in each textbox
  - If an issue requires consulting official docs:
    - CONSULT the relevant platform docs BEFORE implementing
  - After all fixes: push to GitHub, wait for CI green, verify Vercel deployment
  - Record all fixes in `.sisyphus/drafts/fix-round-1-report.md`

  **Must NOT do**:
  - Do NOT skip any issue from the audit report
  - Do NOT mark an issue as "won't fix" without documenting why
  - Do NOT break existing functionality with fixes

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Bug fixes requiring investigation, testing, and verification
  - **Skills**: []
  - **Skills Evaluated but Omitted**:
    - `playwright`: Fixes don't need browser automation

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Sequential (depends on Task 23 findings)
  - **Blocks**: Task 25
  - **Blocked By**: Task 23

  **References**:

  **Pattern References**:
  - `.sisyphus/drafts/audit-round-1-report.md` — The list of issues to fix
  - All files mentioned in the audit report

  **WHY Each Reference Matters**:
  - Audit report is the single source of truth for what needs fixing
  - Each fix must reference back to the specific audit finding

  **Acceptance Criteria**:
  - [ ] All HIGH issues from audit report are fixed
  - [ ] All MEDIUM issues from audit report are fixed
  - [ ] LOW issues either fixed or documented as "won't fix" with rationale
  - [ ] `pnpm typecheck && pnpm lint && pnpm test` all pass
  - [ ] `pnpm build` succeeds for both apps
  - [ ] CI green on GitHub
  - [ ] Both Vercel deployments updated

  **QA Scenarios**:
  ```
  Scenario: All audit issues addressed
    Tool: Bash (grep)
    Preconditions: Fixes implemented
    Steps:
      1. grep -c "FIXED\|WON'T FIX" .sisyphus/drafts/fix-round-1-report.md
      2. grep -c "HIGH" .sisyphus/drafts/audit-round-1-report.md
    Expected Result: Fix count >= issue count
    Failure Indicators: Any HIGH issue without a corresponding fix
    Evidence: .sisyphus/evidence/task-24-fixes.txt

  Scenario: Build and tests pass after fixes
    Tool: Bash (pnpm)
    Preconditions: All fixes committed
    Steps:
      1. pnpm typecheck 2>&1 | tail -5
      2. pnpm lint 2>&1 | tail -5
      3. pnpm test 2>&1 | tail -10
      4. pnpm build 2>&1 | tail -10
    Expected Result: All commands succeed (0 errors, all tests pass, build succeeds)
    Failure Indicators: Any command fails
    Evidence: .sisyphus/evidence/task-24-build-test.txt
  ```

  **Commit**: YES
  - Message: `fix: resolve all issues from post-fix audit round 1`
  - Files: All files changed to fix audit issues
  - Pre-commit: `pnpm typecheck && pnpm lint && pnpm test && pnpm build`

- [ ] 25. Post-Fix Re-Audit (Round 2 — Final Verification)

  **What to do**:
  - After Task 24 fixes are deployed, conduct a SECOND full audit covering:
    - Everything from Task 23 scope (all pages, routes, integrations, codebase)
    - Verify that ALL fixes from Task 24 actually work (compare against audit round 1 findings)
    - Test cross-task integration (features from different waves working together)
    - Test edge cases: empty state, invalid input, rapid actions, concurrent requests
    - Test the agent memory system: load SOUL.md, build context, run dream consolidator
  - **This is the FINAL quality gate** — if any issue remains, it must be documented
  - Record findings in `.sisyphus/evidence/audit-round-2/`
  - Create final report at `.sisyphus/drafts/audit-round-2-report.md`
  - If the report shows zero HIGH/MEDIUM issues → SUCCESS, plan is complete
  - If issues remain → Document them for a future planning cycle (do NOT create a Task 26)
  - **STOP AND ASK**: If blocked on anything, create step-by-step guide for user

  **Must NOT do**:
  - Do NOT create additional tasks beyond Task 25
  - Do NOT declare success if HIGH/MEDIUM issues remain
  - Do NOT fabricate audit results

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Final quality gate requiring exhaustive testing and critical evaluation
  - **Skills**: [`playwright`]
    - `playwright`: Browser automation for final verification of all UI

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Sequential (final task)
  - **Blocks**: F1-F4
  - **Blocked By**: Task 24

  **References**:

  **Pattern References**:
  - `.sisyphus/drafts/audit-round-1-report.md` — Baseline issues to verify as fixed
  - `.sisyphus/drafts/fix-round-1-report.md` — Fixes applied, to verify
  - `.sisyphus/evidence/` — All evidence from previous tasks

  **WHY Each Reference Matters**:
  - Round 1 report — Must verify every issue listed here is resolved
  - Fix report — Must verify every fix described here actually works

  **Acceptance Criteria**:
  - [ ] `.sisyphus/drafts/audit-round-2-report.md` exists
  - [ ] All HIGH issues from Round 1 verified as FIXED
  - [ ] All MEDIUM issues from Round 1 verified as FIXED
  - [ ] Zero new HIGH issues found
  - [ ] Zero new MEDIUM issues found (or documented for future)
  - [ ] Final verdict clearly stated: PASS or PARTIAL PASS with remaining issues listed

  **QA Scenarios**:
  ```
  Scenario: Final audit report exists with clear verdict
    Tool: Bash (grep)
    Preconditions: Audit complete
    Steps:
      1. grep -n "VERDICT" .sisyphus/drafts/audit-round-2-report.md
    Expected Result: Line contains "PASS" or "PARTIAL PASS"
    Failure Indicators: No VERDICT line found
    Evidence: .sisyphus/evidence/task-25-verdict.txt

  Scenario: No HIGH/MEDIUM issues from Round 1 remain
    Tool: Bash (grep)
    Preconditions: Round 2 audit complete
    Steps:
      1. grep -c "STILL BROKEN\|REGRESSION" .sisyphus/drafts/audit-round-2-report.md
    Expected Result: 0 (or each one documented with rationale)
    Failure Indicators: Unresolved HIGH/MEDIUM issues
    Evidence: .sisyphus/evidence/task-25-regressions.txt
  ```

  **Commit**: YES
  - Message: `docs: add final post-fix audit round 2 report`
  - Files: `.sisyphus/drafts/audit-round-2-report.md`, `.sisyphus/evidence/audit-round-2/`

> 4 review agents run in PARALLEL. ALL must APPROVE. Present consolidated results to user and get explicit "okay" before completing.

- [ ] F1. **Plan Compliance Audit** — `oracle`
  Read the plan end-to-end. For each "Must Have": verify implementation exists (read file, curl endpoint, run command). For each "Must NOT Have": search codebase for forbidden patterns — reject with file:line if found. Check evidence files exist in .sisyphus/evidence/. Compare deliverables against plan.
  Output: `Must Have [N/N] | Must NOT Have [N/N] | Tasks [N/N] | VERDICT: APPROVE/REJECT`

- [ ] F2. **Code Quality Review** — `unspecified-high`
  Run `tsc --noEmit` + linter + `bun test`. Review all changed files for: `as any`/`@ts-ignore`, empty catches, console.log in prod, commented-out code, unused imports. Check AI slop: excessive comments, over-abstraction, generic names.
  Output: `Build [PASS/FAIL] | Lint [PASS/FAIL] | Tests [N pass/N fail] | Files [N clean/N issues] | VERDICT`

- [ ] F3. **Real Manual QA** — `unspecified-high` (+ `playwright` skill if possible)
  Start from clean state. Execute EVERY QA scenario from EVERY task — follow exact steps, capture evidence. Test cross-task integration. Test edge cases: empty state, invalid input, rapid actions. Save to `.sisyphus/evidence/final-qa/`.
  Output: `Scenarios [N/N pass] | Integration [N/N] | Edge Cases [N tested] | VERDICT`

- [ ] F4. **Scope Fidelity Check** — `deep`
  For each task: read "What to do", read actual diff (git log/diff). Verify 1:1 — everything in spec was built (no missing), nothing beyond spec was built (no creep). Check "Must NOT do" compliance. Detect cross-task contamination. Flag unaccounted changes.
  Output: `Tasks [N/N compliant] | Contamination [CLEAN/N issues] | Unaccounted [CLEAN/N files] | VERDICT`

---

## Commit Strategy

- **Wave 1**: `fix(site): resolve cosmetic issues, metadata, and shared layout` — multiple files
- **Wave 2**: `fix(studio): resolve code bugs and add missing infrastructure` — multiple files
- **Wave 3**: `docs: add community files and overhaul README` — multiple files
- **Wave 4**: `chore: finalize CI, deploy, and manual steps guide` — ci.yml, push
- **Wave 5**: `feat: fix storage buckets, add agent memory, overhaul sites, add legal notices` — multiple files
- **Wave 6**: `fix: resolve audit round 1 issues and verify` — multiple files

---

## Success Criteria

### Verification Commands
```bash
pnpm typecheck    # Expected: 0 errors
pnpm lint         # Expected: 0 errors
pnpm test         # Expected: 692+ pass, 0 fail
pnpm build        # Expected: success for both apps
```

### Final Checklist
- [ ] All 6 HIGH issues resolved
- [ ] All 9 MEDIUM issues resolved
- [ ] All 8 LOW issues resolved
- [ ] Storage bucket mismatch fixed (CRITICAL)
- [ ] DigiKey OAuth dead code removed
- [ ] Agent memory system implemented (SOUL.md, TOOLS.md, IDENTITY.md, memory module)
- [ ] NOTICES.md with all 8 framework acknowledgements
- [ ] raino-site has 4 new pages (showcase, integrations, changelog, trust)
- [ ] raino-studio has settings page with integration status
- [ ] Signup uses magic link (no password)
- [ ] README matches reference frameworks professionalism
- [ ] Both sites render correctly (desktop + mobile)
- [ ] All 692+ tests pass
- [ ] CI pipeline green
- [ ] Both Vercel deployments updated
- [ ] Post-fix audit Round 1 complete with report
- [ ] All Round 1 issues fixed
- [ ] Post-fix audit Round 2 complete with PASS verdict
