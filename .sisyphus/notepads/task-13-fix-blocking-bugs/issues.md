# Issues Found and Fixed — Task 13

## Bug 1: Root layout crashes in degraded mode (BLOCKING)

**File:** `apps/studio/src/app/layout.tsx`
**Problem:** Root layout used `process.env.NEXT_PUBLIC_SUPABASE_URL!` with non-null assertion and called `supabase.auth.getSession()` directly. When Supabase credentials were missing (degraded mode), `createServerClient` received empty/undefined strings and threw, crashing the entire app — every page returned 500.
**Fix:** Replaced direct Supabase client creation with `getCurrentUser()` (which has graceful degraded-mode handling). Only creates a Supabase client if a user actually exists, wrapped in try/catch.

## Bug 2: Login page error param mismatch (BLOCKING)

**File:** `apps/studio/src/app/login/page.tsx`
**Problem:** Login page checked for `error === 'provisioning_failed'` but the auth callback (`/auth/callback/route.ts`) sends `error === 'provision_failed'`. Users redirected from a failed auth callback would never see the error message.
**Fix:** Updated to check both `provision_failed` and `provisioning_failed`. Also added handling for `auth_exchange_failed`.

## Non-blocking observations (not fixed — cosmetic/architectural)

- API routes use non-null assertions on env vars but have try/catch error handling — acceptable since API routes return JSON errors rather than crashing pages
- Signout route uses non-null assertions but is only reachable during auth flows when Supabase is configured
- No TODOs/FIXMEs found in studio app code (only one in an audit API route which is a note, not a bug)
