# Deployment Guide

## Overview

Raino deploys as two separate Vercel applications within a monorepo. Both use Next.js 15 with Turborepo for build orchestration.

## Prerequisites

- Node.js >= 20.0.0
- pnpm >= 9.0.0
- Supabase project (for production features)
- Vercel account connected to GitHub
- Moonshot API key (for LLM features)
- Supplier API keys (for live pricing)

## Supabase Project Setup

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Enable Row-Level Security on all tables
3. Configure authentication:
   - Enable "Magic Link" provider
   - Set Site URL to your studio app domain (e.g., `https://raino-studio.vercel.app`)
   - Add redirect URLs: `https://raino-studio.vercel.app/auth/callback`
4. Enable the `vector` extension for pgvector RAG storage
5. Run Prisma migrations to create tables:

```bash
cd packages/db
npx prisma db push
```

## Environment Variables

Copy `.env.example` to `.env.local` and fill in values. All 20 variables are listed below. The app runs in degraded/fixture mode without any of them.

### LLM Gateway

| Variable       | Purpose                        | Required for  |
| -------------- | ------------------------------ | ------------- |
| `KIMI_API_KEY` | Moonshot API key for Kimi K2.5 | LLM reasoning |

### Supabase

| Variable                               | Purpose                   | Required for        |
| -------------------------------------- | ------------------------- | ------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`             | Supabase project URL      | Auth, persistence   |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase anon/public key  | Auth, persistence   |
| `SUPABASE_SERVICE_ROLE_KEY`            | Supabase service role key | Backend data access |
| `SUPABASE_DB_URL`                      | Prisma connection string  | Database operations |

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

### Embedding

| Variable             | Purpose                 | Required for   |
| -------------------- | ----------------------- | -------------- |
| `EMBEDDING_PROVIDER` | Embedding provider name | RAG embeddings |
| `EMBEDDING_MODEL`    | Embedding model ID      | RAG embeddings |

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
4. Set environment variables in each project's dashboard
5. Deploy

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
