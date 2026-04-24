# Raino Bug Catalog

Generated: 2026-04-24
Method: Code analysis + API testing (browser automation blocked by WSL2 networking)

---

## Bug #1: KiCad Design Jobs Never Execute (Configuration Issue) ⭐ HIGHEST PRIORITY

**Severity**: BLOCKER  
**Status**: Root cause identified — requires user action  
**URL**: POST /api/projects/:id/design  

### Expected Behavior
Design generation triggers → GitHub Actions workflow runs → KiCad CLI generates real artifacts → Status updates to "completed" → Previews show real designs

### Actual Behavior
Design generation triggers → Job queued in `design_jobs` table with status `pending` → GitHub Actions dispatch NEVER fires → Job stays `pending` forever → Previews show "Design generation in progress via GitHub Actions..." indefinitely

### Root Cause
`GITHUB_ACTIONS_DISPATCH_TOKEN` environment variable is NOT set on Vercel.

From `apps/studio/src/lib/workers/dispatch.ts:52-58`:
```typescript
const token = process.env.GITHUB_ACTIONS_DISPATCH_TOKEN ?? process.env.GITHUB_DISPATCH_TOKEN;
if (!token) {
  console.warn('[dispatch] GITHUB_ACTIONS_DISPATCH_TOKEN not set — job queued but not dispatched');
  return false;
}
```

When the token is missing:
1. `dispatchDesignJob()` inserts a row into `design_jobs` with status `pending`
2. `triggerGitHubWorkflow()` returns `false` (no dispatch attempted)
3. The job remains `pending` forever
4. Previews page (`previews/page.tsx:35-37`) shows "Design generation in progress via GitHub Actions..." because status is `pending`/`running`

### Fix Required (User Action)
1. Generate a GitHub Personal Access Token:
   - Go to https://github.com/settings/tokens
   - Create classic token with `repo` scope (or fine-grained with Actions: Write + Contents: Read)
2. Add to Vercel environment variables:
   - Name: `GITHUB_ACTIONS_DISPATCH_TOKEN`
   - Value: [the GitHub PAT]
   - Apply to: raino-studio project
3. Verify GitHub repo secrets exist:
   - Go to https://github.com/tudsds/raino/settings/secrets/actions
   - Ensure `NEXT_PUBLIC_SUPABASE_URL` is set
   - Ensure `SUPABASE_SERVICE_ROLE_KEY` is set
4. Redeploy Vercel to pick up new env var

### Evidence
- `/api/debug` confirms Supabase is connected (`hasSupabaseUrl: true`, `hasServiceRoleKey: true`)
- `/api/projects/:id/design` returns 401 without auth (auth is working)
- Code analysis of `dispatch.ts` shows explicit token check with fallback to `triggered: false`
- Previews page logic at `page.tsx:14-53` shows degraded message logic

---

## Bug #2: Browser Automation Blocked (Environment Limitation)

**Severity**: HIGH (blocks full workflow testing)  
**Status**: Blocked — environment limitation  

### Problem
Playwright MCP cannot connect to Chrome from WSL2 due to localhost forwarding failure.

### Diagnosis
- WSL2 `localhostForwarding=true` is configured but non-functional
- Chrome launched on Windows binds CDP to `127.0.0.1:PORT`
- WSL2 cannot reach Windows localhost despite configuration
- Linux Chromium binary missing system libraries (`libnspr4.so`, `libnss3.so`)
- Cannot install dependencies without sudo access

### Impact
- Cannot perform browser-based workflow testing
- Cannot test magic link auth flow end-to-end
- Cannot capture DOM snapshots or screenshots
- Cannot test UI interactions

### Workaround
Using API testing (curl) instead of browser automation for backend verification.

### Evidence
- `.sisyphus/evidence/task-1-browser-blocker.md` contains full diagnosis
- Multiple connection attempts documented with error logs

---

## Bug #3: Missing `KICAD_CLI_PATH` on Vercel (Expected, Not a Bug)

**Severity**: LOW (by design)  
**Status**: Expected behavior  

### Note
`KICAD_CLI_PATH` is intentionally NOT set on Vercel because:
- KiCad cannot be installed on Vercel's serverless environment
- KiCad generation is designed to run on GitHub Actions runners (where `kicad-cli` is installed)
- The previews page correctly falls back to checking `design_jobs` table status

This is NOT a bug — it's the intended architecture. The real issue is Bug #1 (dispatch token missing).

---

## Summary

| # | Bug | Severity | Status | Action Required |
|---|-----|----------|--------|----------------|
| 1 | KiCad jobs never dispatch | BLOCKER | Config issue | User: Generate GitHub PAT, add to Vercel |
| 2 | Browser automation blocked | HIGH | Environment | User: Fix WSL2 localhost forwarding or use Windows-native env |
| 3 | Missing KICAD_CLI_PATH | LOW | By design | None — architecture is correct |

## Recommendations

1. **Immediate**: Generate GitHub PAT and add `GITHUB_ACTIONS_DISPATCH_TOKEN` to Vercel
2. **Short-term**: Fix WSL2 localhost forwarding (restart WSL2: `wsl --shutdown` from PowerShell)
3. **Medium-term**: Consider adding a health check endpoint that reports dispatch token status
4. **Long-term**: Add UI messaging when dispatch token is missing (currently silent failure)
