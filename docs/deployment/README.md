# Deployment Guide

## Overview

Raino deploys as two separate Vercel applications within a monorepo. Both use Next.js 15 with Turborepo for build orchestration. Worker logic lives in library packages under `services/` and runs inside the Next.js serverless functions, not as separate processes.

## Prerequisites

- Node.js >= 20.0.0
- pnpm >= 9.0.0
- Supabase project (for production features)
- Vercel account connected to GitHub
- Moonshot API key (for LLM features)
- OpenAI API key (for embedding features)
- Supplier API keys (for live pricing)

## Supabase Project Setup

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Configure authentication:
   - Enable "Magic Link" provider
   - Set Site URL to your studio app domain (e.g., `https://raino-studio.vercel.app`)
   - Add redirect URLs: `https://raino-studio.vercel.app/auth/callback`
3. Run database migrations in order:

### Step 1: Prisma Migrations

Prisma creates the core application tables. Run this first because raw SQL migrations reference these tables.

```bash
cd packages/db
npx prisma db push
```

### Step 2: Raw SQL Migrations

These manage features Prisma cannot model: extensions, RLS policies, pgvector tables, and storage buckets. They must run after Prisma.

```bash
cd packages/db
psql "$DATABASE_URL" -f supabase/migrations/00001_enable_extensions.sql   # pgcrypto, vector
psql "$DATABASE_URL" -f supabase/migrations/00002_rls_policies.sql        # tenant-scoped RLS
psql "$DATABASE_URL" -f supabase/migrations/00003_vector_and_rag.sql       # documents, chunks, embeddings
psql "$DATABASE_URL" -f supabase/migrations/00004_pgvector_1536.sql        # dimension migration
psql "$DATABASE_URL" -f supabase/migrations/00004_storage_buckets.sql      # designs, documents, avatars
psql "$DATABASE_URL" -f supabase/migrations/00005_seed_data.sql            # seed data
```

Or run them all at once:

```bash
./packages/db/scripts/migrate.sh
```

### Step 3: Verify Storage Buckets

Confirm the three storage buckets exist in the Supabase dashboard under Storage:

| Bucket      | Public | Purpose                            |
| ----------- | ------ | ---------------------------------- |
| `designs`   | No     | KiCad exports, generated artifacts |
| `documents` | No     | Ingested engineering documents     |
| `avatars`   | Yes    | User profile avatars               |

## Environment Variables

Copy `.env.example` to `.env.local` and fill in values. The app runs in degraded/fixture mode without any of them. Every degraded path is clearly labeled in the UI.

### Database (Prisma)

| Variable       | Purpose                      | Required for    |
| -------------- | ---------------------------- | --------------- |
| `DATABASE_URL` | PostgreSQL connection string | All persistence |

### LLM Gateway

| Variable            | Purpose                        | Required for  |
| ------------------- | ------------------------------ | ------------- |
| `KIMI_API_KEY`      | Moonshot API key for Kimi K2.5 | LLM reasoning |
| `KIMI_API_BASE_URL` | Kimi API base URL              | LLM reasoning |

### Supabase

| Variable                               | Purpose                   | Required for        |
| -------------------------------------- | ------------------------- | ------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`             | Supabase project URL      | Auth, persistence   |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase anon/public key  | Auth, persistence   |
| `SUPABASE_SERVICE_ROLE_KEY`            | Supabase service role key | Backend data access |

### GitHub Actions

| Variable                        | Purpose                        | Required for         |
| ------------------------------- | ------------------------------ | -------------------- |
| `GITHUB_ACTIONS_DISPATCH_TOKEN` | GitHub PAT for worker dispatch | Async job triggering |
| `GITHUB_REPOSITORY_OWNER`       | Repository owner               | Worker dispatch      |
| `GITHUB_REPOSITORY_NAME`        | Repository name                | Worker dispatch      |

### Vercel

| Variable               | Purpose                   | Required for    |
| ---------------------- | ------------------------- | --------------- |
| `VERCEL_TOKEN`         | Vercel API token          | Worker dispatch |
| `NEXT_PUBLIC_APP_URL`  | Studio app public URL     | Auth callbacks  |
| `NEXT_PUBLIC_SITE_URL` | Marketing site public URL | CTA links       |

### Email

| Variable         | Purpose        | Required for        |
| ---------------- | -------------- | ------------------- |
| `RESEND_API_KEY` | Resend API key | Email notifications |

### Supplier APIs

| Variable                | Purpose                   | Required for      |
| ----------------------- | ------------------------- | ----------------- |
| `DIGIKEY_CLIENT_ID`     | DigiKey API client ID     | Live DigiKey data |
| `DIGIKEY_CLIENT_SECRET` | DigiKey API client secret | Live DigiKey data |
| `DIGIKEY_REDIRECT_URI`  | DigiKey OAuth redirect    | Live DigiKey data |
| `MOUSER_API_KEY`        | Mouser API key            | Live Mouser data  |
| `JLCPCB_APP_ID`         | JLCPCB API app ID         | Live JLCPCB data  |
| `JLCPCB_ACCESS_KEY`     | JLCPCB API access key     | Live JLCPCB data  |
| `JLCPCB_SECRET_KEY`     | JLCPCB API secret key     | Live JLCPCB data  |

### Embeddings

| Variable             | Purpose                                    | Required for               |
| -------------------- | ------------------------------------------ | -------------------------- |
| `EMBEDDING_PROVIDER` | `"openai"` or `"mock"` (default)           | RAG embeddings             |
| `EMBEDDING_MODEL`    | Model ID (default: text-embedding-3-small) | RAG embeddings             |
| `OPENAI_API_KEY`     | OpenAI API key for embeddings              | Live embeddings            |
| `OPENAI_BASE_URL`    | Override OpenAI base URL                   | Custom embedding endpoints |

When `EMBEDDING_PROVIDER=openai` and `OPENAI_API_KEY` is set, embeddings are generated by OpenAI. Otherwise, a deterministic mock generator is used (no API calls, fake vectors).

### KiCad

| Variable         | Purpose                  | Required for             |
| ---------------- | ------------------------ | ------------------------ |
| `KICAD_CLI_PATH` | Path to kicad-cli binary | KiCad project generation |

## Vercel Monorepo Deployment

### Vercel Projects

Raino uses two separate Vercel projects, one per app:

| App    | Project ID                         | Root Directory |
| ------ | ---------------------------------- | -------------- |
| Site   | `prj_sHI01eG1T6tkDwzEJIJ5ipBMGGnF` | `apps/site`    |
| Studio | `prj_Nfp3GrdFKuqzhQOX4FIgcmlxkGk3` | `apps/studio`  |

### Setup Steps

1. Push the repository to GitHub
2. In Vercel, create (or connect) a project for the marketing site:
   - Link to `tudsds/raino` repository
   - Set Root Directory to `apps/site`
   - Framework Preset: Next.js
3. In Vercel, create (or connect) a project for the studio:
   - Link to `tudsds/raino` repository
   - Set Root Directory to `apps/studio`
   - Framework Preset: Next.js
4. Set environment variables in each project's dashboard (both apps need the full set)
5. Deploy

### Worker Libraries in Vercel

Workers are not separate deployments. They are npm packages (`@raino/design-worker`, `@raino/quote-worker`, `@raino/audit-worker`, `@raino/ingest-worker`) bundled into the studio app by Turborepo. When an API route imports a worker function, it runs inside the Vercel serverless function. No additional infrastructure is needed.

### Build Configuration

Each Vercel project builds its app independently. Turborepo handles internal package dependency ordering within each build. The root `vercel.json` enables git-based deployment.

### Preview and Production

- Every pull request gets an automatic preview deployment for both apps
- Merging to `main` triggers production deployment for both apps

## Local Development

```bash
# Install all dependencies
pnpm install

# Run all apps in dev mode
pnpm dev

# Run specific app
pnpm dev --filter @raino/site     # Marketing site on port 3000
pnpm dev --filter @raino/studio   # Product app on port 3001
```

### Local Supabase (Optional)

For local development with a real database, use Supabase CLI:

```bash
supabase init
supabase start
# Update .env.local with local Supabase credentials
```

Then apply migrations:

```bash
cd packages/db
npx prisma db push
./scripts/migrate.sh
```

## Degraded Mode Operation

Without any credentials configured, both apps render their UI in degraded mode:

- **Marketing site**: Works fully. No backend dependencies.
- **Studio**: Shows auth prompts. Allows browsing but cannot persist data, call LLMs, or query suppliers. All fixture/mock paths are clearly labeled.

Mock adapters and fixture data are permanent parts of the codebase, not temporary hacks. They exist for testing, development, and honest fallback behavior.

## Build Verification

```bash
pnpm build        # Build all packages and apps
pnpm typecheck    # Type check everything
pnpm test         # Run all tests
pnpm lint         # Lint all
```
