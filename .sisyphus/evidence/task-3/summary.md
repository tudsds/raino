# Task 3: Refactor Navigation and Footer to Shared Layout Components

## Summary

Refactored raino-site navigation and footer from inline per-page copies into shared layout components.

## Changes Made

### New Files

- `apps/site/src/components/Footer.tsx` — Shared 4-column footer component (extracted from homepage)

### Modified Files

- `apps/site/src/components/Navbar.tsx` — Updated to use `usePathname()` from `next/navigation` instead of `activePath` prop, making it self-contained for layout use
- `apps/site/src/app/layout.tsx` — Imports and renders `<Navbar />` and `<Footer />` around `{children}`
- `apps/site/src/app/page.tsx` — Removed inline `<Navbar activePath="/" />` and `<Footer />`, removed Navbar import
- `apps/site/src/app/features/page.tsx` — Removed inline `<Navbar activePath="/features" />`, `<Footer />`, and `function Footer() {}` definition. Removed unused `Link` import.
- `apps/site/src/app/architecture/page.tsx` — Removed inline `<Navbar activePath="/architecture" />`, `<Footer />`, and `function Footer() {}` definition. Removed unused `Link` import.
- `apps/site/src/app/workflow/page.tsx` — Removed inline `function Navbar() {}` and `function Footer() {}` definitions. Removed `<Navbar />` and `<Footer />` from return.
- `apps/site/src/app/docs/page.tsx` — Removed inline `function Navbar() {}` and `function Footer() {}` definitions. Removed `<Navbar />` and `<Footer />` from return. Removed unused `Link` import.

## Verification

- `grep -n "function Footer" apps/site/src/app/*/page.tsx apps/site/src/app/page.tsx` → no output (none found)
- `grep -n "function Navbar" apps/site/src/app/*/page.tsx apps/site/src/app/page.tsx` → no output (none found)
- `pnpm build --filter @raino/site` → SUCCESS — all 5 pages prerendered as static content

## Design Decision

- Used the rich 4-column footer from the homepage as the shared footer for all pages (replacing the simpler 1-row footers on features, architecture, workflow, and docs pages)
- Navbar now uses `usePathname()` hook to auto-detect active path, eliminating the need to pass `activePath` prop from each page
