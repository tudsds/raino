# Task 15 Evidence

## What was done

Created `.sisyphus/drafts/manual-steps.md` with detailed step-by-step instructions for manual GitHub, Vercel, and Supabase configuration.

## File created

- `.sisyphus/drafts/manual-steps.md`

## Coverage

1. GitHub repo description, topics, homepage URL
2. GitHub main branch protection rules
3. Vercel raino-site project creation and env vars (4 public vars)
4. Vercel raino-studio project creation and env vars (4 public + 18 server-side vars)
5. Supabase pgvector extension enablement
6. Supabase Prisma migration steps
7. Supabase auth redirect URLs (production + localhost)
8. Supabase magic-link email provider configuration
9. Verification checklist
10. Quick reference URL table

## Source of truth for env vars

- `.env.example` (57 lines, 22+ env var placeholders)
- `apps/site/package.json` (depends on `@raino/ui`, `next`, `react` only)
- `apps/studio/package.json` (depends on `@supabase/*`, `@prisma/client`, `@raino/*` workspace packages)
