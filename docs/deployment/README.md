# Deployment Guide

## Vercel Deployment

Raino is designed for deployment on Vercel with a monorepo-friendly setup.

### Prerequisites

- GitHub repository: https://github.com/tudsds/raino
- Vercel account connected to GitHub
- Node.js >= 20.0.0
- pnpm >= 9.0.0

### Configuration

#### vercel.json (root)

Already configured at repo root. Key settings:

- `buildCommand`: `pnpm build`
- `installCommand`: `pnpm install`
- Turborepo handles build orchestration

#### App-Specific Settings

**apps/site (Marketing)**

- Framework: Next.js
- Build command: inherited from turbo
- Output directory: `.next`
- Port: 3000

**apps/studio (Product)**

- Framework: Next.js
- Build command: inherited from turbo
- Output directory: `.next`
- Port: 3001

### Environment Variables

Required for full functionality:

```
# Supplier APIs (optional — fixture mode without them)
DIGIKEY_CLIENT_ID=
DIGIKEY_CLIENT_SECRET=
MOUSER_API_KEY=
JLCPCB_API_KEY=

# Embedding service (optional — mock mode without it)
EMBEDDING_API_KEY=
EMBEDDING_MODEL=

# Session/auth (optional for development)
NEXTAUTH_SECRET=
NEXTAUTH_URL=
```

Without these variables, Raino operates in fixture/degraded mode with clearly labeled estimates.

### Deployment Steps

1. Connect GitHub repo to Vercel
2. Configure root directory as `/` (monorepo root)
3. Vercel auto-detects Next.js apps via `vercel.json`
4. Set environment variables in Vercel dashboard
5. Deploy

### Preview Deployments

Every PR automatically gets a preview deployment via Vercel's GitHub integration.

### Production Deployment

Merge to main branch triggers production deployment.

## Local Development

```bash
# Install dependencies
pnpm install

# Run all apps in dev mode
pnpm dev

# Run specific app
pnpm dev --filter @raino/site     # Marketing site on port 3000
pnpm dev --filter @raino/studio   # Product app on port 3001
```

## Build Verification

```bash
# Build all packages and apps
pnpm build

# Type check everything
pnpm typecheck

# Run all tests
pnpm test

# Lint all
pnpm lint
```
