# Raino iOS 26 Liquid Glass Overhaul + E2E Pipeline Completion

## TL;DR

> **Quick Summary**: Complete UI/UX overhaul of raino-site and raino-studio to authentic iOS 26/MacOS 26 "Liquid Glass" with maximum glass intensity (multi-layer blur, noise texture, specular highlights, spring physics), plus build missing pipeline pages (Shortlist, Ingestion), install next-intl infrastructure, generate SVG architecture diagrams for READMEs, and verify via E2E Playwright testing with zero CI/deployment errors on Vercel.
>
> **Deliverables**:
> - Upgraded `@raino/ui` design system with 7 Liquid Glass components
> - Framer Motion (LazyMotion) integration for spring physics animations
> - SVG noise filter + specular highlight system
> - Overhauled raino-site (all pages in Liquid Glass brand register)
> - Overhauled raino-studio (all pages in Liquid Glass product register)
> - 2 new pipeline pages: Shortlist/Candidates + Ingestion progress
> - Inline accordion agent thinking display
> - next-intl infrastructure (English catalogs only, other languages deferred)
> - SVG architecture diagram images for 4 README.md files
> - Full E2E Playwright pipeline test (12 steps)
> - Zero-error deployment to Vercel/GitHub
>
> **Estimated Effort**: XL (30+ tasks across 5 waves)
> **Parallel Execution**: YES - 5 waves
> **Critical Path**: Wave 1 tokens → Wave 2 components → Wave 3A site overhaul → Wave 4 content → Wave 5 verification

---

## Context

### Original Request
User was unsatisfied with Phase 1 UI/UX overhaul results: "They do not look anything like iOS 26/MacOS 26 style liquid glass. They lack 3D depth, glass-like texture, animations to mimic the semi-permeable effects." Requested maximum liquid glass intensity, full E2E pipeline completion, multi-language site, and vivid framework diagrams.

### Interview Summary
**Key Discussions**:
- **Glass intensity**: Maximum liquid glass — heavy blur, visible refraction, strong depth layering, liquid spring animations
- **Agent display**: Inline accordion per agent step, thinking collapsed by default
- **Site vs Studio**: Shared language, different registers — brand presentation (site) vs product presentation (studio)
- **Localization**: Install next-intl but only build English catalogs in this phase
- **README diagrams**: SVG image embeds generated from React GlassCard components

**Research Findings**:
- Current glass is basic: single `backdrop-blur-xl` (12-24px), no noise texture, no specular highlights, no depth shadows
- iOS 26 requires: multi-layer blur (16-60px), SVG noise texture, specular highlight overlays, multi-layer shadow stacking
- Pipeline: All 31 API routes exist, 4 workers functional, 3 supplier real adapters exist, but 4 pages missing
- Missing pages: Clarify (handled inline in intake), Shortlist (step 4), Ingestion (step 5), Resolve/Reason (internal, no UI needed)
- Architecture diagrams: Currently ASCII art in `<pre>` blocks; partial React GlassCard exists in architecture/page.tsx
- Framer Motion is already installed but completely unused
- 692 existing tests must continue passing

### Metis Review
**Identified Gaps** (all addressed):
- i18n mechanism: Install next-intl infrastructure, English catalogs only → RESOLVED
- README diagrams: Static SVG embeds → RESOLVED
- STATUS_TO_STEP has 11 entries for 12 steps → FIX in Wave 1
- Framer Motion bundle: Must use LazyMotion + domAnimation (~12KB vs ~90KB) → GUARDRAIL
- No chromatic aberration or displacement maps (too GPU expensive) → GUARDRAIL
- `prefers-reduced-motion` fallback required → GUARDRAIL
- Component changes must be additive (new optional props, no breaking changes) → GUARDRAIL

---

## Work Objectives

### Core Objective
Transform Raino's two Next.js apps from basic glassmorphism to authentic iOS 26 Liquid Glass with maximum intensity, complete missing pipeline pages, install i18n infrastructure, generate SVG architecture diagrams, and deploy with zero errors.

### Concrete Deliverables
- `packages/ui/src/styles/theme.ts` — unified token system with glass depth levels
- `packages/ui/src/components/LiquidGlassCard.tsx` — Framer Motion spring card
- `packages/ui/src/components/AgentAccordion.tsx` — collapsible thinking display
- `packages/ui/src/components/` — 5 upgraded components (Card, Button, Panel, Modal, Badge)
- `packages/ui/src/components/diagrams/` — extracted ArchitectureDiagram, GlassCard, ConnectionLine
- `apps/site/` — all pages overhauled in brand register
- `apps/studio/` — all pages overhauled in product register + 2 new pipeline pages
- `docs/assets/architecture-*.svg` — 4 SVG diagrams for READMEs
- `README.md`, `README.zh-CN.md`, `README.ja.md`, `README.ko.md` — updated with SVG diagrams
- `apps/site/src/i18n/` — next-intl configuration and English message catalogs
- `.sisyphus/evidence/` — Playwright E2E test evidence

### Definition of Done
- [ ] `pnpm typecheck && pnpm lint && pnpm test && pnpm build` — all exit 0
- [ ] All 692+ existing tests pass (zero regressions)
- [ ] Both Vercel projects deploy with zero errors
- [ ] E2E Playwright test completes all 12 pipeline steps
- [ ] No page exceeds 200KB gzipped

### Must Have
- Multi-layer glass with depth: 3-layer shadows, noise texture, specular highlights
- Spring physics on glass card hover/tap/mount (LazyMotion)
- Inline accordion agent thinking display
- 2 new pipeline pages (Shortlist + Ingestion) with Liquid Glass styling
- SVG architecture diagram images in all 4 READMEs
- next-intl infrastructure set up (English catalogs only)
- Language links at top of main README
- `prefers-reduced-motion` fallback on all glass components
- Vercel deployment with zero CI/deployment errors

### Must NOT Have (Guardrails)
- NO chromatic aberration or displacement map filters (GPU-expensive)
- NO breaking changes to existing component props/APIs
- NO test deletions or `@ts-ignore` additions
- NO new accent colors beyond the 4 specified palette
- NO display fonts beyond Noto Serif
- NO full `framer-motion` bundle (use LazyMotion + domAnimation only)
- NO existing pipeline page redesigns (only add MISSING pages)
- NO Studio localization in this phase
- NO `as any`, empty catch blocks, or console.log in prod
- NO changes to existing API route contracts (31 routes untouched)
- NO new environment variables

---

## Verification Strategy

> **ZERO HUMAN INTERVENTION** — ALL verification is agent-executed. No exceptions.

### Test Decision
- **Infrastructure exists**: YES (Vitest, 692 passing tests)
- **Automated tests**: Tests-after (existing tests preserved, new component tests for glass additions)
- **Framework**: Vitest + Playwright

### QA Policy
Every task MUST include agent-executed QA scenarios.
Evidence saved to `.sisyphus/evidence/task-{N}-{scenario-slug}.{ext}`.

- **Frontend/UI**: Use Playwright (playwright skill) — navigate, interact, assert DOM, screenshot
- **Component tests**: Use Vitest — render, assert props, verify glass CSS classes
- **Build verification**: Use Bash — `pnpm typecheck && pnpm lint && pnpm test && pnpm build`
- **Deployment**: Use Bash — `git push` + verify Vercel deploy status

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Foundation — 6 tasks, ALL parallel, MAX SPEED):
├── Task 1: Create PRODUCT.md + DESIGN.md [quick]
├── Task 2: Install dependencies (framer-motion, next-intl) [quick]
├── Task 3: Unify design tokens + create glass depth system [deep]
├── Task 4: Create SVG noise filter + specular highlight system [quick]
├── Task 5: Create Liquid Glass CSS utilities [quick]
└── Task 6: Fix STATUS_TO_STEP mapping gap [quick]

Wave 2 (Design System — 7 tasks, depends Wave 1, MAX PARALLEL):
├── Task 7: Upgrade Card/GlowingCard with multi-layer glass [visual-engineering]
├── Task 8: Upgrade Button with glass + spring physics [visual-engineering]
├── Task 9: Upgrade Panel/Modal with glass depth [visual-engineering]
├── Task 10: Upgrade form components (Badge/Input/Select/Textarea) [visual-engineering]
├── Task 11: Extract + upgrade diagram components to @raino/ui/diagrams [visual-engineering]
├── Task 12: Create LiquidGlassCard wrapper (Framer Motion LazyMotion) [visual-engineering]
└── Task 13: Create AgentAccordion component [visual-engineering]

Wave 3A (Site Overhaul — depends Wave 2, brand register):
├── Task 14: Overhaul raino-site layout (Navbar + Footer + globals) [visual-engineering]
├── Task 15: Overhaul raino-site homepage [visual-engineering]
├── Task 16: Overhaul raino-site /features page [visual-engineering]
├── Task 17: Overhaul raino-site /architecture page [visual-engineering]
└── Task 18: Overhaul raino-site remaining pages + next-intl setup [deep]

Wave 3B (Studio Overhaul — depends Wave 2, product register, PARALLEL with 3A):
├── Task 19: Overhaul raino-studio layout (header + globals) [visual-engineering]
├── Task 20: Overhaul raino-studio intake page with agent accordion [deep]
├── Task 21: Overhaul raino-studio spec + architecture pages [visual-engineering]
├── Task 22: Overhaul raino-studio BOM + design + validate + quote pages [visual-engineering]
├── Task 23: Build Shortlist/Candidates pipeline page (step 4) [deep]
└── Task 24: Build Ingestion progress pipeline page (step 5) [deep]

Wave 4 (Content + i18n — depends Wave 3A):
├── Task 25: Generate SVG architecture diagram images [visual-engineering]
├── Task 26: Update all 4 README.md files with SVG + language links [writing]
└── Task 27: Set up next-intl English message catalogs for site [quick]

Wave 5 (Verification + Deployment — depends ALL):
├── Task 28: Create mock LLM adapter for deterministic testing [deep]
├── Task 29: E2E Playwright test: full 12-step pipeline [deep]
├── Task 30: E2E Playwright test: multi-language site verification [deep]
├── Task 31: Bundle size audit + performance optimization [deep]
└── Task 32: Deploy to Vercel + GitHub with zero errors [quick]

Wave FINAL (After ALL tasks — 4 parallel reviews):
├── Task F1: Plan compliance audit (oracle)
├── Task F2: Code quality review (unspecified-high)
├── Task F3: Real manual QA with Playwright (unspecified-high)
└── Task F4: Scope fidelity check (deep)
→ Present results → Get explicit user okay

Critical Path: W1 Tokens → W2 Components → W3A+B Pages → W5 Deploy → FINAL
Parallel Speedup: ~65% faster than sequential
Max Concurrent: 7 (Waves 1 & 2)
```

### Dependency Matrix

| Task | Depends On | Blocks | Wave |
|------|-----------|--------|------|
| 1-6 | None | 7-13 | 1 |
| 7 | 3, 4, 5 | 14-24 | 2 |
| 8 | 3, 4, 5 | 14-24 | 2 |
| 9 | 3, 4, 5 | 14-24 | 2 |
| 10 | 3, 5 | 14-24 | 2 |
| 11 | 3, 4 | 17, 25 | 2 |
| 12 | 3, 4, 5 | 14-24 | 2 |
| 13 | 3, 5 | 20 | 2 |
| 14 | 7-12 | 15-18 | 3A |
| 15 | 14 | 27 | 3A |
| 16 | 14 | — | 3A |
| 17 | 14, 11 | 25 | 3A |
| 18 | 14 | 27 | 3A |
| 19 | 7-12 | 20-24 | 3B |
| 20 | 19, 13 | — | 3B |
| 21 | 19 | — | 3B |
| 22 | 19 | — | 3B |
| 23 | 19 | 29 | 3B |
| 24 | 19 | 29 | 3B |
| 25 | 11, 17 | 26 | 4 |
| 26 | 25 | — | 4 |
| 27 | 18 | — | 4 |
| 28 | None | 29 | 5 |
| 29 | 23, 24, 28 | 32 | 5 |
| 30 | 18 | 32 | 5 |
| 31 | 29, 30 | 32 | 5 |
| 32 | 29, 30, 31 | F1-F4 | 5 |

### Agent Dispatch Summary

- **Wave 1**: **6 tasks** — 5× `quick` + 1× `deep`
- **Wave 2**: **7 tasks** — 7× `visual-engineering` (all with `impeccable` skill)
- **Wave 3A**: **5 tasks** — 4× `visual-engineering` + 1× `deep` (with `impeccable`)
- **Wave 3B**: **6 tasks** — 4× `visual-engineering` + 2× `deep` (with `impeccable`)
- **Wave 4**: **3 tasks** — 1× `visual-engineering` + 1× `writing` + 1× `quick`
- **Wave 5**: **5 tasks** — 3× `deep` + 1× `quick` (with `playwright` skill for E2E)
- **FINAL**: **4 tasks** — 1× `oracle` + 2× `unspecified-high` + 1× `deep`

**Model Preference**: Use Kimi K2.6 for Sisyphus Junior tasks where available. GLM series acceptable as fallback.

---

## TODOs

- [x] 1. Create PRODUCT.md + DESIGN.md (Impeccable Teach Output)

  **What to do**:
  - Create `/mnt/d/raino/PRODUCT.md` following Impeccable teach format
  - Register: `product` (studio is primary, site is brand secondary)
  - Users: Hardware engineers and makers designing PCBs, evaluating tools on their phone/laptop
  - Brand personality: "precise, confident, luminous"
  - Anti-references: Cyberpunk/hacker themes, SaaS template dashboards, flat material design
  - Design principles: constrained depth, luminous clarity, earned motion, honest material
  - Create `/mnt/d/raino/DESIGN.md` following Google Stitch DESIGN.md format
  - Color palette: `#0A1929` (navy), `#1565C0` (blue), `#6191D3` (light blue), `#64748B` (slate)
  - Typography: Noto Serif, fluid scale with 1.25 ratio between steps
  - Components: Liquid Glass card, spring-motion button, accordion thinking, depth-layered panel

  **Must NOT do**: Do not install any dependencies. Do not modify any existing files.

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: [`impeccable`]

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 2-6)
  - **Blocks**: Tasks 7-13
  - **Blocked By**: None

  **References**:
  - `.agents/skills/impeccable/reference/teach.md` — PRODUCT.md creation flow
  - `.agents/skills/impeccable/reference/document.md` — DESIGN.md creation flow
  - `.agents/skills/impeccable/reference/brand.md` — Brand register reference (for raino-site)
  - `.agents/skills/impeccable/reference/product.md` — Product register reference (for raino-studio)
  - `packages/ui/src/styles/theme.ts` — Current tokens to capture
  - `apps/site/src/app/globals.css` — Current CSS variables

  **Acceptance Criteria**:
  - [ ] `PRODUCT.md` exists at project root with Register, Users, Product Purpose, Brand Personality, Anti-references, Design Principles, Accessibility sections
  - [ ] `DESIGN.md` exists at project root with Colors, Typography, Components, Layout sections
  - [ ] Both files reference the 4-color palette and Noto Serif

  **QA Scenarios**:
  ```
  Scenario: PRODUCT.md contains required sections
    Tool: Bash
    Steps:
      1. Run: node .agents/skills/impeccable/scripts/load-context.mjs
      2. Assert JSON output has hasProduct: true and hasDesign: true
    Expected Result: Both files loaded successfully with non-null content
    Evidence: .sisyphus/evidence/task-1-context-load.txt

  Scenario: DESIGN.md has correct color palette
    Tool: Bash
    Steps:
      1. grep -c "#0A1929" DESIGN.md && grep -c "#1565C0" DESIGN.md && grep -c "#6191D3" DESIGN.md && grep -c "#64748B" DESIGN.md
    Expected Result: All 4 colors found (exit code 0 for each)
    Evidence: .sisyphus/evidence/task-1-color-check.txt
  ```

  **Commit**: NO (groups with Wave 1)

- [x] 2. Install Dependencies (Framer Motion + next-intl)

  **What to do**:
  - Install `motion` (Framer Motion v11+, the `motion` package) in packages/ui
  - Install `next-intl` in apps/site
  - Verify installations don't break existing 692 tests
  - Verify `pnpm typecheck` passes after install
  - NOTE: Use `motion` package (not `framer-motion`) — it's the modern rename with tree-shaking

  **Must NOT do**: Do not install full `framer-motion` bundle. Do not modify any source files. Do not install in wrong workspace.

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 3-6)
  - **Blocks**: Tasks 7-13
  - **Blocked By**: None

  **References**:
  - `package.json` — Check if `motion` or `framer-motion` already exists
  - `apps/site/package.json` — Where next-intl goes
  - `packages/ui/package.json` — Where motion goes

  **Acceptance Criteria**:
  - [ ] `motion` in packages/ui/package.json dependencies
  - [ ] `next-intl` in apps/site/package.json dependencies
  - [ ] `pnpm typecheck` exits 0
  - [ ] `pnpm test` exits 0 (692 tests pass)

  **QA Scenarios**:
  ```
  Scenario: Dependencies installed correctly
    Tool: Bash
    Steps:
      1. grep '"motion"' packages/ui/package.json
      2. grep '"next-intl"' apps/site/package.json
      3. pnpm typecheck
      4. pnpm test 2>&1 | tail -5
    Expected Result: Both deps found, typecheck exit 0, all tests pass
    Evidence: .sisyphus/evidence/task-2-deps-install.txt

  Scenario: No existing tests broken
    Tool: Bash
    Steps:
      1. pnpm test 2>&1 | grep -E "(Tests|pass|fail)"
    Expected Result: 692+ tests pass, 0 failures
    Evidence: .sisyphus/evidence/task-2-tests.txt
  ```

  **Commit**: NO (groups with Wave 1)

- [x] 3. Unify Design Tokens + Create Glass Depth System

  **What to do**:
  - Consolidate tokens from `packages/ui/src/styles/theme.ts` and both `globals.css` files into a single source of truth in `theme.ts`
  - Add glass depth tokens: `glass.depth.surface`, `glass.depth.elevated`, `glass.depth.floating`
  - Add multi-layer shadow tokens: `shadow.glass.1`, `shadow.glass.2`, `shadow.glass.3` (contact + key + ambient layers)
  - Add blur tokens: `blur.glass` (16px), `blur.glass.heavy` (24px), `blur.glass.light` (10px)
  - Add opacity tokens for glass backgrounds at each depth level
  - Add spring animation presets: snappy (400/30), smooth (200/25), gentle (150/28)
  - Ensure all color values use the 4-color palette only
  - Remove duplicate CSS variables from globals.css that are now in theme.ts

  **Must NOT do**: Do NOT change existing component behavior. Do NOT delete existing CSS variables (deprecate with comment). Do NOT add colors outside the 4-color palette.

  **Recommended Agent Profile**:
  - **Category**: `deep`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1-2, 4-6)
  - **Blocks**: Tasks 7-13
  - **Blocked By**: None

  **References**:
  - `packages/ui/src/styles/theme.ts` — Current tokens (source of truth)
  - `apps/site/src/app/globals.css` — Site CSS variables (lines with `--bg-primary`, etc.)
  - `apps/studio/src/app/globals.css` — Studio CSS variables
  - `.sisyphus/drafts/raino-liquid-glass-overhaul.md` — Research findings on iOS 26 glass values

  **Acceptance Criteria**:
  - [ ] `theme.ts` has `glass` section with depth, shadows, blur, opacity tokens
  - [ ] `theme.ts` has `animation` section with spring presets
  - [ ] No duplicate token definitions across files
  - [ ] `pnpm typecheck` exits 0
  - [ ] All 692 tests pass

  **QA Scenarios**:
  ```
  Scenario: Glass tokens defined in theme.ts
    Tool: Bash
    Steps:
      1. grep -c "glass" packages/ui/src/styles/theme.ts
      2. grep -c "shadow\.glass" packages/ui/src/styles/theme.ts
      3. grep -c "blur\.glass" packages/ui/src/styles/theme.ts
    Expected Result: glass mentioned 10+ times, shadow.glass 3+, blur.glass 3+
    Evidence: .sisyphus/evidence/task-3-tokens.txt

  Scenario: Build still passes after token changes
    Tool: Bash
    Steps:
      1. pnpm typecheck
      2. pnpm test 2>&1 | tail -5
    Expected Result: Both exit 0, 692+ tests pass
    Evidence: .sisyphus/evidence/task-3-build.txt
  ```

  **Commit**: NO (groups with Wave 1)

- [x] 4. Create SVG Noise Filter + Specular Highlight System

  **What to do**:
  - Create `packages/ui/src/components/Filters.tsx` with SVG filter definitions:
    - `feTurbulence` noise filter (baseFrequency 0.008, numOctaves 2) for glass texture
    - Specular highlight gradient (135deg, white 30% → transparent 60%)
  - Create a `GlassProvider` component that renders the SVG filters once at app root
  - Filters must be lazy-loaded (not in initial critical path)
  - Create CSS classes that reference the SVG filters: `.glass-noise`, `.glass-specular`
  - Include `prefers-reduced-motion` fallback: skip noise animation for motion-sensitive users

  **Must NOT do**: Do NOT use `feDisplacementMap` (chromatic aberration) or `feSpecularLighting` (too expensive). Do NOT render filters inline on every component.

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1-3, 5-6)
  - **Blocks**: Tasks 7-13
  - **Blocked By**: None

  **References**:
  - `packages/ui/src/index.ts` — Where to export GlassProvider
  - `apps/site/src/app/layout.tsx` — Where to mount GlassProvider
  - `apps/studio/src/app/layout.tsx` — Where to mount GlassProvider
  - iOS 26 research: SVG filter pattern from librarian results

  **Acceptance Criteria**:
  - [ ] `Filters.tsx` exists with noise and specular SVG definitions
  - [ ] `GlassProvider` component wraps SVG filters with `display: none`
  - [ ] CSS classes `.glass-noise` and `.glass-specular` reference the filters
  - [ ] `prefers-reduced-motion` disables noise animation

  **QA Scenarios**:
  ```
  Scenario: SVG filters render in DOM
    Tool: Bash
    Steps:
      1. grep "feTurbulence" packages/ui/src/components/Filters.tsx
      2. grep "GlassProvider" packages/ui/src/index.ts
    Expected Result: Both found
    Evidence: .sisyphus/evidence/task-4-filters.txt

  Scenario: No performance regression
    Tool: Bash
    Steps:
      1. pnpm build 2>&1 | grep -E "(error|warning|Error)" | head -5
    Expected Result: No errors or warnings related to SVG filters
    Evidence: .sisyphus/evidence/task-4-build.txt
  ```

  **Commit**: NO (groups with Wave 1)

- [x] 5. Create Liquid Glass CSS Utilities

  **What to do**:
  - Create `packages/ui/src/styles/glass.css` with comprehensive glass utility classes:
    - `.glass-surface` — base glass (depth 1): `rgba(10,25,41,0.6)` + blur(16px) + saturate(160%)
    - `.glass-elevated` — depth 2: `rgba(10,25,41,0.75)` + blur(20px) + saturate(170%)
    - `.glass-floating` — depth 3: `rgba(10,25,41,0.85)` + blur(24px) + saturate(180%)
    - `.glass-blue-tint` — brand-tinted: gradient from `rgba(21,101,192,0.15)` to navy
    - `.glass-specular` — adds top-light highlight via pseudo-element
    - `.glass-noise` — applies noise texture via SVG filter reference
  - Each class has 3-layer shadow: contact (1-2px) + key (4-12px) + ambient (16-40px)
  - Each class has border tinted toward `#6191D3` (light blue)
  - Top edge lighter than other edges (specular simulation): `border-top: 1px solid rgba(255,255,255,0.2)`
  - Add hover state: scale(1.01) + enhanced shadow
  - Add `prefers-reduced-motion` fallback: no transitions, solid backgrounds
  - Add `@supports not (backdrop-filter: blur(1px))` fallback: solid `#0A1929` background
  - Import in both `apps/site/src/app/globals.css` and `apps/studio/src/app/globals.css`

  **Must NOT do**: Do NOT use `border-left` or `border-right` > 1px as accent (Impeccable ban). Do NOT use `background-clip: text` with gradients (Impeccable ban). Do NOT nest glass on glass.

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1-4, 6)
  - **Blocks**: Tasks 7-13
  - **Blocked By**: None

  **References**:
  - `packages/ui/src/styles/theme.ts` — Token values (from Task 3)
  - `apps/site/src/app/globals.css` — Current `.glass-card` classes to supersede
  - `apps/studio/src/app/globals.css` — Current `.glass-card` classes to supersede
  - iOS 26 research: Multi-layer shadow pattern, depth model

  **Acceptance Criteria**:
  - [ ] `glass.css` exists with 6+ glass utility classes
  - [ ] Each class has multi-layer shadow (3 layers minimum)
  - [ ] `prefers-reduced-motion` fallback defined
  - [ ] `@supports not (backdrop-filter)` fallback defined
  - [ ] Imported in both globals.css files

  **QA Scenarios**:
  ```
  Scenario: Glass CSS classes defined
    Tool: Bash
    Steps:
      1. grep -c "glass-surface\|glass-elevated\|glass-floating\|glass-blue-tint" packages/ui/src/styles/glass.css
      2. grep -c "prefers-reduced-motion" packages/ui/src/styles/glass.css
      3. grep -c "@supports not" packages/ui/src/styles/glass.css
    Expected Result: 4+ glass classes, reduced-motion fallback, supports fallback
    Evidence: .sisyphus/evidence/task-5-glass-css.txt
  ```

  **Commit**: NO (groups with Wave 1)

- [x] 6. Fix STATUS_TO_STEP Mapping Gap

  **What to do**:
  - In `apps/studio/src/lib/data/project-queries.ts`, update `STATUS_TO_STEP` to include ALL statuses from the Zod enum in `packages/core/src/schemas/project.ts`
  - Add missing statuses: `design_pending`, `design_generated`, `exported`, `handed_off`
  - Map them to appropriate step numbers (the total should be 12)
  - Verify the mapping covers all 13 Zod enum values
  - Update `TOTAL_STEPS` constant if needed
  - Run all tests to verify no regressions

  **Must NOT do**: Do NOT change the Zod enum. Do NOT change any API route behavior. Do NOT rename existing statuses.

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1-5)
  - **Blocks**: Tasks 23-24 (new pipeline pages)
  - **Blocked By**: None

  **References**:
  - `apps/studio/src/lib/data/project-queries.ts:135-148` — Current STATUS_TO_STEP map
  - `packages/core/src/schemas/project.ts` — Full Zod ProjectStatus enum with 13 values

  **Acceptance Criteria**:
  - [ ] STATUS_TO_STEP has entries for all 13 Zod enum values
  - [ ] Step numbers are sequential 0-11 (or 0-12 for 13 states)
  - [ ] `pnpm test` exits 0

  **QA Scenarios**:
  ```
  Scenario: All statuses mapped
    Tool: Bash
    Steps:
      1. Count entries in STATUS_TO_STEP map
      2. Count values in ProjectStatus Zod enum
      3. Verify counts match
    Expected Result: Both have 13 entries
    Evidence: .sisyphus/evidence/task-6-status-map.txt

  Scenario: No test regressions
    Tool: Bash
    Steps:
      1. pnpm test 2>&1 | tail -5
    Expected Result: All tests pass
    Evidence: .sisyphus/evidence/task-6-tests.txt
  ```

  **Commit**: YES — `fix(studio): complete STATUS_TO_STEP mapping for all 13 pipeline statuses`

- [ ] 7. Upgrade Card/GlowingCard with Multi-Layer Glass

  **What to do**:
  - Enhance `packages/ui/src/components/Card.tsx` with additive glass props:
    - `glassIntensity?: 'light' | 'medium' | 'maximum'` (default: 'medium')
    - `glassTint?: 'default' | 'blue'` (default: 'default')
    - `enableNoise?: boolean` (default: true)
    - `enableSpecular?: boolean` (default: true)
  - Apply glass CSS utilities from Task 5 based on intensity level
  - Maximum intensity: 3-layer shadow + noise texture + specular highlight + blur(24px)
  - Keep ALL existing Card variants and props unchanged (backward-compatible)
  - Enhance `GlowingCard.tsx` (GlassCard alias) similarly
  - Do NOT wrap with Framer Motion (Task 12 creates the wrapper)

  **Must NOT do**: Do NOT change existing Card props or default behavior. Do NOT break the 80 component tests. Do NOT use `as any` or `@ts-ignore`.

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: [`impeccable`]

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 8-13)
  - **Blocks**: Tasks 14-24
  - **Blocked By**: Tasks 3, 4, 5

  **References**:
  - `packages/ui/src/components/Card.tsx` — Current Card implementation
  - `packages/ui/src/components/GlowingCard.tsx` — Current GlassCard/GlowingCard
  - `packages/ui/src/styles/glass.css` — Glass utilities from Task 5
  - `packages/ui/src/styles/theme.ts` — Glass tokens from Task 3

  **Acceptance Criteria**:
  - [ ] Card accepts new optional glass props without breaking existing usage
  - [ ] `glassIntensity="maximum"` applies 3-layer shadow + noise + specular
  - [ ] All 80 existing component tests pass
  - [ ] `pnpm typecheck` exits 0

  **QA Scenarios**:
  ```
  Scenario: Card renders with maximum glass
    Tool: Bash
    Steps:
      1. pnpm test --filter @raino/ui 2>&1 | tail -5
    Expected Result: All UI tests pass
    Evidence: .sisyphus/evidence/task-7-card-tests.txt

  Scenario: Backward compatibility — existing Card usage unchanged
    Tool: Bash
    Steps:
      1. grep -r "Card " apps/studio/src/ | head -10 — verify no prop changes needed
    Expected Result: No compilation errors from existing Card usage
    Evidence: .sisyphus/evidence/task-7-compat.txt
  ```

  **Commit**: NO (groups with Wave 2)

- [ ] 8. Upgrade Button with Glass + Spring Physics

  **What to do**:
  - Enhance `packages/ui/src/components/Button.tsx` with glass styling
  - Apply glass-elevated background to primary buttons
  - Add hover: scale(1.02) with spring transition
  - Add active/press: scale(0.98) (iOS-like compression)
  - Use CSS transitions (not Framer Motion) for buttons — cheaper than LazyMotion per button
  - Add focus-visible ring: `rgba(97, 145, 211, 0.8)` glow
  - Keep ALL existing Button variants and props unchanged

  **Must NOT do**: Do NOT use Framer Motion on Button (CSS transitions sufficient). Do NOT change existing Button props.

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: [`impeccable`]

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 7, 9-13)
  - **Blocks**: Tasks 14-24
  - **Blocked By**: Tasks 3, 4, 5

  **References**:
  - `packages/ui/src/components/Button.tsx` — Current implementation

  **Acceptance Criteria**:
  - [ ] Button has glass background on primary variant
  - [ ] Hover/active transitions with spring-like curves
  - [ ] Focus-visible glow ring
  - [ ] All existing Button tests pass

  **QA Scenarios**:
  ```
  Scenario: Button glass styling applied
    Tool: Bash
    Steps:
      1. grep -c "glass\|backdrop\|scale" packages/ui/src/components/Button.tsx
    Expected Result: 3+ matches for glass-related styles
    Evidence: .sisyphus/evidence/task-8-button.txt
  ```

  **Commit**: NO (groups with Wave 2)

- [ ] 9. Upgrade Panel/Modal with Glass Depth

  **What to do**:
  - Enhance `Panel.tsx` with glass-elevated styling and depth-3 shadows
  - Enhance `Modal.tsx` with glass-floating styling, glass backdrop overlay
  - Both: add specular highlight pseudo-element, glass border tint
  - Keep ALL existing props and behavior unchanged

  **Must NOT do**: Do NOT change existing Panel/Modal APIs.

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: [`impeccable`]

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 7-8, 10-13)
  - **Blocks**: Tasks 14-24
  - **Blocked By**: Tasks 3, 4, 5

  **References**:
  - `packages/ui/src/components/Panel.tsx` — Current Panel
  - `packages/ui/src/components/Modal.tsx` — Current Modal

  **Acceptance Criteria**:
  - [ ] Panel uses glass-elevated with depth shadows
  - [ ] Modal uses glass-floating with backdrop glass overlay
  - [ ] All existing tests pass

  **QA Scenarios**:
  ```
  Scenario: Panel and Modal glass rendering
    Tool: Bash
    Steps:
      1. grep -c "glass\|shadow\|specular" packages/ui/src/components/Panel.tsx packages/ui/src/components/Modal.tsx
    Expected Result: Glass styling applied to both
    Evidence: .sisyphus/evidence/task-9-panel-modal.txt
  ```

  **Commit**: NO (groups with Wave 2)

- [ ] 10. Upgrade Form Components (Badge/Input/Select/Textarea)

  **What to do**:
  - Enhance Badge, Input, Select, Textarea with glass-surface styling
  - Input/Select/Textarea: glass background, light blue border focus, subtle inner shadow
  - Badge: glass-blue-tint for active states, glass-surface for default
  - Add focus-visible glow ring matching Button
  - Keep ALL existing props unchanged

  **Must NOT do**: Do NOT change existing form component APIs.

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: [`impeccable`]

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 7-9, 11-13)
  - **Blocks**: Tasks 14-24
  - **Blocked By**: Tasks 3, 5

  **References**:
  - `packages/ui/src/components/Badge.tsx`
  - `packages/ui/src/components/Input.tsx`
  - `packages/ui/src/components/Select.tsx`
  - `packages/ui/src/components/Textarea.tsx`

  **Acceptance Criteria**:
  - [ ] All 4 form components have glass backgrounds
  - [ ] Focus states have blue glow ring
  - [ ] All existing tests pass

  **QA Scenarios**:
  ```
  Scenario: Form components have glass styling
    Tool: Bash
    Steps:
      1. for f in Badge Input Select Textarea; do grep -c "glass\|backdrop" packages/ui/src/components/$f.tsx; done
    Expected Result: Each has glass-related styles
    Evidence: .sisyphus/evidence/task-10-forms.txt
  ```

  **Commit**: NO (groups with Wave 2)

- [ ] 11. Extract + Upgrade Diagram Components to @raino/ui/diagrams

  **What to do**:
  - Create `packages/ui/src/components/diagrams/` directory
  - Extract from `apps/site/src/app/architecture/page.tsx` (lines 125-314):
    - `GlassCard` → `packages/ui/src/components/diagrams/GlassCard.tsx`
    - `ConnectionLine` → `packages/ui/src/components/diagrams/ConnectionLine.tsx`
    - `ArchitectureDiagram` → `packages/ui/src/components/diagrams/ArchitectureDiagram.tsx`
    - `WorkflowDiagram` → `packages/ui/src/components/diagrams/WorkflowDiagram.tsx`
  - Upgrade each with Liquid Glass styling: noise texture, specular highlight, depth shadows
  - Export from `packages/ui/src/index.ts` as `@raino/ui/diagrams`
  - Update `apps/site/src/app/architecture/page.tsx` to import from `@raino/ui/diagrams`
  - Dynamic import recommended to avoid pulling Framer Motion into non-diagram pages

  **Must NOT do**: Do NOT break the existing architecture page. Do NOT make diagrams interactive (hover only).

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: [`impeccable`]

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 7-10, 12-13)
  - **Blocks**: Tasks 17, 25
  - **Blocked By**: Tasks 3, 4

  **References**:
  - `apps/site/src/app/architecture/page.tsx:125-314` — Source components to extract
  - `packages/ui/src/index.ts` — Where to add exports

  **Acceptance Criteria**:
  - [ ] `packages/ui/src/components/diagrams/` has 4 component files
  - [ ] `@raino/ui/diagrams` export path works
  - [ ] Architecture page imports from new location
  - [ ] All existing tests pass

  **QA Scenarios**:
  ```
  Scenario: Diagram components extracted and working
    Tool: Bash
    Steps:
      1. ls packages/ui/src/components/diagrams/
      2. grep "diagrams" packages/ui/src/index.ts
      3. grep "@raino/ui/diagrams" apps/site/src/app/architecture/page.tsx
    Expected Result: 4 diagram files, export path found, site imports from package
    Evidence: .sisyphus/evidence/task-11-diagrams.txt
  ```

  **Commit**: NO (groups with Wave 2)

- [ ] 12. Create LiquidGlassCard Wrapper (Framer Motion LazyMotion)

  **What to do**:
  - Create `packages/ui/src/components/LiquidGlassCard.tsx`
  - Wrap Card with `LazyMotion` + `domAnimation` from `motion` package
  - Props: inherits all Card props + `springConfig?: 'snappy' | 'smooth' | 'gentle'`
  - Behaviors:
    - Mount: fade-in + slide-up with spring
    - Hover: scale(1.01) + y(-2px) with spring
    - Tap/active: scale(0.99)
    - Uses `m.div` (not `motion.div`) for LazyMotion compatibility
  - Spring presets defined inline:
    - snappy: stiffness 400, damping 30
    - smooth: stiffness 200, damping 25, mass 0.8
    - gentle: stiffness 150, damping 28
  - `prefers-reduced-motion`: skip animations, use instant transitions

  **Must NOT do**: Do NOT import `framer-motion` directly — use `motion` package with LazyMotion. Do NOT use full `motion.div` (use `m.div`). Do NOT add spring animations to every component (only this wrapper).

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: [`impeccable`]

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 7-11, 13)
  - **Blocks**: Tasks 14-24
  - **Blocked By**: Tasks 3, 4, 5

  **References**:
  - `packages/ui/src/components/Card.tsx` — Base component to wrap
  - `packages/ui/src/styles/glass.css` — Glass utilities
  - iOS 26 research: Spring physics configurations

  **Acceptance Criteria**:
  - [ ] `LiquidGlassCard.tsx` exists with LazyMotion wrapper
  - [ ] Uses `m.div` (not `motion.div`)
  - [ ] 3 spring presets defined
  - [ ] `prefers-reduced-motion` fallback skips animations

  **QA Scenarios**:
  ```
  Scenario: LazyMotion used (not full framer-motion)
    Tool: Bash
    Steps:
      1. grep "LazyMotion\|domAnimation\|m\.div" packages/ui/src/components/LiquidGlassCard.tsx
      2. grep -c "motion\.div\|framer-motion" packages/ui/src/components/LiquidGlassCard.tsx
    Expected Result: LazyMotion/m.div found, zero motion.div/framer-motion references
    Evidence: .sisyphus/evidence/task-12-lazy-motion.txt
  ```

  **Commit**: NO (groups with Wave 2)

- [ ] 13. Create AgentAccordion Component

  **What to do**:
  - Create `packages/ui/src/components/AgentAccordion.tsx`
  - Renders pipeline agent steps as inline collapsible sections
  - Props: `steps: AgentStep[]`, `activeStep?: number`, `onStepClick?: (index: number) => void`
  - `AgentStep` type: `{ label: string; status: 'pending' | 'running' | 'complete' | 'error'; thinking?: string; result?: string }`
  - Each step:
    - Header bar with step label, status icon (dot/spinner/check), expand chevron
    - Collapsed by default — click header to expand thinking content
    - Expanded: shows `thinking` text in monospace, `result` in rendered markdown
    - Glass-surface background, glass-elevated when expanded
  - Use CSS `grid-template-rows` transition for expand/collapse (not `height`)
  - Active/running step: subtle pulse-glass animation
  - `prefers-reduced-motion`: instant expand/collapse

  **Must NOT do**: Do NOT use Framer Motion for accordion (CSS grid transition is sufficient and cheaper). Do NOT add syntax highlighting to thinking text.

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: [`impeccable`]

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 7-12)
  - **Blocks**: Task 20 (intake page integration)
  - **Blocked By**: Tasks 3, 5

  **References**:
  - `apps/studio/src/app/projects/[id]/intake/page.tsx` — Current ThinkingBlock pattern
  - Impeccable shared design laws: motion section (grid-template-rows for collapse)

  **Acceptance Criteria**:
  - [ ] `AgentAccordion.tsx` exists with collapsible step rendering
  - [ ] Uses CSS grid-template-rows transition
  - [ ] Glass backgrounds applied per expansion state
  - [ ] Exported from `@raino/ui`

  **QA Scenarios**:
  ```
  Scenario: AgentAccordion component structure
    Tool: Bash
    Steps:
      1. grep -c "grid-template-rows\|AgentStep\|glass" packages/ui/src/components/AgentAccordion.tsx
    Expected Result: 3+ matches for key patterns
    Evidence: .sisyphus/evidence/task-13-accordion.txt
  ```

  **Commit**: YES — `feat(ui): Liquid Glass design system — 7 components with depth, noise, springs`

- [ ] 14. Overhaul raino-site Layout (Navbar + Footer + Globals)

  **What to do**:
  - Update `apps/site/src/app/layout.tsx`: add GlassProvider from Filters.tsx, ensure Noto Serif via `next/font/google`
  - Update `apps/site/src/app/globals.css`: import glass.css, replace old `.glass-card` with new utilities
  - Update `apps/site/src/components/Navbar.tsx`:
    - Glass navbar: `rgba(10,25,41,0.80)` + blur(20px) + saturate(160%)
    - Blue-tinted border bottom: `rgba(97,145,211,0.2)`
    - Language links styled as glass badges
    - Mobile menu: glass-elevated panel
  - Update `apps/site/src/components/Footer.tsx`:
    - Glass footer: `rgba(10,25,41,0.90)` + blur(20px)
    - Subtle top border: `rgba(97,145,211,0.15)`
  - Brand register: editorial typography scale, asymmetric layouts, scroll choreography potential

  **Must NOT do**: Do NOT change routing structure. Do NOT add new pages. Do NOT use identical card grids (Impeccable ban).

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: [`impeccable`]

  **Parallelization**:
  - **Can Run In Parallel**: NO (foundation for 15-18)
  - **Parallel Group**: Wave 3A start
  - **Blocks**: Tasks 15-18
  - **Blocked By**: Tasks 7-12

  **References**:
  - `apps/site/src/app/layout.tsx` — Root layout
  - `apps/site/src/app/globals.css` — Site CSS
  - `apps/site/src/components/Navbar.tsx` — Current navbar
  - `apps/site/src/components/Footer.tsx` — Current footer
  - `.agents/skills/impeccable/reference/brand.md` — Brand register typography, layout, motion rules

  **Acceptance Criteria**:
  - [ ] Navbar has glass effect with blur and blue-tinted border
  - [ ] Footer has glass effect
  - [ ] GlassProvider renders SVG filters in DOM
  - [ ] Noto Serif loaded via next/font/google
  - [ ] `pnpm build` exits 0

  **QA Scenarios**:
  ```
  Scenario: Site layout renders with glass
    Tool: Playwright
    Steps:
      1. Navigate to https://raino-site.vercel.app (or localhost:3000)
      2. Screenshot navbar and footer
      3. Assert navbar has backdrop-filter CSS
    Expected Result: Glass navbar and footer visible in screenshot
    Evidence: .sisyphus/evidence/task-14-site-layout.png
  ```

  **Commit**: NO (groups with Wave 3A)

- [ ] 15. Overhaul raino-site Homepage

  **What to do**:
  - Redesign `apps/site/src/app/page.tsx` with Liquid Glass brand register
  - Hero section: Drenched color strategy — `#1565C0` blue carries 30-60% of hero surface
  - Hero uses fluid `clamp()` typography with ≥1.25 ratio between steps
  - Feature section: varied card sizes (not identical grid), glass-surface cards with depth
  - Replace ASCII architecture diagram with React GlassCard component from `@raino/ui/diagrams`
  - Testimonials section: glass-elevated cards with specular highlights
  - All sections: multi-layer shadows, noise texture on glass surfaces
  - Imagery: use Unsplash photos for PCB/hardware imagery where appropriate
  - Asymmetric layout (not centered stack) — per Impeccable brand register rules

  **Must NOT do**: Do NOT use side-stripe borders, gradient text, or identical card grids (Impeccable bans). Do NOT default to centering everything.

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: [`impeccable`]

  **Parallelization**:
  - **Can Run In Parallel**: NO (depends on 14)
  - **Parallel Group**: Wave 3A sequential
  - **Blocks**: Task 27
  - **Blocked By**: Task 14

  **References**:
  - `apps/site/src/app/page.tsx` — Current homepage
  - `.agents/skills/impeccable/reference/brand.md` — Brand layout, color strategy, imagery rules

  **Acceptance Criteria**:
  - [ ] Hero section uses drenched/committed color strategy
  - [ ] No identical card grids (varied sizes)
  - [ ] ASCII diagram replaced with React components
  - [ ] Glass cards have depth shadows + specular highlights
  - [ ] `pnpm build` exits 0

  **QA Scenarios**:
  ```
  Scenario: Homepage glass rendering
    Tool: Playwright
    Steps:
      1. Navigate to homepage
      2. Take full-page screenshot
      3. Verify hero has blue color coverage
      4. Verify cards have different sizes
    Expected Result: Liquid Glass homepage with depth and brand presence
    Evidence: .sisyphus/evidence/task-15-homepage.png
  ```

  **Commit**: NO (groups with Wave 3A)

- [ ] 16. Overhaul raino-site /features Page

  **What to do**:
  - Apply Liquid Glass styling to `apps/site/src/app/features/page.tsx`
  - Feature cards: glass-surface with varied sizes and depth
  - Headings: Noto Serif with strong weight contrast
  - Committed color strategy — blue accent on feature highlights

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: [`impeccable`]

  **Parallelization**:
  - **Can Run In Parallel**: YES (with Tasks 17-18, after 14)
  - **Parallel Group**: Wave 3A
  - **Blocks**: None
  - **Blocked By**: Task 14

  **References**:
  - `apps/site/src/app/features/page.tsx` — Current features page

  **Acceptance Criteria**:
  - [ ] Features page uses glass cards with depth
  - [ ] No identical card grid
  - [ ] `pnpm build` exits 0

  **QA Scenarios**:
  ```
  Scenario: Features page glass rendering
    Tool: Playwright
    Steps:
      1. Navigate to /features
      2. Take screenshot
    Expected Result: Liquid Glass features page
    Evidence: .sisyphus/evidence/task-16-features.png
  ```

  **Commit**: NO (groups with Wave 3A)

- [ ] 17. Overhaul raino-site /architecture Page

  **What to do**:
  - Apply Liquid Glass styling to `apps/site/src/app/architecture/page.tsx`
  - Replace any remaining ASCII art with React diagram components from `@raino/ui/diagrams`
  - Architecture diagram: GlassCard nodes with glass-elevated styling, ConnectionLine with gradient
  - Workflow diagram: glass-surface step cards with depth progression
  - Blue-tinted connections between components
  - Maximum glass intensity on diagram cards

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: [`impeccable`]

  **Parallelization**:
  - **Can Run In Parallel**: YES (with Tasks 16, 18, after 14)
  - **Parallel Group**: Wave 3A
  - **Blocks**: Task 25 (SVG generation)
  - **Blocked By**: Tasks 14, 11

  **References**:
  - `apps/site/src/app/architecture/page.tsx` — Current page with inline diagram components
  - `packages/ui/src/components/diagrams/` — Extracted diagram components

  **Acceptance Criteria**:
  - [ ] Architecture page uses React diagrams, not ASCII
  - [ ] Diagram cards have glass-elevated styling with maximum intensity
  - [ ] `pnpm build` exits 0

  **QA Scenarios**:
  ```
  Scenario: Architecture diagrams rendered as React components
    Tool: Playwright
    Steps:
      1. Navigate to /architecture
      2. Take full-page screenshot
      3. Assert no <pre> elements with ASCII art
    Expected Result: React diagram components with glass styling, no ASCII art
    Evidence: .sisyphus/evidence/task-17-architecture.png
  ```

  **Commit**: NO (groups with Wave 3A)

- [ ] 18. Overhaul raino-site Remaining Pages + next-intl Setup

  **What to do**:
  - Apply Liquid Glass to remaining site pages: /workflow, /docs, /integrations, /showcase, /changelog, /trust
  - Set up next-intl infrastructure:
    - Create `apps/site/src/i18n/` with configuration
    - Create `apps/site/src/i18n/messages/en.json` with English message catalogs
    - Create `apps/site/src/i18n/request.ts` for next-intl request config
    - Update `apps/site/src/middleware.ts` (or create) for locale routing
    - Wrap layout with `NextIntlClientProvider`
  - Keep existing /zh, /ja, /ko page files working (don't break them)
  - Create placeholder message catalogs: `zh.json`, `ja.json`, `ko.json` (empty or minimal)
  - Update Navbar language links to use next-intl routing

  **Recommended Agent Profile**:
  - **Category**: `deep`
  - **Skills**: [`impeccable`]

  **Parallelization**:
  - **Can Run In Parallel**: YES (with Tasks 15-17, after 14)
  - **Parallel Group**: Wave 3A
  - **Blocks**: Task 27 (message catalogs)
  - **Blocked By**: Task 14

  **References**:
  - `apps/site/src/app/page.tsx` — Homepage for message extraction
  - `apps/site/src/components/Navbar.tsx` — Language links to update
  - next-intl docs: https://next-intl.dev/docs/getting-started/app-router

  **Acceptance Criteria**:
  - [ ] next-intl configured with middleware and provider
  - [ ] English message catalog exists with all site page content
  - [ ] All site pages have Liquid Glass styling
  - [ ] Existing /zh, /ja, /ko pages still work
  - [ ] `pnpm build` exits 0

  **QA Scenarios**:
  ```
  Scenario: next-intl infrastructure works
    Tool: Bash
    Steps:
      1. ls apps/site/src/i18n/
      2. grep "NextIntlClientProvider" apps/site/src/app/layout.tsx
      3. test -f apps/site/src/i18n/messages/en.json && echo "en.json exists"
    Expected Result: i18n directory with config, provider in layout, English catalog
    Evidence: .sisyphus/evidence/task-18-i18l.txt
  ```

  **Commit**: YES — `feat(site): iOS 26 Liquid Glass overhaul + next-intl setup`

- [ ] 19. Overhaul raino-studio Layout (Header + Globals)

  **What to do**:
  - Update `apps/studio/src/app/layout.tsx`: add GlassProvider, ensure Noto Serif via `next/font/google`
  - Update `apps/studio/src/app/globals.css`: import glass.css, replace old `.glass-card` etc.
  - Update `apps/studio/src/components/layout/header.tsx`:
    - Glass header: `rgba(10,25,41,0.85)` + blur(20px) + saturate(160%)
    - Blue-tinted bottom border
  - Product register: tighter type scale (1.125-1.2 ratio), denser layout, minimal motion
  - All glass components: 150-250ms transitions (not choreographed page loads)

  **Must NOT do**: Do NOT add page-load animation sequences. Do NOT use display fonts in UI labels/buttons.

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: [`impeccable`]

  **Parallelization**:
  - **Can Run In Parallel**: NO (foundation for 20-24)
  - **Parallel Group**: Wave 3B start (parallel with Wave 3A after Wave 2)
  - **Blocks**: Tasks 20-24
  - **Blocked By**: Tasks 7-12

  **References**:
  - `apps/studio/src/app/layout.tsx` — Root layout
  - `apps/studio/src/app/globals.css` — Studio CSS
  - `apps/studio/src/components/layout/header.tsx` — Current header
  - `.agents/skills/impeccable/reference/product.md` — Product register rules

  **Acceptance Criteria**:
  - [ ] Header has glass effect
  - [ ] GlassProvider in DOM
  - [ ] Product register type scale applied
  - [ ] `pnpm build` exits 0

  **QA Scenarios**:
  ```
  Scenario: Studio header glass rendering
    Tool: Playwright
    Steps:
      1. Navigate to https://raino-studio.vercel.app (or localhost:3001)
      2. Screenshot header
    Expected Result: Glass header with depth
    Evidence: .sisyphus/evidence/task-19-studio-header.png
  ```

  **Commit**: NO (groups with Wave 3B)

- [ ] 20. Overhaul raino-studio Intake Page with Agent Accordion

  **What to do**:
  - Update `apps/studio/src/app/projects/[id]/intake/page.tsx`
  - Integrate `AgentAccordion` component for thinking process display
  - Each LLM call step shows as accordion item: label, status, thinking content, result
  - Chat messages: glass-styled bubbles (user: glass-blue-tint, assistant: glass-surface)
  - Rendered markdown output (react-markdown already in use — keep it)
  - Expand icon on each step shows full thinking process
  - Collapsed by default, click to expand
  - Glass-surface background for the chat area

  **Must NOT do**: Do NOT add syntax highlighting to thinking text. Do NOT change SSE streaming behavior.

  **Recommended Agent Profile**:
  - **Category**: `deep`
  - **Skills**: [`impeccable`]

  **Parallelization**:
  - **Can Run In Parallel**: YES (with Tasks 21-24, after 19)
  - **Parallel Group**: Wave 3B
  - **Blocks**: None
  - **Blocked By**: Tasks 19, 13

  **References**:
  - `apps/studio/src/app/projects/[id]/intake/page.tsx` — Current intake with ThinkingBlock
  - `packages/ui/src/components/AgentAccordion.tsx` — New accordion component
  - `.agents/skills/impeccable/reference/product.md` — Product register motion rules

  **Acceptance Criteria**:
  - [ ] Intake page uses AgentAccordion for thinking display
  - [ ] Chat bubbles have glass styling
  - [ ] Markdown rendering preserved
  - [ ] `pnpm build` exits 0

  **QA Scenarios**:
  ```
  Scenario: Agent accordion renders on intake page
    Tool: Playwright
    Steps:
      1. Navigate to a project intake page
      2. Take screenshot of chat area
      3. Verify accordion step headers visible
    Expected Result: Glass-styled chat with accordion thinking
    Evidence: .sisyphus/evidence/task-20-intake.png
  ```

  **Commit**: NO (groups with Wave 3B)

- [ ] 21. Overhaul raino-studio Spec + Architecture Pages

  **What to do**:
  - Update `apps/studio/src/app/projects/[id]/spec/page.tsx`: glass-surface containers, glass-elevated spec cards
  - Update `apps/studio/src/app/projects/[id]/architecture/page.tsx`: glass-elevated architecture display
  - Status indicators: glass-badge styling for priority/category
  - Recompile/trigger buttons: glass-styled with hover depth

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: [`impeccable`]

  **Parallelization**:
  - **Can Run In Parallel**: YES (with Tasks 20, 22-24, after 19)
  - **Parallel Group**: Wave 3B
  - **Blocks**: None
  - **Blocked By**: Task 19

  **References**:
  - `apps/studio/src/app/projects/[id]/spec/page.tsx`
  - `apps/studio/src/app/projects/[id]/architecture/page.tsx`

  **Acceptance Criteria**:
  - [ ] Both pages use glass containers with depth
  - [ ] `pnpm build` exits 0

  **QA Scenarios**:
  ```
  Scenario: Spec and architecture pages render glass
    Tool: Playwright
    Steps:
      1. Navigate to spec page, screenshot
      2. Navigate to architecture page, screenshot
    Expected Result: Glass-styled pages
    Evidence: .sisyphus/evidence/task-21-spec-arch.png
  ```

  **Commit**: NO (groups with Wave 3B)

- [ ] 22. Overhaul raino-studio BOM + Design + Validate + Quote Pages

  **What to do**:
  - Update BOM page: glass-elevated table, glass-badge risk indicators, glass-styled action buttons
  - Update Design page: glass-surface job status, glass-styled progress
  - Update Validate page: glass-surface ERC/DRC results
  - Update Quote page: glass-elevated quote cards with confidence band visualization
  - Update Previews page: glass-surface preview containers
  - Update Downloads page: glass-styled download list
  - Product register: consistent component vocabulary across all pages

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: [`impeccable`]

  **Parallelization**:
  - **Can Run In Parallel**: YES (with Tasks 20-21, 23-24, after 19)
  - **Parallel Group**: Wave 3B
  - **Blocks**: None
  - **Blocked By**: Task 19

  **References**:
  - `apps/studio/src/app/projects/[id]/bom/page.tsx`
  - `apps/studio/src/app/projects/[id]/design/page.tsx`
  - `apps/studio/src/app/projects/[id]/validate/page.tsx`
  - `apps/studio/src/app/projects/[id]/quote/page.tsx`
  - `apps/studio/src/app/projects/[id]/previews/page.tsx`
  - `apps/studio/src/app/projects/[id]/downloads/page.tsx`

  **Acceptance Criteria**:
  - [ ] All 6 pages use consistent glass component vocabulary
  - [ ] `pnpm build` exits 0

  **QA Scenarios**:
  ```
  Scenario: All pipeline pages have glass styling
    Tool: Playwright
    Steps:
      1. Navigate to each of the 6 pages, take screenshots
    Expected Result: Consistent glass styling across all pages
    Evidence: .sisyphus/evidence/task-22-pipeline-pages.png
  ```

  **Commit**: NO (groups with Wave 3B)

- [ ] 23. Build Shortlist/Candidates Pipeline Page (Step 4)

  **What to do**:
  - Create `apps/studio/src/app/projects/[id]/shortlist/page.tsx`
  - Fetch candidates from `GET /api/projects/[id]/ingest/candidates`
  - Display candidate parts in glass-surface cards grouped by component type
  - Each candidate card shows: part number, supplier, description, status
  - Allow user to review and promote candidates
  - "Promote" action calls `POST /api/projects/[id]/ingest/promote`
  - Progress indicator showing step 4 of 12
  - Product register: dense data table, no decorative motion

  **Recommended Agent Profile**:
  - **Category**: `deep`
  - **Skills**: [`impeccable`]

  **Parallelization**:
  - **Can Run In Parallel**: YES (with Tasks 20-22, 24, after 19)
  - **Parallel Group**: Wave 3B
  - **Blocks**: Task 29 (E2E test)
  - **Blocked By**: Task 19

  **References**:
  - `apps/studio/src/app/api/projects/[id]/ingest/candidates/route.ts` — GET/POST API
  - `apps/studio/src/app/api/projects/[id]/ingest/promote/route.ts` — POST promote
  - `apps/studio/src/app/projects/[id]/bom/page.tsx` — Reference for existing pipeline page pattern
  - `apps/studio/src/lib/data/project-queries.ts` — STATUS_TO_STEP mapping

  **Acceptance Criteria**:
  - [ ] `/projects/[id]/shortlist` page exists and renders
  - [ ] Fetches candidate parts from API
  - [ ] Glass-styled candidate cards
  - [ ] Promote action calls correct API
  - [ ] `pnpm build` exits 0

  **QA Scenarios**:
  ```
  Scenario: Shortlist page renders with candidates
    Tool: Playwright
    Steps:
      1. Navigate to /projects/[id]/shortlist
      2. Verify page loads without error
      3. Verify glass card styling
    Expected Result: Shortlist page with candidate cards in glass containers
    Evidence: .sisyphus/evidence/task-23-shortlist.png
  ```

  **Commit**: NO (groups with Wave 3B)

- [ ] 24. Build Ingestion Progress Pipeline Page (Step 5)

  **What to do**:
  - Create `apps/studio/src/app/projects/[id]/ingestion/page.tsx`
  - Show 8-stage ingestion pipeline progress:
    candidate-discovery → doc-fetch → raw-store → normalize → chunk → enrich-metadata → embedding → vector-store → sufficiency-gate
  - Fetch status from `GET /api/projects/[id]/ingest/status`
  - Trigger button calls `POST /api/projects/[id]/ingest/trigger`
  - Each stage shows: status (pending/running/complete/error), progress indicator, timing
  - Glass-surface container for each stage
  - Auto-refresh status while running (poll every 2s)
  - "Run Ingestion" button with glass-elevated styling
  - Show error details if any stage fails

  **Recommended Agent Profile**:
  - **Category**: `deep`
  - **Skills**: [`impeccable`]

  **Parallelization**:
  - **Can Run In Parallel**: YES (with Tasks 20-23, after 19)
  - **Parallel Group**: Wave 3B
  - **Blocks**: Task 29 (E2E test)
  - **Blocked By**: Task 19

  **References**:
  - `apps/studio/src/app/api/projects/[id]/ingest/trigger/route.ts` — POST trigger
  - `apps/studio/src/app/api/projects/[id]/ingest/status/route.ts` — GET status
  - `apps/studio/src/app/api/projects/[id]/ingest/run/route.ts` — POST run
  - `services/ingest-worker/src/index.ts` — 8-stage pipeline exports

  **Acceptance Criteria**:
  - [ ] `/projects/[id]/ingestion` page exists and renders
  - [ ] Shows 8-stage progress with status indicators
  - [ ] Trigger button calls API
  - [ ] Auto-refresh while running
  - [ ] `pnpm build` exits 0

  **QA Scenarios**:
  ```
  Scenario: Ingestion page renders with progress stages
    Tool: Playwright
    Steps:
      1. Navigate to /projects/[id]/ingestion
      2. Verify 8 stages visible
      3. Verify trigger button present
    Expected Result: Ingestion progress page with 8 glass-styled stages
    Evidence: .sisyphus/evidence/task-24-ingestion.png
  ```

  **Commit**: YES — `feat(studio): iOS 26 Liquid Glass overhaul + Shortlist + Ingestion pages`

- [ ] 25. Generate SVG Architecture Diagram Images

  **What to do**:
  - Use Playwright to screenshot the React GlassCard diagram components from the live `/architecture` page
  - Alternatively, create standalone SVG files that replicate the Liquid Glass diagram style:
    - Glass rectangles with gradient fills (`rgba(10,25,41,0.6)` → `rgba(21,101,192,0.15)`)
    - Blue-tinted borders
    - Connection lines with gradients
    - Text labels in Noto Serif
  - Generate 4 SVG files: `docs/assets/architecture-overview.svg`, `architecture-flow.svg`, `architecture-layers.svg`, `architecture-pipeline.svg`
  - Each SVG must render correctly in GitHub Markdown

  **Must NOT do**: Do NOT make SVGs interactive. Do NOT exceed 100KB per SVG. Do NOT embed React code in READMEs.

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: [`impeccable`]

  **Parallelization**:
  - **Can Run In Parallel**: YES (with Tasks 26-27)
  - **Parallel Group**: Wave 4
  - **Blocks**: Task 26
  - **Blocked By**: Tasks 11, 17

  **References**:
  - `apps/site/src/app/architecture/page.tsx` — Source React diagrams to replicate
  - `packages/ui/src/components/diagrams/` — GlassCard/ConnectionLine components

  **Acceptance Criteria**:
  - [ ] 4 SVG files in `docs/assets/`
  - [ ] Each renders in GitHub Markdown
  - [ ] Glass-like appearance with gradients and depth

  **QA Scenarios**:
  ```
  Scenario: SVG files exist and render
    Tool: Bash
    Steps:
      1. ls -la docs/assets/architecture-*.svg
      2. for f in docs/assets/architecture-*.svg; do grep -c "<svg" $f; done
    Expected Result: 4 SVG files, each has <svg> root element
    Evidence: .sisyphus/evidence/task-25-svg-diagrams.txt
  ```

  **Commit**: NO (groups with Wave 4)

- [ ] 26. Update All 4 README.md Files with SVG + Language Links

  **What to do**:
  - Update `README.md` (English):
    - Replace ASCII art diagram with `![Architecture](docs/assets/architecture-overview.svg)`
    - Add language links at top: `[English](README.md) · [中文](README.zh-CN.md) · [日本語](README.ja.md) · [한국어](README.ko.md)`
    - Update site URLs to include language variants
  - Update `README.zh-CN.md`: same SVG embeds, same language link bar at top
  - Update `README.ja.md`: same SVG embeds, same language link bar at top
  - Update `README.ko.md`: same SVG embeds, same language link bar at top
  - Ensure SVG image paths work in GitHub Markdown (relative paths)

  **Must NOT do**: Do NOT rewrite README content — only diagrams and language links. Do NOT add emojis.

  **Recommended Agent Profile**:
  - **Category**: `writing`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (with Tasks 25, 27)
  - **Parallel Group**: Wave 4
  - **Blocks**: None
  - **Blocked By**: Task 25

  **References**:
  - `README.md` — Main English README
  - `README.zh-CN.md`, `README.ja.md`, `README.ko.md` — Translated READMEs
  - `docs/assets/architecture-*.svg` — SVG files from Task 25

  **Acceptance Criteria**:
  - [ ] All 4 READMEs have SVG architecture diagrams (not ASCII)
  - [ ] All 4 READMEs have language link bar at top
  - [ ] SVG paths are valid in GitHub Markdown context

  **QA Scenarios**:
  ```
  Scenario: README diagrams and language links
    Tool: Bash
    Steps:
      1. grep -c "architecture-.*\.svg" README.md README.zh-CN.md README.ja.md README.ko.md
      2. grep -c "中文\|日本語\|한국어\|English" README.md README.zh-CN.md README.ja.md README.ko.md
    Expected Result: Each README has SVG references and language links (4 matches each)
    Evidence: .sisyphus/evidence/task-26-readmes.txt
  ```

  **Commit**: NO (groups with Wave 4)

- [ ] 27. Set up next-intl English Message Catalogs for Site

  **What to do**:
  - Complete the English message catalog: `apps/site/src/i18n/messages/en.json`
  - Extract all English text from site pages into message keys
  - Organize by page: `home`, `features`, `architecture`, `workflow`, `docs`, `nav`, `footer`
  - Update site pages to use `useTranslations()` hook where next-intl is configured
  - Verify English pages render identically (no visual change from extraction)
  - Create minimal placeholder catalogs for zh, ja, ko (can be `{}` initially)

  **Must NOT do**: Do NOT translate any content in this phase. Do NOT break existing static page files (they remain as fallback).

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (with Tasks 25-26)
  - **Parallel Group**: Wave 4
  - **Blocks**: None
  - **Blocked By**: Task 18

  **References**:
  - `apps/site/src/i18n/` — next-intl config from Task 18
  - `apps/site/src/app/page.tsx` — English text to extract
  - next-intl docs: https://next-intl.dev/docs/getting-started/app-router

  **Acceptance Criteria**:
  - [ ] `en.json` has message keys for all site page sections
  - [ ] English pages render identically to before
  - [ ] `pnpm build` exits 0

  **QA Scenarios**:
  ```
  Scenario: Message catalog completeness
    Tool: Bash
    Steps:
      1. wc -l apps/site/src/i18n/messages/en.json
      2. grep -c '"home"\|"features"\|"architecture"\|"nav"' apps/site/src/i18n/messages/en.json
    Expected Result: en.json has 50+ lines, 4+ page sections
    Evidence: .sisyphus/evidence/task-27-catalogs.txt
  ```

  **Commit**: YES — `docs: SVG architecture diagrams + README updates + next-intl English catalogs`

- [ ] 28. Create Mock LLM Adapter for Deterministic Testing

  **What to do**:
  - Create `apps/studio/src/lib/llm/mock-adapter.ts`
  - Returns canned responses for each pipeline step:
    - Intake: "I'll help you design a PCB. What are you building?"
    - Clarify: 2 follow-up questions about the project
    - Spec: Valid JSON spec for RP2040 Pico Clone (known-good fixture)
    - Architecture: Valid JSON architecture plan
    - BOM: Valid JSON BOM with 8 line items (RP2040, flash, LDO, USB-C, passives)
  - Each response respects the SSE streaming format (tokens via ReadableStream)
  - Returns within 1 second (no thinking delay in mock mode)
  - Detect mock mode via env var or config flag: `MOCK_LLM=true`

  **Must NOT do**: Do NOT modify existing LLM routes. Do NOT break real LLM functionality.

  **Recommended Agent Profile**:
  - **Category**: `deep`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (with Tasks 29-31)
  - **Parallel Group**: Wave 5
  - **Blocks**: Task 29
  - **Blocked By**: None

  **References**:
  - `packages/llm/src/gateway.ts` — LLM gateway interface
  - `packages/llm/src/providers/kimi.ts` — Current provider (SSE streaming pattern)
  - `apps/studio/src/app/api/projects/[id]/intake/route.ts` — SSE response format

  **Acceptance Criteria**:
  - [ ] Mock adapter returns valid SSE responses for each step
  - [ ] `MOCK_LLM=true` enables mock mode
  - [ ] Responses complete in <1s

  **QA Scenarios**:
  ```
  Scenario: Mock adapter returns valid responses
    Tool: Bash
    Steps:
      1. MOCK_LLM=true pnpm test --filter @raino/studio 2>&1 | tail -5
    Expected Result: Tests pass with mock LLM
    Evidence: .sisyphus/evidence/task-28-mock-adapter.txt
  ```

  **Commit**: NO (groups with Wave 5)

- [ ] 29. E2E Playwright Test: Full 12-Step Pipeline

  **What to do**:
  - Create Playwright E2E test that exercises the entire pipeline:
    1. `POST /api/projects` → create project (assert status=201)
    2. `POST /api/projects/[id]/intake` → send message (assert SSE stream)
    3. Continue intake until status → `clarifying`
    4. Continue until status → `spec_compiled`
    5. `POST /api/projects/[id]/architecture/plan` (assert architecture data)
    6. `GET /api/projects/[id]/ingest/candidates` (assert candidates returned)
    7. `POST /api/projects/[id]/ingest/trigger` (assert ingestion started)
    8. Poll `GET /api/projects/[id]/ingest/status` until complete
    9. `POST /api/projects/[id]/bom/generate` (assert BOM data)
    10. `POST /api/projects/[id]/design` (assert design job queued)
    11. `POST /api/projects/[id]/validate` (assert validation results)
    12. `POST /api/projects/[id]/quote` (assert quote with confidence bands)
  - Use `MOCK_LLM=true` for deterministic responses
  - Assert final status is `quoted`
  - Capture screenshots at each step
  - Save evidence to `.sisyphus/evidence/task-29-e2e/`

  **Recommended Agent Profile**:
  - **Category**: `deep`
  - **Skills**: [`playwright`]

  **Parallelization**:
  - **Can Run In Parallel**: YES (with Tasks 30-31)
  - **Parallel Group**: Wave 5
  - **Blocks**: Task 32
  - **Blocked By**: Tasks 23, 24, 28

  **References**:
  - `apps/studio/src/lib/data/project-queries.ts` — Status flow
  - `apps/studio/src/app/api/projects/[id]/` — All API routes
  - Playwright Bridge Extension config: token `ijEqotN-prPeagViGZHfYE2RpBFAG_aTfytT-FDUoTc`

  **Acceptance Criteria**:
  - [ ] E2E test passes all 12 steps
  - [ ] Final status = `quoted`
  - [ ] Screenshots captured at each step
  - [ ] Test runs in <60 seconds with mock LLM

  **QA Scenarios**:
  ```
  Scenario: Full pipeline E2E passes
    Tool: Bash
    Steps:
      1. MOCK_LLM=true npx playwright test e2e/pipeline-full.spec.ts
    Expected Result: All 12 steps pass, evidence files generated
    Evidence: .sisyphus/evidence/task-29-e2e/summary.txt
  ```

  **Commit**: NO (groups with Wave 5)

- [ ] 30. E2E Playwright Test: Multi-Language Site Verification

  **What to do**:
  - Create Playwright test navigating to each site page in each locale:
    - `/` → assert no broken layout, no English text leakage
    - `/features` → assert renders
    - `/architecture` → assert React diagrams render
    - `/zh` → assert Chinese content, no broken layout
    - `/ja` → assert Japanese content, no broken layout
    - `/ko` → assert Korean content, no broken layout
  - Assert all navbar links resolve (no 404s)
  - Assert language switcher works
  - Take screenshots of each locale/page combo
  - Save evidence to `.sisyphus/evidence/task-30-i18n/`

  **Recommended Agent Profile**:
  - **Category**: `deep`
  - **Skills**: [`playwright`]

  **Parallelization**:
  - **Can Run In Parallel**: YES (with Tasks 29, 31)
  - **Parallel Group**: Wave 5
  - **Blocks**: Task 32
  - **Blocked By**: Task 18

  **References**:
  - `apps/site/src/components/Navbar.tsx` — Language links

  **Acceptance Criteria**:
  - [ ] All 6 page/locale combos render without 404
  - [ ] No broken layouts
  - [ ] Language switcher navigates correctly

  **QA Scenarios**:
  ```
  Scenario: Multi-language pages render correctly
    Tool: Playwright
    Steps:
      1. Navigate to /, /zh, /ja, /ko, /features, /architecture
      2. Assert HTTP 200 for each
      3. Take screenshots
    Expected Result: All pages render, no 404s
    Evidence: .sisyphus/evidence/task-30-i18n/
  ```

  **Commit**: NO (groups with Wave 5)

- [ ] 31. Bundle Size Audit + Performance Optimization

  **What to do**:
  - Run `pnpm build` and check output sizes
  - Verify no page exceeds 200KB gzipped
  - Check LazyMotion usage (not full framer-motion): `grep -r "from 'framer-motion'" packages/ apps/` should return 0
  - Check no SVG filters in critical path (lazy-loaded)
  - Run Lighthouse on both apps (or at least check Core Web Vitals)
  - Optimize: dynamic imports for diagram components, code splitting for motion
  - If any page exceeds budget: identify and fix the bloat

  **Recommended Agent Profile**:
  - **Category**: `deep`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (with Tasks 29-30)
  - **Parallel Group**: Wave 5
  - **Blocks**: Task 32
  - **Blocked By**: Tasks 29, 30

  **Acceptance Criteria**:
  - [ ] No page > 200KB gzipped
  - [ ] Zero `from 'framer-motion'` imports (LazyMotion only)
  - [ ] SVG filters not in initial bundle

  **QA Scenarios**:
  ```
  Scenario: Bundle size within budget
    Tool: Bash
    Steps:
      1. pnpm build 2>&1 | grep -E "(kB|MB|Route)"
      2. grep -r "from 'framer-motion'" packages/ apps/ || echo "No direct framer-motion imports (good)"
    Expected Result: All pages < 200KB gzipped, zero direct framer-motion imports
    Evidence: .sisyphus/evidence/task-31-bundle.txt
  ```

  **Commit**: NO (groups with Wave 5)

- [ ] 32. Deploy to Vercel + GitHub with Zero Errors

  **What to do**:
  - Run full CI gate: `pnpm typecheck && pnpm lint && pnpm test && pnpm build`
  - Verify all pass (exit 0)
  - Git add, commit, push to main
  - Verify both Vercel projects deploy successfully:
    - `https://vercel.com/tudsds-projects/raino-site`
    - `https://vercel.com/tudsds-projects/raino-studio`
  - Smoke test: `curl -s -o /dev/null -w "%{http_code}" https://raino-site.vercel.app` → 200
  - Smoke test: `curl -s -o /dev/null -w "%{http_code}" https://raino-studio.vercel.app` → 200
  - Verify deployment has zero errors in Vercel dashboard

  **Must NOT do**: Do NOT force push. Do NOT skip CI checks.

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: NO (final task)
  - **Parallel Group**: Wave 5 final
  - **Blocks**: F1-F4
  - **Blocked By**: Tasks 29, 30, 31

  **Acceptance Criteria**:
  - [ ] `pnpm typecheck` exits 0
  - [ ] `pnpm lint` exits 0
  - [ ] `pnpm test` exits 0 (692+ pass)
  - [ ] `pnpm build` exits 0
  - [ ] Both Vercel projects deploy with status "Ready"
  - [ ] Both live URLs return HTTP 200

  **QA Scenarios**:
  ```
  Scenario: Full CI gate passes
    Tool: Bash
    Steps:
      1. pnpm typecheck && echo "TYPECHECK OK"
      2. pnpm lint && echo "LINT OK"
      3. pnpm test 2>&1 | tail -3
      4. pnpm build 2>&1 | tail -3
    Expected Result: All pass, 692+ tests, build succeeds
    Evidence: .sisyphus/evidence/task-32-ci-gate.txt

  Scenario: Deployment successful
    Tool: Bash
    Steps:
      1. curl -s -o /dev/null -w "%{http_code}" https://raino-site.vercel.app
      2. curl -s -o /dev/null -w "%{http_code}" https://raino-studio.vercel.app
    Expected Result: Both return 200
    Evidence: .sisyphus/evidence/task-32-deploy.txt
  ```

  **Commit**: YES — `test: E2E pipeline + i18n verification + deploy`

---

## Final Verification Wave (MANDATORY — after ALL implementation tasks)

> 4 review agents run in PARALLEL. ALL must APPROVE. Present consolidated results to user and get explicit "okay" before completing.
>
> **Do NOT auto-proceed after verification. Wait for user's explicit approval before marking work complete.**
> **Never mark F1-F4 as checked before getting user's okay.** Rejection or user feedback → fix → re-run → present again → wait for okay.

- [ ] F1. **Plan Compliance Audit** — `oracle`
  Read the plan end-to-end. For each "Must Have": verify implementation exists (read file, curl endpoint, run command). For each "Must NOT Have": search codebase for forbidden patterns — reject with file:line if found. Check evidence files exist in .sisyphus/evidence/. Compare deliverables against plan.
  Output: `Must Have [N/N] | Must NOT Have [N/N] | Tasks [N/N] | VERDICT: APPROVE/REJECT`

- [ ] F2. **Code Quality Review** — `unspecified-high`
  Run `pnpm typecheck && pnpm lint && pnpm test && pnpm build`. Review all changed files for: `as any`/`@ts-ignore`, empty catches, console.log in prod, commented-out code, unused imports. Check AI slop: excessive comments, over-abstraction, generic names. Verify no `backdrop-filter` stacking (max 1 blur layer per element). Check LazyMotion usage (not full framer-motion).
  Output: `Build [PASS/FAIL] | Lint [PASS/FAIL] | Tests [N pass/N fail] | Files [N clean/N issues] | VERDICT`

- [ ] F3. **Real Manual QA** — `unspecified-high` (+ `playwright` skill)
  Start from clean state. Execute EVERY QA scenario from EVERY task — follow exact steps, capture evidence. Test cross-task integration (pipeline flow, glass rendering, navigation). Test edge cases: `prefers-reduced-motion`, mobile viewport, no backdrop-filter fallback. Save to `.sisyphus/evidence/final-qa/`.
  Output: `Scenarios [N/N pass] | Integration [N/N] | Edge Cases [N tested] | VERDICT`

- [ ] F4. **Scope Fidelity Check** — `deep`
  For each task: read "What to do", read actual diff (git log/diff). Verify 1:1 — everything in spec was built (no missing), nothing beyond spec was built (no creep). Check "Must NOT Have" compliance. Detect cross-task contamination. Flag unaccounted changes. Verify no chromatic aberration/displacement map filters were added.
  Output: `Tasks [N/N compliant] | Contamination [CLEAN/N issues] | Unaccounted [CLEAN/N files] | VERDICT`

---

## Commit Strategy

- **Wave 1**: `feat(ui): foundation — tokens, filters, deps, STATUS fix` — multiple files
- **Wave 2**: `feat(ui): Liquid Glass design system — 7 components upgraded` — packages/ui/src/components/
- **Wave 3A**: `feat(site): iOS 26 Liquid Glass overhaul + next-intl setup` — apps/site/
- **Wave 3B**: `feat(studio): iOS 26 Liquid Glass overhaul + pipeline pages` — apps/studio/
- **Wave 4**: `docs: SVG architecture diagrams + README updates + i18n catalogs` — docs/, README*.md
- **Wave 5**: `test: E2E pipeline + i18n verification + deploy` — tests/, .sisyphus/evidence/
- Pre-commit: `pnpm typecheck && pnpm lint && pnpm test`

---

## Success Criteria

### Verification Commands
```bash
pnpm typecheck                              # Expected: exit 0
pnpm lint                                   # Expected: exit 0
pnpm test                                   # Expected: 692+ tests pass, 0 failures
pnpm build                                  # Expected: exit 0, no page > 200KB gzipped
curl -s -o /dev/null -w "%{http_code}" https://raino-site.vercel.app       # Expected: 200
curl -s -o /dev/null -w "%{http_code}" https://raino-studio.vercel.app     # Expected: 200
```

### Final Checklist
- [ ] All "Must Have" present
- [ ] All "Must NOT Have" absent
- [ ] All 692+ existing tests pass
- [ ] Zero CI/deployment errors on Vercel
- [ ] E2E Playwright test completes 12 steps
- [ ] No page exceeds 200KB gzipped
- [ ] prefers-reduced-motion fallback works
- [ ] SVG diagrams render in all 4 READMEs
