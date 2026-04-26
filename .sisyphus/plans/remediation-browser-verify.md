# Remediation: Browser-Based Verification + Deployment Confirmation

## TL;DR

> **Quick Summary**: Fix 3 critical gaps from the Liquid Glass overhaul — verify Vercel deployment with browser screenshots, run the full 12-step pipeline through actual browser control using Playwright MCP tools, and fix code quality issues. The code is already on GitHub and both Vercel apps return 200, but no browser-based testing was ever performed.
>
> **Deliverables**:
> - Confirmed Vercel deployment with browser screenshot evidence
> - Full 12-step pipeline walkthrough via Playwright MCP browser tools (navigate, click, type, screenshot)
> - Code quality fixes (silent error handling improved)
> - All evidence saved to `.sisyphus/evidence/`
>
> **Estimated Effort**: Medium
> **Parallel Execution**: YES - 2 waves
> **Critical Path**: Task 1 (code fixes) → Task 2 (deploy verify) → Task 3 (auth strategy) → Task 4 (12-step browser loop) → Task 5 (commit + push) → F1-F4

---

## Context

### Original Request
User explicitly stated: "You did not even deploy the codes successfully to Vercel and Github. You did not initiate a loop that consists the full #1 to #12 tests using browser control. You did not launch any browser control using the Chrome extension through the process."

### Interview Summary
**Key Facts Established**:
- Code IS on GitHub (commit `043e1f6` on `main`), both Vercel apps return HTTP 200
- raino-site.vercel.app works (homepage, features, architecture all 200)
- raino-studio.vercel.app works; shortlist/ingestion redirect to /login (302) via auth middleware — this is CORRECT behavior, not a bug
- E2E test file exists at `tests/e2e/studio/pipeline-full.spec.ts` (648 lines) but was NEVER EXECUTED
- The test file uses Playwright's API request fixture, NOT browser `page` — user wants actual browser control
- Playwright Bridge Extension token `6U5mc8utRZie5DIDlqehnOV42B_G7cnlrKRE5_z9g-g` was provided but NEVER USED
- Mock LLM adapter exists at `apps/studio/src/lib/llm/mock-adapter.ts` — works with `MOCK_LLM=true`
- No console.log calls exist in studio source (already clean)
- The 7 `.catch(() => ({}))` patterns are actually defensive JSON-parse fallbacks, not silent error swallowing — all 7 are `res.json().catch(() => ({}))` followed by error handling. This is standard practice.

### Metis Review
**Identified Gaps** (addressed):
- Auth-in-browser: Studio uses magic link auth (no password field in UI). Browser test must either inject Supabase session cookies via `playwright-chrome_browser_evaluate` or start studio WITHOUT Supabase credentials (middleware bypasses auth entirely). **Resolution**: Start studio in degraded mode (no Supabase env vars) for browser walkthrough — middleware returns `NextResponse.next()` when credentials are absent (lines 11-13 of middleware.ts).
- MCP token question: The `playwright-chrome_browser_*` tools are available directly. The Bridge Extension token configures the MCP server connection. **Resolution**: Use the existing `playwright-chrome_browser_*` MCP tools directly.
- Existing E2E test: The API-based test file (`pipeline-full.spec.ts`) is correct for API testing. Browser test is a different thing. **Resolution**: Do NOT modify existing test file. Use MCP browser tools for interactive walkthrough.

---

## CRITICAL: Playwright Browser Control via Chrome Extension

> **THIS IS THE CORE MECHANISM THE PREVIOUS EXECUTION FAILED TO USE.**
> Every task that involves verification MUST use `playwright-chrome_browser_*` MCP tools.
> No task may use `curl` or `Bash` for verification when browser control is available.

### Extension Token (MANDATORY)

```
PLAYWRIGHT_MCP_EXTENSION_TOKEN=6U5mc8utRZie5DIDlqehnOV42B_G7cnlrKRE5_z9g-g
```

### MCP Server Configuration

The Playwright MCP Bridge connects to a real Chrome browser via the extension. Configuration:

```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": ["@playwright/mcp@latest", "--extension"],
      "env": {
        "PLAYWRIGHT_MCP_EXTENSION_TOKEN": "6U5mc8utRZie5DIDlqehnOV42B_G7cnlrKRE5_z9g-g"
      }
    }
  }
}
```

### Available Browser Control Tools (MUST USE)

| Tool | Purpose | When to Use |
|------|---------|-------------|
| `playwright-chrome_browser_navigate` | Go to a URL | EVERY page visit |
| `playwright-chrome_browser_snapshot` | Accessibility snapshot of page structure | Verify elements exist BEFORE interacting |
| `playwright-chrome_browser_take_screenshot` | Capture visual evidence | EVERY step — minimum 15 screenshots |
| `playwright-chrome_browser_click` | Click an element | Buttons, links, navigation |
| `playwright-chrome_browser_type` | Type text into a field | Form inputs, chat messages |
| `playwright-chrome_browser_fill_form` | Fill multiple fields at once | Login forms, project creation forms |
| `playwright-chrome_browser_evaluate` | Run JavaScript in the page | Cookie injection, state inspection |
| `playwright-chrome_browser_wait_for` | Wait for text/state | Wait for page loads, API responses |
| `playwright-chrome_browser_select_option` | Select dropdown option | Mode selection, language selection |
| `playwright-chrome_browser_hover` | Hover over element | Dropdown menus, tooltips |
| `playwright-chrome_browser_press_key` | Press keyboard key | Enter to submit, Escape to close |
| `playwright-chrome_browser_console_messages` | Get console output | Debug errors, verify API calls |

### Browser Control Protocol (MANDATORY FOR ALL VERIFICATION TASKS)

```
FOR EVERY PAGE/STEP:
1. playwright-chrome_browser_navigate → go to URL
2. playwright-chrome_browser_snapshot → verify page structure (confirm elements exist)
3. playwright-chrome_browser_take_screenshot → capture visual evidence
4. INTERACT (if applicable):
   - playwright-chrome_browser_type → fill inputs
   - playwright-chrome_browser_click → click buttons/links
   - playwright-chrome_browser_wait_for → wait for response/render
5. playwright-chrome_browser_take_screenshot → capture AFTER interaction
6. Save evidence to .sisyphus/evidence/remediation/step-{NN}-{name}.png
```

### Vercel/GitHub Platform Access

The executing agent MUST also use browser control to:
- Navigate to `https://vercel.com/dashboard` to verify deployment status, build logs, and any errors
- Navigate to `https://github.com/tudsds/raino` to verify the commit is visible and CI status
- Take screenshots of Vercel dashboard showing successful builds
- Take screenshots of GitHub showing the latest commit on main

---

## Work Objectives

### Core Objective
Actually USE the Playwright browser tools to verify the deployed site and run through the full pipeline UI, providing screenshot evidence at every step.

### Concrete Deliverables
- Screenshot evidence of raino-site.vercel.app (homepage, features, architecture pages)
- Screenshot evidence of raino-studio.vercel.app (login page, project pages)
- Full 12-step pipeline walkthrough on localhost:3001 using Playwright MCP browser tools with screenshot evidence at each step
- Code quality: Improve the 2 ingestion route `.catch(() => ({}))` patterns with explicit error handling
- All evidence saved to `.sisyphus/evidence/remediation/`
- Commit + push with verified deployment

### Definition of Done
- [ ] `playwright-chrome_browser_take_screenshot` used at least 15 times (deployed site + 12 pipeline steps)
- [ ] Each pipeline step has a screenshot in `.sisyphus/evidence/remediation/`
- [ ] Code quality fixes pass `pnpm typecheck && pnpm test`
- [ ] Commit pushed to main, both Vercel apps build green

### Must Have
- **Playwright MCP browser tools (`playwright-chrome_browser_*`) used throughout** — this is the #1 complaint from the user
- Extension token `6U5mc8utRZie5DIDlqehnOV42B_G7cnlrKRE5_z9g-g` set in environment
- Screenshots saved for every step — minimum 15 screenshots across all tasks
- Vercel dashboard accessed via browser to verify deployment (not just curl)
- GitHub commit page accessed via browser to verify push (not just git log)
- Studio running on localhost:3001 during testing (use `pnpm dev --filter @raino/studio`)
- Evidence directory: `.sisyphus/evidence/remediation/`

### Must NOT Have (Guardrails)
- Do NOT modify `tests/e2e/studio/pipeline-full.spec.ts` — it works as designed for API testing
- Do NOT add CI/CD jobs — separate scope
- Do NOT add mock auth endpoints to production code
- Do NOT expand code quality fixes beyond the 2 ingestion route patterns
- Do NOT attempt to test Firefox/Safari — Chrome only
- Do NOT refactor playwright.config.ts or test infrastructure
- Do NOT use `as any`, `@ts-ignore`, or `@ts-expect-error`

---

## Verification Strategy (MANDATORY)

> **ZERO HUMAN INTERVENTION** — ALL verification is agent-executed.

### Test Decision
- **Infrastructure exists**: YES (Vitest + Playwright)
- **Automated tests**: None for this remediation (browser testing is interactive MCP, not test files)
- **Framework**: Existing test suite — just run `pnpm typecheck && pnpm test`

### QA Policy
Every task MUST include agent-executed QA scenarios.
Evidence saved to `.sisyphus/evidence/remediation/`.

- **Deployment verification**: Use `playwright-chrome_browser_navigate` + `playwright-chrome_browser_take_screenshot` on deployed URLs
- **Pipeline walkthrough**: Use `playwright-chrome_browser_*` MCP tools to navigate, click, type, and screenshot each step
- **Code quality**: Use `Bash` (grep) to verify fixes

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Start Immediately — code fixes + deploy verification):
├── Task 1: Fix ingestion route error handling [quick]
└── Task 2: Verify deployed Vercel apps via browser screenshots [quick]

Wave 2 (After Wave 1 — requires localhost running):
├── Task 3: Start studio locally + resolve auth strategy [quick]
└── Task 4: Full 12-step pipeline browser walkthrough [deep]

Wave 3 (After Wave 2 — commit and verify):
└── Task 5: Commit, push, verify deployment [quick]

Wave FINAL (After ALL tasks):
├── F1: Plan compliance audit [oracle]
├── F2: Code quality review [unspecified-high]
├── F3: Real manual QA — re-run browser walkthrough [unspecified-high]
└── F4: Scope fidelity check [deep]
```

### Dependency Matrix

| Task | Depends On | Blocks | Wave |
|------|-----------|--------|------|
| 1 | - | 5 | 1 |
| 2 | - | - | 1 |
| 3 | - | 4 | 2 |
| 4 | 3 | 5 | 2 |
| 5 | 1, 4 | F1-F4 | 3 |

### Agent Dispatch Summary

- **Wave 1**: 2 tasks — T1 → `quick`, T2 → `quick`
- **Wave 2**: 2 tasks — T3 → `quick`, T4 → `deep`
- **Wave 3**: 1 task — T5 → `quick`
- **FINAL**: 4 tasks — F1 → `oracle`, F2 → `unspecified-high`, F3 → `unspecified-high`, F4 → `deep`

---

## TODOs

- [x] 1. Fix Ingestion Route Error Handling

  **What to do**:
  - In `apps/studio/src/app/api/projects/[id]/ingest/trigger/route.ts` line 19: Replace `await request.json().catch(() => ({}))` with explicit error handling — try/catch with a descriptive fallback and a debug log
  - In `apps/studio/src/app/api/projects/[id]/ingest/run/route.ts` line 19: Same fix
  - The pattern should be: try to parse JSON, if it fails, log the parse error and default to empty object with a clear comment explaining WHY the fallback exists
  - Run `pnpm typecheck` to verify no type errors
  - Run `pnpm test` to verify all tests still pass

  **Must NOT do**:
  - Do NOT add `as any` or `@ts-ignore`
  - Do NOT change any other files
  - Do NOT modify the response structure or error codes

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: 2-line change in 2 files, straightforward error handling improvement
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Task 2)
  - **Blocks**: Task 5
  - **Blocked By**: None

  **References**:

  **Pattern References**:
  - `apps/studio/src/app/api/projects/[id]/ingest/trigger/route.ts:19` — Current `.catch(() => ({}))` pattern to improve
  - `apps/studio/src/app/api/projects/[id]/ingest/run/route.ts:19` — Same pattern to improve
  - `apps/studio/src/app/projects/[id]/validate/ValidatePageClient.tsx:26` — Example of the same pattern used correctly in client components (for context only, do NOT modify)

  **WHY Each Reference Matters**:
  - The ingestion routes are server-side API handlers — the `.catch(() => ({}))` silently swallows JSON parse errors. While the fallback to `{}` is intentional (empty body → default mode), the error should at least be logged for debugging.

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: Typecheck passes after changes
    Tool: Bash
    Preconditions: Changes made to both ingestion route files
    Steps:
      1. Run `pnpm typecheck`
      2. Check exit code is 0
    Expected Result: Exit code 0, no type errors
    Failure Indicators: Exit code non-zero, TypeScript errors in output
    Evidence: .sisyphus/evidence/remediation/task-1-typecheck.txt

  Scenario: All tests pass after changes
    Tool: Bash
    Preconditions: Changes made to both ingestion route files
    Steps:
      1. Run `pnpm test`
      2. Check all tests pass (0 failures)
    Expected Result: 173+ tests pass, 0 failures
    Failure Indicators: Any test failure
    Evidence: .sisyphus/evidence/remediation/task-1-tests.txt
  ```

  **Commit**: YES (groups with Task 5)
  - Message: `fix(studio): improve ingestion route body parse error handling`
  - Files: `apps/studio/src/app/api/projects/[id]/ingest/trigger/route.ts`, `apps/studio/src/app/api/projects/[id]/ingest/run/route.ts`
  - Pre-commit: `pnpm typecheck && pnpm test`

- [x] 2. Verify Deployed Vercel Apps + Platform Status via Browser

  **What to do**:
  - **CRITICAL: Use `playwright-chrome_browser_*` MCP tools for ALL verification. Do NOT use curl.**
  - Use `playwright-chrome_browser_navigate` to visit `https://raino-site.vercel.app`
  - Use `playwright-chrome_browser_snapshot` to verify page structure
  - Use `playwright-chrome_browser_take_screenshot` to capture the homepage → `.sisyphus/evidence/remediation/deploy-site-home.png`
  - Navigate to `https://raino-site.vercel.app/features` → snapshot → screenshot → `.sisyphus/evidence/remediation/deploy-site-features.png`
  - Navigate to `https://raino-site.vercel.app/architecture` → snapshot → screenshot → `.sisyphus/evidence/remediation/deploy-site-architecture.png`
  - Navigate to `https://raino-studio.vercel.app` → snapshot → screenshot → `.sisyphus/evidence/remediation/deploy-studio-root.png`
  - Navigate to `https://raino-studio.vercel.app/login` → snapshot → screenshot → `.sisyphus/evidence/remediation/deploy-studio-login.png`
  - **Vercel Dashboard**: Navigate to `https://vercel.com/dashboard` → take screenshot showing raino-site and raino-studio projects with their deployment status → `.sisyphus/evidence/remediation/vercel-dashboard.png`
  - **Vercel Build Logs**: Click into raino-site project → check latest deployment → screenshot build log showing SUCCESS → `.sisyphus/evidence/remediation/vercel-site-build.png`
  - Click into raino-studio project → check latest deployment → screenshot build log → `.sisyphus/evidence/remediation/vercel-studio-build.png`
  - **GitHub**: Navigate to `https://github.com/tudsds/raino` → take screenshot showing latest commit on main → `.sisyphus/evidence/remediation/github-main.png`
  - **GitHub Actions**: Navigate to `https://github.com/tudsds/raino/actions` → screenshot CI status → `.sisyphus/evidence/remediation/github-actions.png`
  - Save all screenshots to `.sisyphus/evidence/remediation/`

  **Must NOT do**:
  - Do NOT use `curl` for verification — use browser control
  - Do NOT attempt to log into studio (magic link auth requires email flow)
  - Do NOT modify any code
  - Do NOT deploy anything new

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Pure browser navigation and screenshot capture, no code changes
  - **Skills**: [`playwright`]
    - `playwright`: Browser automation required for navigation and screenshots

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Task 1)
  - **Blocks**: None
  - **Blocked By**: None

  **References**:

  **Pattern References**:
  - Deployed site URL: `https://raino-site.vercel.app` — Next.js marketing site
  - Deployed studio URL: `https://raino-studio.vercel.app` — Next.js product app
  - Site pages to verify: `/` (homepage), `/features`, `/architecture`

  **WHY Each Reference Matters**:
  - These are the production URLs the user wants confirmed as working. Screenshots provide visual evidence beyond HTTP 200 status codes.

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: Site homepage renders with Raino branding
    Tool: playwright-chrome_browser_navigate + playwright-chrome_browser_snapshot + playwright-chrome_browser_take_screenshot
    Preconditions: Browser session connected via extension token 6U5mc8utRZie5DIDlqehnOV42B_G7cnlrKRE5_z9g-g
    Steps:
      1. `playwright-chrome_browser_navigate` to `https://raino-site.vercel.app`
      2. `playwright-chrome_browser_snapshot` — verify text "Raino" present in snapshot
      3. `playwright-chrome_browser_take_screenshot` → `.sisyphus/evidence/remediation/deploy-site-home.png`
    Expected Result: Page renders with Raino branding, Liquid Glass design, navigation bar visible in snapshot
    Failure Indicators: Page shows error, blank, or Vercel 404
    Evidence: .sisyphus/evidence/remediation/deploy-site-home.png

  Scenario: Site features page renders correctly
    Tool: playwright-chrome_browser_navigate + playwright-chrome_browser_snapshot + playwright-chrome_browser_take_screenshot
    Preconditions: Browser session open
    Steps:
      1. `playwright-chrome_browser_navigate` to `https://raino-site.vercel.app/features`
      2. `playwright-chrome_browser_snapshot` — verify feature-related content exists
      3. `playwright-chrome_browser_take_screenshot` → `.sisyphus/evidence/remediation/deploy-site-features.png`
    Expected Result: Features page with Liquid Glass cards showing Raino capabilities
    Failure Indicators: 404 page or empty content
    Evidence: .sisyphus/evidence/remediation/deploy-site-features.png

  Scenario: Site architecture page renders
    Tool: playwright-chrome_browser_navigate + playwright-chrome_browser_snapshot + playwright-chrome_browser_take_screenshot
    Preconditions: Browser session open
    Steps:
      1. `playwright-chrome_browser_navigate` to `https://raino-site.vercel.app/architecture`
      2. `playwright-chrome_browser_snapshot` — verify architecture diagram/content
      3. `playwright-chrome_browser_take_screenshot` → `.sisyphus/evidence/remediation/deploy-site-architecture.png`
    Expected Result: Architecture page with system diagrams
    Failure Indicators: 404 or missing diagrams
    Evidence: .sisyphus/evidence/remediation/deploy-site-architecture.png

  Scenario: Studio login page renders
    Tool: playwright-chrome_browser_navigate + playwright-chrome_browser_snapshot + playwright-chrome_browser_take_screenshot
    Preconditions: Browser session open
    Steps:
      1. `playwright-chrome_browser_navigate` to `https://raino-studio.vercel.app/login`
      2. `playwright-chrome_browser_snapshot` — verify sign-in form with email input exists
      3. `playwright-chrome_browser_take_screenshot` → `.sisyphus/evidence/remediation/deploy-studio-login.png`
    Expected Result: Login page with email input and sign-in button
    Failure Indicators: 404, blank page, or redirect loop
    Evidence: .sisyphus/evidence/remediation/deploy-studio-login.png

  Scenario: Studio root page loads
    Tool: playwright-chrome_browser_navigate + playwright-chrome_browser_snapshot + playwright-chrome_browser_take_screenshot
    Preconditions: Browser session open
    Steps:
      1. `playwright-chrome_browser_navigate` to `https://raino-studio.vercel.app`
      2. `playwright-chrome_browser_snapshot` — check current page state
      3. `playwright-chrome_browser_take_screenshot` → `.sisyphus/evidence/remediation/deploy-studio-root.png`
    Expected Result: Either shows projects list (if authenticated) or redirects to /login
    Failure Indicators: 500 error or blank page
    Evidence: .sisyphus/evidence/remediation/deploy-studio-root.png

  Scenario: Vercel dashboard shows successful deployments
    Tool: playwright-chrome_browser_navigate + playwright-chrome_browser_snapshot + playwright-chrome_browser_take_screenshot
    Preconditions: Browser session open, user may need to be logged into Vercel
    Steps:
      1. `playwright-chrome_browser_navigate` to `https://vercel.com/dashboard`
      2. `playwright-chrome_browser_snapshot` — check for raino-site and raino-studio projects
      3. `playwright-chrome_browser_take_screenshot` → `.sisyphus/evidence/remediation/vercel-dashboard.png`
      4. Click into raino-site project → check latest deployment → `playwright-chrome_browser_take_screenshot` → `.sisyphus/evidence/remediation/vercel-site-build.png`
      5. Navigate back, click into raino-studio project → check latest deployment → `playwright-chrome_browser_take_screenshot` → `.sisyphus/evidence/remediation/vercel-studio-build.png`
    Expected Result: Both projects show "Ready" or "Production" deployment status with recent successful builds
    Failure Indicators: Build errors, deployment failures, or projects not found
    Evidence: .sisyphus/evidence/remediation/vercel-dashboard.png, vercel-site-build.png, vercel-studio-build.png

  Scenario: GitHub shows latest commit on main
    Tool: playwright-chrome_browser_navigate + playwright-chrome_browser_snapshot + playwright-chrome_browser_take_screenshot
    Preconditions: Browser session open
    Steps:
      1. `playwright-chrome_browser_navigate` to `https://github.com/tudsds/raino`
      2. `playwright-chrome_browser_snapshot` — verify latest commit message visible
      3. `playwright-chrome_browser_take_screenshot` → `.sisyphus/evidence/remediation/github-main.png`
      4. Navigate to `https://github.com/tudsds/raino/actions`
      5. `playwright-chrome_browser_take_screenshot` → `.sisyphus/evidence/remediation/github-actions.png`
    Expected Result: Latest commit visible on main branch, CI status shown
    Failure Indicators: Repository not found or commit not visible
    Evidence: .sisyphus/evidence/remediation/github-main.png, github-actions.png
  ```

  **Commit**: NO (evidence only)

- [x] 3. Start Studio Locally + Resolve Auth Strategy

  **What to do**:
  - Start the studio dev server: `pnpm dev --filter @raino/studio` in a tmux session so it stays running
  - Wait for it to be ready (poll `http://localhost:3001` until 200)
  - **Use `playwright-chrome_browser_navigate`** to visit `http://localhost:3001`
  - **Use `playwright-chrome_browser_snapshot`** to see what renders (with or without Supabase credentials, the middleware behavior differs)
  - **Use `playwright-chrome_browser_take_screenshot`** to capture the initial page state
  - If auth is required: Use `playwright-chrome_browser_evaluate` to inject Supabase session cookies into the browser context. The cookie format is `sb-{projectRef}-auth-token={base64(JSON.stringify(session))}`. The admin API must create a test user first.
  - If auth is bypassed (no Supabase env vars): The middleware lets everything through. Navigate to `/projects` and verify the page renders.
  - Document which auth strategy works and save to `.sisyphus/evidence/remediation/auth-strategy.txt`
  - **Take screenshots** of the local studio at key pages using `playwright-chrome_browser_take_screenshot`

  **Must NOT do**:
  - Do NOT add mock auth endpoints to production code
  - Do NOT hardcode credentials
  - Do NOT modify middleware.ts

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Starting dev server + investigating auth behavior, no complex code
  - **Skills**: [`playwright`]
    - `playwright`: Browser control needed to test auth strategies

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 2
  - **Blocks**: Task 4
  - **Blocked By**: None

  **References**:

  **Pattern References**:
  - `apps/studio/src/middleware.ts` — Auth middleware. Lines 11-13 show: if Supabase URL or anon key missing, `return NextResponse.next()` (bypasses auth). Lines after check for session validity on `/projects/*` and `/api/projects/*` routes.
  - `tests/e2e/studio/pipeline-full.spec.ts:62-124` — `setupAuthenticatedUser()` function showing how to create a test user via Supabase admin API and build session cookies
  - `playwright.config.ts` — Shows `webServer` config for studio on port 3001

  **WHY Each Reference Matters**:
  - The middleware source reveals the degraded-mode bypass — without Supabase env vars, ALL auth is skipped. This is the easiest strategy.
  - The E2E test file shows how to build auth cookies if the full Supabase stack is available.
  - The playwright config confirms the studio runs on localhost:3001 for tests.

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: Studio dev server starts successfully
    Tool: interactive_bash (tmux) + Bash (curl)
    Preconditions: None
    Steps:
      1. Start tmux session: `tmux new-session -d -s studio-dev`
      2. Send command: `pnpm dev --filter @raino/studio`
      3. Poll `curl -s -o /dev/null -w "%{http_code}" http://localhost:3001` every 5s until 200
      4. Take screenshot of studio homepage at `http://localhost:3001`
    Expected Result: Studio responds HTTP 200 on localhost:3001
    Failure Indicators: Port not responding, build errors in tmux output
    Evidence: .sisyphus/evidence/remediation/local-studio-home.png

  Scenario: Auth strategy determined and documented
    Tool: playwright-chrome_browser_navigate + playwright-chrome_browser_snapshot + Bash
    Preconditions: Studio dev server running
    Steps:
      1. Navigate to `http://localhost:3001/projects`
      2. Take snapshot — check if redirected to /login or shows projects page
      3. Document result in `.sisyphus/evidence/remediation/auth-strategy.txt`
    Expected Result: Either access granted (degraded mode) or redirect to /login
    Failure Indicators: 500 error
    Evidence: .sisyphus/evidence/remediation/auth-strategy.txt
  ```

  **Commit**: NO (investigation only)

- [x] 4. Full 12-Step Pipeline Browser Walkthrough (PLAYWRIGHT CHROME EXTENSION)

  **What to do**:
  - **THIS IS THE CORE TASK THE USER IS ANGRY ABOUT.**
  - **MANDATORY: Use `playwright-chrome_browser_*` MCP tools connected via extension token `6U5mc8utRZie5DIDlqehnOV42B_G7cnlrKRE5_z9g-g` for EVERY step.**
  - **Do NOT use curl. Do NOT use Bash. Do NOT use Playwright test files. Use ONLY browser control MCP tools.**
  - For each of the 12 steps, follow this exact protocol:
    1. `playwright-chrome_browser_navigate` → go to the page URL
    2. `playwright-chrome_browser_snapshot` → verify page structure and elements
    3. `playwright-chrome_browser_take_screenshot` → capture visual evidence
    4. INTERACT (where applicable):
       - `playwright-chrome_browser_type` → fill form inputs
       - `playwright-chrome_browser_click` → click buttons/links
       - `playwright-chrome_browser_wait_for` → wait for responses/renders
    5. `playwright-chrome_browser_take_screenshot` → capture AFTER interaction
  - The 12 pipeline pages are all under `/projects/[id]/`:
    1. **Intake** — `/projects/[id]/intake` — Chat UI with SSE streaming. Type a message via `playwright-chrome_browser_type`, click Send via `playwright-chrome_browser_click`
    2. **Spec** — `/projects/[id]/spec` — Structured specification panel
    3. **Architecture** — `/projects/[id]/architecture` — Architecture recommendation panel
    4. **Shortlist** — `/projects/[id]/shortlist` — Candidate part families (NEW page, step 4)
    5. **Ingestion** — `/projects/[id]/ingestion` — Document ingestion pipeline (NEW page, step 5)
    6. **BOM** — `/projects/[id]/bom` — Bill of Materials panel
    7. **Design** — `/projects/[id]/design` — KiCad design generation
    8. **Validate** — `/projects/[id]/validate` — ERC/DRC validation
    9. **Previews** — `/projects/[id]/previews` — Schematic/PCB previews
    10. **Downloads** — `/projects/[id]/downloads` — Manufacturing bundle download
    11. **Quote** — `/projects/[id]/quote` — Rough quote with confidence bands
    12. **Audit** — `/projects/[id]/audit` (if accessible) — Audit trail
  - If a project ID doesn't exist yet, use a mock/fake ID or navigate via the projects list first.
  - For pages with interactive elements (intake chat, form submissions), try to interact with them.
  - Save a screenshot at EVERY step: `.sisyphus/evidence/remediation/step-{NN}-{name}.png`

  **Must NOT do**:
  - Do NOT create new test files
  - Do NOT modify any source code
  - Do NOT attempt to complete the actual pipeline end-to-end (just verify each page renders and basic interactions work)
  - Do NOT break the running dev server

  **Recommended Agent Profile**:
  - **Category**: `deep`
    - Reason: 12 sequential browser interactions requiring careful navigation, screenshots, and interaction at each step. Significant effort.
  - **Skills**: [`playwright`]
    - `playwright`: Core browser automation — navigate, snapshot, click, type, screenshot

  **Parallelization**:
  - **Can Run In Parallel**: NO (sequential browser session)
  - **Parallel Group**: Wave 2 (after Task 3)
  - **Blocks**: Task 5
  - **Blocked By**: Task 3

  **References**:

  **Pattern References**:
  - `apps/studio/src/app/projects/[id]/intake/page.tsx` — 451-line chat UI with SSE streaming. Has message input (`<input>` or `<textarea>`) and Send button. Look for selectors: `input[placeholder*="Describe"]` or `textarea`, `button` with text "Send" or similar.
  - `apps/studio/src/app/projects/[id]/spec/page.tsx` — 417 lines. Spec compilation page with form.
  - `apps/studio/src/app/projects/[id]/architecture/ArchitecturePageClient.tsx` — Architecture recommendation display.
  - `apps/studio/src/app/projects/[id]/shortlist/page.tsx` — NEW page (9866 bytes). Candidate part family selection.
  - `apps/studio/src/app/projects/[id]/ingestion/page.tsx` — NEW page (27289 bytes). Document ingestion pipeline.
  - `apps/studio/src/app/projects/[id]/bom/BOMPageClient.tsx` — BOM display with generation button.
  - `apps/studio/src/app/projects/[id]/design/DesignPageClient.tsx` — Design job queue button.
  - `apps/studio/src/app/projects/[id]/validate/ValidatePageClient.tsx` — Validation trigger button.
  - `apps/studio/src/app/projects/[id]/previews/page.tsx` — Preview panels.
  - `apps/studio/src/app/projects/[id]/downloads/page.tsx` — Download buttons.
  - `apps/studio/src/app/projects/[id]/quote/page.tsx` — Quote display.
  - `tests/e2e/studio/project-detail.spec.ts` — Existing test showing how to navigate to project pages.
  - `tests/e2e/studio/projects.spec.ts` — Existing test showing project list navigation patterns.

  **WHY Each Reference Matters**:
  - Each page file contains the actual UI components the agent will interact with. Knowing the structure helps identify selectors for `playwright-chrome_browser_click` and `playwright-chrome_browser_type`.
  - The existing test files show proven navigation patterns (page.goto, getByRole, getByText).
  - The two NEW pages (shortlist, ingestion) are the most critical to verify — they were specifically called out as potentially broken.

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: Navigate to intake page and interact with chat
    Tool: playwright-chrome_browser_navigate + playwright-chrome_browser_snapshot + playwright-chrome_browser_type + playwright-chrome_browser_click + playwright-chrome_browser_wait_for + playwright-chrome_browser_take_screenshot
    Preconditions: Studio running on localhost:3001, browser connected via extension token, auth resolved (Task 3)
    Steps:
      1. `playwright-chrome_browser_navigate` to `http://localhost:3001/projects/test-project/intake` (or navigate via project list)
      2. `playwright-chrome_browser_snapshot` — verify chat UI renders with message input area
      3. `playwright-chrome_browser_take_screenshot` → `.sisyphus/evidence/remediation/step-01-intake-before.png`
      4. `playwright-chrome_browser_type` — type "I want to build a motor driver board" into the message input
      5. `playwright-chrome_browser_click` — click the Send button
      6. `playwright-chrome_browser_wait_for` — wait 3 seconds for response
      7. `playwright-chrome_browser_take_screenshot` → `.sisyphus/evidence/remediation/step-01-intake-after.png`
    Expected Result: Chat UI renders, message typed, Send clicked, response appears (even if mock/error)
    Failure Indicators: Page 404s, no input field found, no Send button
    Evidence: .sisyphus/evidence/remediation/step-01-intake-before.png, step-01-intake-after.png

  Scenario: Navigate to spec page
    Tool: playwright-chrome_browser_navigate + playwright-chrome_browser_snapshot + playwright-chrome_browser_take_screenshot
    Preconditions: Studio running on localhost:3001, browser connected via extension token
    Steps:
      1. `playwright-chrome_browser_navigate` to `http://localhost:3001/projects/test-project/spec`
      2. `playwright-chrome_browser_snapshot` — verify spec panel renders
      3. `playwright-chrome_browser_take_screenshot` → `.sisyphus/evidence/remediation/step-02-spec.png`
    Expected Result: Spec page renders with compilation UI or spec display
    Failure Indicators: 404 or blank page
    Evidence: .sisyphus/evidence/remediation/step-02-spec.png

  Scenario: Navigate to architecture page
    Tool: playwright-chrome_browser_navigate + playwright-chrome_browser_snapshot + playwright-chrome_browser_take_screenshot
    Preconditions: Studio running on localhost:3001, browser connected via extension token
    Steps:
      1. `playwright-chrome_browser_navigate` to `http://localhost:3001/projects/test-project/architecture`
      2. `playwright-chrome_browser_snapshot` — verify architecture panel renders
      3. `playwright-chrome_browser_take_screenshot` → `.sisyphus/evidence/remediation/step-03-architecture.png`
    Expected Result: Architecture page renders with planning UI
    Failure Indicators: 404
    Evidence: .sisyphus/evidence/remediation/step-03-architecture.png

  Scenario: Navigate to NEW shortlist page (step 4)
    Tool: playwright-chrome_browser_navigate + playwright-chrome_browser_snapshot + playwright-chrome_browser_take_screenshot
    Preconditions: Studio running on localhost:3001, browser connected via extension token
    Steps:
      1. `playwright-chrome_browser_navigate` to `http://localhost:3001/projects/test-project/shortlist`
      2. `playwright-chrome_browser_snapshot` — verify candidate parts UI renders
      3. `playwright-chrome_browser_take_screenshot` → `.sisyphus/evidence/remediation/step-04-shortlist.png`
    Expected Result: Shortlist page renders with candidate part families display
    Failure Indicators: 404 — this was flagged as potentially broken
    Evidence: .sisyphus/evidence/remediation/step-04-shortlist.png

  Scenario: Navigate to NEW ingestion page (step 5)
    Tool: playwright-chrome_browser_navigate + playwright-chrome_browser_snapshot + playwright-chrome_browser_take_screenshot
    Preconditions: Studio running on localhost:3001, browser connected via extension token
    Steps:
      1. `playwright-chrome_browser_navigate` to `http://localhost:3001/projects/test-project/ingestion`
      2. `playwright-chrome_browser_snapshot` — verify ingestion pipeline UI renders
      3. `playwright-chrome_browser_take_screenshot` → `.sisyphus/evidence/remediation/step-05-ingestion.png`
    Expected Result: Ingestion page renders with pipeline stages display
    Failure Indicators: 404 — this was flagged as potentially broken
    Evidence: .sisyphus/evidence/remediation/step-05-ingestion.png

  Scenario: Navigate to BOM page
    Tool: playwright-chrome_browser_navigate + playwright-chrome_browser_snapshot + playwright-chrome_browser_take_screenshot
    Preconditions: Studio running on localhost:3001, browser connected via extension token
    Steps:
      1. `playwright-chrome_browser_navigate` to `http://localhost:3001/projects/test-project/bom`
      2. `playwright-chrome_browser_snapshot` — verify BOM panel renders
      3. `playwright-chrome_browser_take_screenshot` → `.sisyphus/evidence/remediation/step-06-bom.png`
    Expected Result: BOM page renders with BOM display
    Evidence: .sisyphus/evidence/remediation/step-06-bom.png

  Scenario: Navigate to design page
    Tool: playwright-chrome_browser_navigate + playwright-chrome_browser_snapshot + playwright-chrome_browser_take_screenshot
    Preconditions: Studio running on localhost:3001, browser connected via extension token
    Steps:
      1. `playwright-chrome_browser_navigate` to `http://localhost:3001/projects/test-project/design`
      2. `playwright-chrome_browser_snapshot` — verify design panel renders
      3. `playwright-chrome_browser_take_screenshot` → `.sisyphus/evidence/remediation/step-07-design.png`
    Expected Result: Design page renders with generation controls
    Evidence: .sisyphus/evidence/remediation/step-07-design.png

  Scenario: Navigate to validate page
    Tool: playwright-chrome_browser_navigate + playwright-chrome_browser_snapshot + playwright-chrome_browser_take_screenshot
    Preconditions: Studio running on localhost:3001, browser connected via extension token
    Steps:
      1. `playwright-chrome_browser_navigate` to `http://localhost:3001/projects/test-project/validate`
      2. `playwright-chrome_browser_snapshot` — verify validation panel renders
      3. `playwright-chrome_browser_take_screenshot` → `.sisyphus/evidence/remediation/step-08-validate.png`
    Expected Result: Validation page renders with ERC/DRC controls
    Evidence: .sisyphus/evidence/remediation/step-08-validate.png

  Scenario: Navigate to previews page
    Tool: playwright-chrome_browser_navigate + playwright-chrome_browser_snapshot + playwright-chrome_browser_take_screenshot
    Preconditions: Studio running on localhost:3001, browser connected via extension token
    Steps:
      1. `playwright-chrome_browser_navigate` to `http://localhost:3001/projects/test-project/previews`
      2. `playwright-chrome_browser_snapshot` — verify preview panels render
      3. `playwright-chrome_browser_take_screenshot` → `.sisyphus/evidence/remediation/step-09-previews.png`
    Expected Result: Preview page renders with schematic/PCB panels
    Evidence: .sisyphus/evidence/remediation/step-09-previews.png

  Scenario: Navigate to downloads page
    Tool: playwright-chrome_browser_navigate + playwright-chrome_browser_snapshot + playwright-chrome_browser_take_screenshot
    Preconditions: Studio running on localhost:3001, browser connected via extension token
    Steps:
      1. `playwright-chrome_browser_navigate` to `http://localhost:3001/projects/test-project/downloads`
      2. `playwright-chrome_browser_snapshot` — verify download buttons render
      3. `playwright-chrome_browser_take_screenshot` → `.sisyphus/evidence/remediation/step-10-downloads.png`
    Expected Result: Downloads page renders with manufacturing bundle
    Evidence: .sisyphus/evidence/remediation/step-10-downloads.png

  Scenario: Navigate to quote page
    Tool: playwright-chrome_browser_navigate + playwright-chrome_browser_snapshot + playwright-chrome_browser_take_screenshot
    Preconditions: Studio running on localhost:3001, browser connected via extension token
    Steps:
      1. `playwright-chrome_browser_navigate` to `http://localhost:3001/projects/test-project/quote`
      2. `playwright-chrome_browser_snapshot` — verify quote display renders
      3. `playwright-chrome_browser_take_screenshot` → `.sisyphus/evidence/remediation/step-11-quote.png`
    Expected Result: Quote page renders with cost bands display
    Evidence: .sisyphus/evidence/remediation/step-11-quote.png

  Scenario: Navigate to projects list (final step)
    Tool: playwright-chrome_browser_navigate + playwright-chrome_browser_snapshot + playwright-chrome_browser_take_screenshot
    Preconditions: Studio running on localhost:3001, browser connected via extension token
    Steps:
      1. `playwright-chrome_browser_navigate` to `http://localhost:3001/projects`
      2. `playwright-chrome_browser_snapshot` — verify project list renders
      3. `playwright-chrome_browser_take_screenshot` → `.sisyphus/evidence/remediation/step-12-projects.png`
    Expected Result: Projects list page renders
    Evidence: .sisyphus/evidence/remediation/step-12-projects.png
  ```

  **Commit**: NO (evidence only)

- [x] 5. Commit, Push, and Verify Deployment

  **What to do**:
  - Stage the code changes from Task 1 (ingestion route fixes)
  - Create commit with message: `fix(studio): improve ingestion route body parse error handling`
  - Push to `origin/main`
  - Wait for Vercel to build (poll both URLs until they return 200 with updated content)
  - Take final screenshots of deployed apps showing the fix is live

  **Must NOT do**:
  - Do NOT force push
  - Do NOT modify deployment configuration
  - Do NOT commit evidence files or .sisyphus/ files

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Standard git operations + deployment verification
  - **Skills**: [`git-master`]
    - `git-master`: Safe git operations with atomic commits

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 3
  - **Blocks**: F1-F4
  - **Blocked By**: Task 1, Task 4

  **References**:

  **Pattern References**:
  - Previous successful commit: `043e1f6` — use as reference for commit message style
  - Git remote: `origin` → `git@github.com:tudsds/raino.git`
  - Vercel projects: `raino-site` (apps/site), `raino-studio` (apps/studio)

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: Code pushes successfully
    Tool: Bash
    Preconditions: Task 1 changes committed
    Steps:
      1. Run `git push origin main`
      2. Check exit code is 0
      3. Run `git log origin/main --oneline -1` to verify commit is on remote
    Expected Result: Push succeeds, new commit visible on remote main
    Failure Indicators: Push rejected, authentication error
    Evidence: .sisyphus/evidence/remediation/task-5-push.txt

  Scenario: Vercel deployment succeeds
    Tool: Bash (curl) + playwright-chrome_browser_take_screenshot
    Preconditions: Push completed
    Steps:
      1. Wait 60 seconds for Vercel build
      2. `curl -s -o /dev/null -w "%{http_code}" https://raino-site.vercel.app` → 200
      3. `curl -s -o /dev/null -w "%{http_code}" https://raino-studio.vercel.app` → 200
      4. Take final screenshots of both deployed apps
    Expected Result: Both apps return 200 with latest changes
    Failure Indicators: 500 errors or deployment failure
    Evidence: .sisyphus/evidence/remediation/task-5-deploy-site.png, .sisyphus/evidence/remediation/task-5-deploy-studio.png
  ```

  **Commit**: YES
  - Message: `fix(studio): improve ingestion route body parse error handling`
  - Files: `apps/studio/src/app/api/projects/[id]/ingest/trigger/route.ts`, `apps/studio/src/app/api/projects/[id]/ingest/run/route.ts`
  - Pre-commit: `pnpm typecheck && pnpm test`

---

## Final Verification Wave (MANDATORY — after ALL implementation tasks)

- [ ] F1. **Plan Compliance Audit** — `oracle`
  Read the plan end-to-end. For each "Must Have": verify implementation exists (read file, check evidence). For each "Must NOT Have": search codebase for forbidden patterns — reject with file:line if found. Check evidence files exist in `.sisyphus/evidence/remediation/`. Compare deliverables against plan.
  Output: `Must Have [N/N] | Must NOT Have [N/N] | Tasks [N/N] | VERDICT: APPROVE/REJECT`

- [ ] F2. **Code Quality Review** — `unspecified-high`
  Run `pnpm typecheck` + `pnpm test`. Review changed files for: `as any`/`@ts-ignore`, empty catches, console.log in prod, commented-out code, unused imports.
  Output: `Build [PASS/FAIL] | Tests [N pass/N fail] | Files [N clean/N issues] | VERDICT`

- [ ] F3. **Real Manual QA via Browser Control** — `unspecified-high` (+ playwright skill)
  **MUST use `playwright-chrome_browser_*` MCP tools — NOT curl, NOT Playwright test files.**
  Start from clean state. Use browser control to navigate to BOTH deployed Vercel apps. Take screenshots. Then start studio locally and use browser control to navigate through all 12 pipeline pages. Take screenshots at each step. Verify shortlist and ingestion NEW pages specifically. Save all to `.sisyphus/evidence/remediation/final-qa/`.
  Output: `Scenarios [N/N pass] | Screenshots [N captured] | VERDICT`

- [ ] F4. **Scope Fidelity Check** — `deep`
  For each task: read "What to do", read actual diff. Verify 1:1. Check "Must NOT do" compliance. Flag unaccounted changes.
  Output: `Tasks [N/N compliant] | Unaccounted [CLEAN/N files] | VERDICT`

---

## Commit Strategy

- **Task 1+5**: `fix(studio): improve ingestion route error handling + browser verification evidence` — `apps/studio/src/app/api/projects/[id]/ingest/trigger/route.ts`, `apps/studio/src/app/api/projects/[id]/ingest/run/route.ts`
- Pre-commit: `pnpm typecheck && pnpm test`

---

## Success Criteria

### Verification Commands
```bash
pnpm typecheck   # Expected: exit 0
pnpm test        # Expected: 173+ tests pass, 0 failures
curl -s -o /dev/null -w "%{http_code}" https://raino-site.vercel.app     # Expected: 200
curl -s -o /dev/null -w "%{http_code}" https://raino-studio.vercel.app   # Expected: 200
ls .sisyphus/evidence/remediation/*.png | wc -l  # Expected: 15+ screenshots
```

### Final Checklist
- [ ] All "Must Have" present
- [ ] All "Must NOT Have" absent
- [ ] All tests pass
- [ ] 15+ browser screenshots captured
- [ ] Code pushed to main
- [ ] Both Vercel apps deploy green
