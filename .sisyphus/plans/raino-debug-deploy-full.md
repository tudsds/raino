# Raino Debug & Deploy Plan — ZERO MOCKS/FIXTURES
**Created**: 2026-04-24
**Status**: READY FOR EXECUTION
**Constraint**: NO mock, fixture, placeholder, or degraded mode remains when complete. ALL functions workable.

---

## Root Cause Analysis

### Why Projects Stall at Step 1 (4 compounding bugs)

1. **`intake/route.ts:87-96`** — After Kimi responds, route never calls `updateProjectStatus()`. Project stays `status: 'intake'` forever.

2. **No code sets `'clarifying'` status** — `ValidTransitions` defines `intake → clarifying` but no API route calls `updateProjectStatus(id, 'clarifying')`.

3. **Spec page has no "Compile Spec" button** — `spec/page.tsx` displays data but has no UI to trigger `POST /spec/compile`. This route works correctly.

4. **`updateProjectStatus` never sets `current_step`** — It only updates `status` string. Progress = `currentStep / totalSteps * 100`, so projects show 0% permanently.

---

## 10-Phase Execution Plan

### PHASE 0: Pre-Flight Verification (Browser Control)
**Goal**: Confirm all platform states before making changes
**Method**: Playwright browser control for ALL platform checks

**Steps**:
- [ ] 0.1 Navigate to raino-studio.vercel.app, take screenshot of dashboard
- [ ] 0.2 Check Supabase tables have data (users, projects, intake_messages)
- [ ] 0.3 Verify Vercel env vars are set (19 variables)
- [ ] 0.4 Check GitHub Actions workflow runs
- [ ] 0.5 Test Supabase Edge Functions respond
- [ ] 0.6 Check Moonshot API key is valid (test API call)
- [ ] 0.7 Verify Resend domain is configured
- [ ] 0.8 Take screenshots of each platform dashboard

**QA**: All platform logins confirmed, env vars documented, screenshots saved.

---

### PHASE 1: Obtain & Verify All Credentials (ZERO MOCKS)
**Goal**: Every integration uses real credentials — no fixture fallbacks

**Credential Checklist**:

| Credential | Source | How to Obtain | Fallback |
|-----------|--------|---------------|----------|
| OPENAI_API_KEY | platform.openai.com | Browser → API keys → Create | None (required) |
| DIGIKEY_CLIENT_ID + SECRET | developer.digikey.com | Sandbox account (instant) | None |
| DIGIKEY_REDIRECT_URI | developer.digikey.com | Set to raino-studio URL | None |
| MOUSER_API_KEY | api.mouser.com | Register (instant) | None |
| JLCPCB_APP_ID + ACCESS_KEY + SECRET_KEY | jlcpcb.com | Apply via LCSC agent portal | LCSC public catalog API |
| GITHUB_ACTIONS_DISPATCH_TOKEN | github.com/settings/tokens | Create PAT with repo + workflow scope | None |
| RESEND_API_KEY | resend.com | Already have | None |
| KIMI_API_KEY | platform.moonshot.cn | Already have 2 keys | None |
| SUPABASE_URL + KEYS | supabase.com | Already have | None |

**Steps**:
- [ ] 1.1 Use browser to navigate to each supplier API portal
- [ ] 1.2 Register/verify DigiKey developer sandbox
- [ ] 1.3 Register/verify Mouser API access
- [ ] 1.4 Apply for JLCPCB/LCSC credentials
- [ ] 1.5 Create/test GitHub PAT for workflow dispatch
- [ ] 1.6 Obtain OpenAI API key for embeddings
- [ ] 1.7 Set ALL credentials in Vercel env vars (replace any mock values)
- [ ] 1.8 Verify each credential works with a test API call

**QA**: Every adapter's `isAvailable()` returns `true`. Factory selects real adapters.

---

### PHASE 2: Fix Workflow Stall (7 Bug Fixes)
**Goal**: Projects advance through all 12 steps with real progress

**Bug 2.1**: `updateProjectStatus` never sets `current_step`
- **File**: `apps/studio/src/lib/workers/dispatch.ts` or equivalent
- **Fix**: Add `current_step` calculation based on new status
- **QA**: After status change, project shows correct progress %

**Bug 2.2**: Intake route never advances status
- **File**: `apps/studio/src/app/api/projects/[id]/intake/route.ts`
- **Fix**: After sufficient intake messages, call `updateProjectStatus(id, 'clarifying')` then `'spec'`
- **QA**: After intake chat, project advances to Spec step

**Bug 2.3**: Spec page missing "Compile Spec" button
- **File**: `apps/studio/src/app/projects/[id]/spec/page.tsx` or SpecPageClient
- **Fix**: Add button that calls `POST /api/projects/[id]/spec/compile`
- **QA**: Button visible, clickable, triggers spec compilation

**Bug 2.4**: Intake `isReady` hardcoded to `false`
- **Fix**: Determine readiness from intake message count/quality
- **QA**: "Ready to proceed" appears after sufficient intake

**Bug 2.5**: Step cards show "Locked"
- **File**: Project detail page component
- **Fix**: Fix accessibility logic for step progression
- **QA**: Steps show correct state (active/completed/locked)

**Bug 2.6**: Missing action buttons on BOM/Design/Quote pages
- **Fix**: Add action buttons for each step that trigger the corresponding API
- **QA**: Every step page has a working action button

**Bug 2.7**: No architecture planning button
- **Fix**: Wire architecture page to API
- **QA**: Architecture step can be triggered

---

### PHASE 3: Real KiCad Design Worker
**Goal**: KiCad produces REAL output files, not placeholders

**Current State**: GitHub Actions workflow installs KiCad CLI, but dispatch chain untested. Design worker produces placeholder metadata.

**Steps**:
- [ ] 3.1 Verify GITHUB_ACTIONS_DISPATCH_TOKEN is valid
- [ ] 3.2 Test dispatch to GitHub Actions workflow via browser (check Actions tab)
- [ ] 3.3 Verify `KICAD_CLI_PATH=/usr/bin/kicad-cli` works in Actions runner
- [ ] 3.4 Ensure design-worker CLI writes real .kicad_sch/.kicad_pcb files
- [ ] 3.5 Enable ALL export formats: `gerbers`, `pcb_glb`, `pcb_svg`, `schematic_pdf`, `netlist`, `bom_csv`
- [ ] 3.6 Wire export results to upload to Supabase Storage (real files, not metadata)
- [ ] 3.7 Verify ERC/DRC runs real `kicad-cli sch erc` and `kicad-cli pcb drc`
- [ ] 3.8 Remove `isPlaceholder: true` code path — real outputs only

**File Changes**:
- `services/design-worker/src/exporter/engine.ts` — Remove fixture fallback
- `services/design-worker/src/validator/engine.ts` — Remove fixture ERC/DRC
- `services/design-worker/src/cli/run-job.ts` — Enable all export formats
- `.github/workflows/design-worker.yml` — Verify env vars

**QA**: Run a design job end-to-end. Real gerbers.zip (not 44.6KB placeholder). Real schematic.pdf. Real netlist.

---

### PHASE 4: Real Supplier Adapters (NO MOCKS)
**Goal**: DigiKey, Mouser, JLCPCB all return real data

**Key Insight**: Factory pattern auto-selects real adapters when env vars are present. No code changes needed for DigiKey/Mouser — just set credentials.

**Steps**:
- [ ] 4.1 Set DIGIKEY_CLIENT_ID, DIGIKEY_CLIENT_SECRET in Vercel
- [ ] 4.2 Set MOUSER_API_KEY in Vercel
- [ ] 4.3 Set JLCPCB_APP_ID, JLCPCB_ACCESS_KEY, JLCPCB_SECRET_KEY in Vercel
- [ ] 4.4 Test DigiKey OAuth flow (2-legged client_credentials)
- [ ] 4.5 Test Mouser search API
- [ ] 4.6 Test JLCPCB/LCSC HMAC-signed requests
- [ ] 4.7 If JLCPCB credentials not approved: implement LCSC public catalog fallback
- [ ] 4.8 Add `/api/health/suppliers` endpoint for monitoring
- [ ] 4.9 Verify factory returns real adapters for all three

**Code Changes** (if JLCPCB not approved):
- `packages/supplier-clients/src/jlcpcb/` — Add LCSC catalog adapter as real fallback
- `packages/supplier-clients/src/factory.ts` — Wire LCSC as tertiary option

**QA**: `getAdapterStatus()` shows `live` for all three suppliers. Real pricing returned.

---

### PHASE 5: Real RAG Embeddings
**Goal**: Use real OpenAI embeddings, not mock

**Steps**:
- [ ] 5.1 Set EMBEDDING_PROVIDER=openai in Vercel
- [ ] 5.2 Set OPENAI_API_KEY in Vercel
- [ ] 5.3 Verify pgvector tables exist in Supabase (documents, chunks, embeddings)
- [ ] 5.4 Test embedding generation with a sample document
- [ ] 5.5 Run ingestion pipeline on a test datasheet
- [ ] 5.6 Verify similarity search works

**File Changes**:
- `packages/rag/src/` — Ensure mock provider path is gated by EMBEDDING_PROVIDER

**QA**: Embedding query returns real similarity results with source provenance.

---

### PHASE 6: Real Email Delivery (Resend)
**Goal**: Quote notifications actually send

**Steps**:
- [ ] 6.1 Verify Resend domain DNS records (via browser → resend.com/domains)
- [ ] 6.2 Test sending a test email via Resend API
- [ ] 6.3 Wire quote completion to trigger email
- [ ] 6.4 Verify RESEND_FROM_EMAIL matches verified domain

**QA**: End-to-end: create quote → email delivered to inbox.

---

### PHASE 7: Full 12-Step E2E Test (REAL OUTPUTS)
**Goal**: One project goes through ALL 12 steps with REAL outputs

**Test Project**: "ESP32-S3 Minimal Dev Board" (simple 2-layer)

**Steps to verify via browser**:
- [ ] 7.1 Create new project
- [ ] 7.2 Complete Intake chat → status advances to Spec
- [ ] 7.3 Compile Spec → real structured spec from Kimi
- [ ] 7.4 Architecture planning → real architecture selection
- [ ] 7.5 Parts shortlisting → real supplier data (DigiKey/Mouser/JLCPCB)
- [ ] 7.6 Document ingestion → real RAG embedding
- [ ] 7.7 BOM generation → real pricing from supplier APIs
- [ ] 7.8 Design generation → real KiCad files via GitHub Actions
- [ ] 7.9 Validation → real ERC/DRC results
- [ ] 7.10 Preview → real schematic/PCB renders
- [ ] 7.11 Export → real gerbers.zip, schematic.pdf, bom.csv, netlist.net, pcb-3d.glb
- [ ] 7.12 Quote → real manufacturing cost estimate → email sent

**QA**: Screenshot every step. Verify real data at each stage.

---

### PHASE 8: Zero Mock/Fixture Audit
**Goal**: NO active mock/fixture/placeholder code paths remain

**Steps**:
- [ ] 8.1 Grep for "fixture", "mock", "placeholder", "degraded", "isPlaceholder" in production code
- [ ] 8.2 Verify no supplier adapter returns mock data
- [ ] 8.3 Verify no KiCad output is placeholder
- [ ] 8.4 Verify no RAG result is mock
- [ ] 8.5 Verify settings page shows "live" for ALL integrations
- [ ] 8.6 Verify degraded mode banners never appear
- [ ] 8.7 Remove or gate all fixture code paths behind explicit env var

**Pass Criteria**: 
```
grep -r "isPlaceholder.*true" apps/studio/ → 0 matches
grep -r "mock" packages/supplier-clients/src/factory.ts → only in comments
grep -r "MOCK_ERC_VIOLATIONS" services/design-worker/ → 0 matches in production path
```

---

### PHASE 9: Deploy (Zero CI Errors)
**Goal**: All changes deployed with clean build

**Commit Strategy** (9 atomic commits):
1. `fix(workflow): updateProjectStatus sets current_step for progress tracking`
2. `fix(workflow): intake route advances status after sufficient messages`
3. `feat(ui): add Compile Spec button and step action buttons`
4. `fix(ui): step cards show correct active/completed/locked state`
5. `feat(design): enable all KiCad export formats, remove fixture fallback`
6. `feat(supplier): wire real supplier adapters, verify credentials`
7. `feat(rag): configure real OpenAI embeddings, verify pgvector tables`
8. `feat(email): wire Resend for real quote notification delivery`
9. `chore: final zero-mock audit, clean up fixture code paths`

**Deploy Steps**:
- [ ] 9.1 Push each commit to main
- [ ] 9.2 Monitor Vercel deployment — zero errors
- [ ] 9.3 Run GitHub Actions CI — all checks pass
- [ ] 9.4 Monitor design-worker workflow — no failures
- [ ] 9.5 Run `pnpm build` locally — exit code 0
- [ ] 9.6 Run `pnpm typecheck` — zero errors
- [ ] 9.7 Run `pnpm test` — all tests pass

**QA**: `pnpm build && pnpm typecheck && pnpm test` all exit 0. Vercel deployment green.

---

### PHASE 10: Loop-Back Debugging
**Goal**: Fix any issues found post-deployment

**Steps**:
- [ ] 10.1 Run full E2E test again on deployed app (browser control)
- [ ] 10.2 Check Vercel function logs for errors
- [ ] 10.3 Check Supabase logs for query failures
- [ ] 10.4 Check GitHub Actions logs for KiCad failures
- [ ] 10.5 If any step fails: fix → commit → deploy → re-test
- [ ] 10.6 Loop until ALL 12 steps pass with real outputs

---

## Files to Modify

| File | Change |
|------|--------|
| `apps/studio/src/app/api/projects/[id]/intake/route.ts` | Add status advancement |
| `apps/studio/src/lib/db/project-queries.ts` | Fix updateProjectStatus to set current_step |
| `apps/studio/src/app/projects/[id]/spec/SpecPageClient.tsx` | Add Compile Spec button |
| `apps/studio/src/app/projects/[id]/page.tsx` | Fix step card locked logic |
| `services/design-worker/src/exporter/engine.ts` | Remove fixture, real exports only |
| `services/design-worker/src/validator/engine.ts` | Remove fixture ERC/DRC |
| `services/design-worker/src/cli/run-job.ts` | Enable all export formats |
| `packages/supplier-clients/src/factory.ts` | Ensure real adapters selected |
| `packages/rag/src/providers/` | Gate mock behind env var |
| Vercel Environment Variables | Add OPENAI_API_KEY, verify all others |

## Credentials to Obtain/Set

| Credential | Vercel Env Var | Status |
|-----------|---------------|--------|
| OpenAI API Key | OPENAI_API_KEY | ❌ Need to obtain |
| DigiKey Client ID | DIGIKEY_CLIENT_ID | ⚠️ Verify works |
| DigiKey Secret | DIGIKEY_CLIENT_SECRET | ⚠️ Verify works |
| Mouser API Key | MOUSER_API_KEY | ⚠️ Verify works |
| JLCPCB App ID | JLCPCB_APP_ID | ⚠️ Verify/approve |
| JLCPCB Access Key | JLCPCB_ACCESS_KEY | ⚠️ Verify/approve |
| JLCPCB Secret Key | JLCPCB_SECRET_KEY | ⚠️ Verify/approve |
| GitHub PAT | GITHUB_ACTIONS_DISPATCH_TOKEN | ⚠️ Verify works |
| EMBEDDING_PROVIDER | EMBEDDING_PROVIDER | Set to "openai" |

## Agent & Tool Requirements

- **Playwright Browser Control**: ALL platform configuration checks
- **Explore Agents**: Codebase pattern analysis
- **Librarian Agents**: Official docs (Moonshot, Supabase, Vercel, KiCad CLI, DigiKey API, Mouser API, JLCPCB API)
- **Oracle**: Architecture decisions for complex fixes
- **Deep/Unspecified-High Agents**: Implementation delegation
- **Visual-Engineering**: UI fixes (action buttons, step cards)

## Success Criteria

1. ✅ All 12 workflow steps advance with real outputs
2. ✅ KiCad produces real gerbers, schematic, BOM, netlist, 3D model
3. ✅ Supplier APIs return real pricing from DigiKey, Mouser, JLCPCB
4. ✅ RAG uses real OpenAI embeddings
5. ✅ Email sends real notifications via Resend
6. ✅ Settings page shows "live" for ALL integrations
7. ✅ Zero "mock", "fixture", "placeholder" in active code paths
8. ✅ `pnpm build && pnpm typecheck && pnpm test` all pass
9. ✅ Vercel deployment clean (no errors)
10. ✅ Full E2E test completes with real data at every step
