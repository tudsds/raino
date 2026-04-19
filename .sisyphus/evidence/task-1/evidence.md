# Task 1 Evidence

## Changes Made

### 1. CSS Typo Fix

**File:** `apps/studio/src/app/projects/[id]/intake/page.tsx` (line 179)

- Before: `py-32xl`
- After: `py-3`

### 2. .env.example Comment Fix

**File:** `.env.example` (line 12)

- Before: `Defaults to https://api.moonshot.cn/v1`
- After: `Defaults to https://api.moonshot.ai/v1`

### 3. Copyright Year Update (5 files)

All Footer functions updated from "© 2024" to "© 2024-2026":

- `apps/site/src/app/page.tsx` (line 344)
- `apps/site/src/app/features/page.tsx` (line 290)
- `apps/site/src/app/architecture/page.tsx` (line 279)
- `apps/site/src/app/workflow/page.tsx` (line 185)
- `apps/site/src/app/docs/page.tsx` (line 157)

## Verification Results

### grep checks:

- `grep -r "py-32xl" apps/studio/src/` → PASS (not found)
- `grep "moonshot.cn" .env.example` → PASS (not found)
- `grep -r "© 2024 " apps/site/src/app/ --include="*.tsx"` → PASS (not found)

### Build checks:

- `pnpm typecheck` → PASS (25 tasks successful)
- `pnpm lint` → PASS (25 tasks successful)
- `pnpm test` → PASS (25 tasks successful, all tests passed)

## Evidence Captured: 2026-04-19
