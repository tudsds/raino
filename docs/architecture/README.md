# Raino Architecture

## System Overview

Raino is a monorepo with two Next.js 15 applications, eight shared packages, and four worker services. The architecture follows a three-tier pattern: frontend, middle-end, and backend-as-a-service.

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND                                 │
│                                                                  │
│  apps/site (Next.js 15, Tailwind v4)                            │
│  apps/studio (Next.js 15, Tailwind v4, @raino/ui)               │
│                                                                  │
│  Design: pixel-art cyberpunk (Press Start 2P + VT323 fonts)    │
└──────────────────────────┬──────────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────────┐
│                       MIDDLE-END                                 │
│                                                                  │
│  Route Handlers · Server Actions · API Routes                   │
│  @raino/llm (Kimi K2.5 via OpenAI SDK)                          │
│  @raino/agents (workflow state machine, prompt orchestration)   │
│  @raino/core (Zod schemas, validation, domain logic)            │
└──────────────────────────┬──────────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────────┐
│                    BACKEND-AS-A-SERVICE                          │
│                                                                  │
│  Supabase Postgres (via Prisma ORM)                              │
│  Supabase Auth (magic link, RLS policies)                       │
│  Supabase Storage (file uploads, artifacts)                     │
│  Supabase pgvector (RAG embeddings)                              │
└──────────────────────────┬──────────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────────┐
│                     WORKER SERVICES                               │
│                                                                  │
│  ingest-worker  — 8-stage document ingestion pipeline           │
│  design-worker  — KiCad project generation and export           │
│  quote-worker   — rough quote calculation with confidence bands │
│  audit-worker   — traces, manifests, provenance tracking        │
└─────────────────────────────────────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────────┐
│                    EXTERNAL BOUNDARIES                            │
│                                                                  │
│  KiCad CLI (GPL) — kicad-cli command contracts                  │
│  DigiKey API — component search, pricing, datasheets            │
│  Mouser API — component search, pricing                          │
│  JLCPCB API — PCB fabrication, PCBA assembly quotes             │
└─────────────────────────────────────────────────────────────────┘
```

## Frontend Layer

### apps/site

Static marketing site built with Next.js 15 App Router and Tailwind CSS v4. Uses the `@raino/ui` design system for consistent styling. No backend dependencies. Pages: hero, features, architecture overview, how-it-works workflow, docs link, GitHub link. Runs on port 3000.

### apps/studio

Product application built with Next.js 15 App Router. Depends on `@raino/core`, `@raino/db`, `@raino/llm`, `@raino/agents`, and `@raino/ui`. Handles user authentication, project management, the full PCB design workflow, BOM generation, preview rendering, and quote display. Runs on port 3001.

### @raino/ui

Shared React component library implementing the pixel-art cyberpunk design system. Dark-first theme with neon accents. Uses Press Start 2P for headings and VT323 for body text. Built on Tailwind CSS v4. Shared across both apps.

## Middle-End Layer

### Route Handlers and Server Actions

API routes in `apps/studio/app/api/` handle all backend operations. Server Actions in components handle mutations. Both use the server Supabase client from `@raino/db/supabase/server` for database access.

### @raino/llm (Kimi K2.5 Gateway)

Provides a unified interface for calling language models. The primary implementation targets Kimi K2.5 via the OpenAI-compatible SDK (`openai` npm package with `baseURL: https://api.moonshot.cn/v1`). Model: `moonshot-v1-auto`. Temperature: 0.0 (deterministic). Max tokens: 4096.

Supports two call patterns:

- `complete(prompt)` returns a raw string
- `completeStructured<T>(prompt, zodSchema)` returns typed, validated results

Retry logic: 3 attempts with exponential backoff for network/rate-limit errors. 2 additional attempts for structured parse failures with re-prompting. Without `KIMI_API_KEY`, throws a clear configuration error at call time.

### @raino/agents

Workflow state machine defining the 12-state PCB design workflow and valid state transitions. Contains agent prompt templates as strings with placeholder variables. The calling code renders templates with project context, then passes the rendered prompt to `@raino/llm`.

### @raino/core

Central domain package. All Zod schemas, validation functions, quote engine logic, BOM types, architecture types, and audit models. Every other package depends on this.

## Backend Layer (Supabase)

### @raino/db

Shared persistence and auth client package. Exports:

- **Prisma client** (`@raino/db`) for ORM access to Supabase Postgres
- **Server client** (`@raino/db/supabase/server`) for API routes and server components
- **Browser client** (`@raino/db/supabase/browser`) for client components
- **Middleware client** (`@raino/db/supabase/middleware`) for session refresh

### Database Schema (Prisma)

Key models defined in `packages/db/prisma/schema.prisma`:

| Model      | Purpose                                               |
| ---------- | ----------------------------------------------------- |
| User       | App-level profile data, mirrors Supabase auth.users   |
| Project    | Owned by a user, tracks full design workflow state    |
| DesignJob  | Async job queue for KiCad generation and other tasks  |
| Document   | Ingested engineering documents with processing status |
| AuditEntry | Provenance trail for all significant actions          |

### DesignJob Queue

Workers poll `DesignJob` rows with `status = PENDING`, claim them with `status = RUNNING`, and write results on completion. Job types: `DESIGN`, `INGEST`, `QUOTE`, `EXPORT`. Status flow: `PENDING` → `RUNNING` → `DONE` or `FAILED`.

### pgvector

The RAG package stores embeddings in Supabase pgvector columns. Vector dimension: 1536 (OpenAI-compatible). The `@raino/db` package provides the base Prisma client that `@raino/rag` extends for vector queries.

## Worker Services

### services/ingest-worker

8-stage document ingestion pipeline: candidate discovery → doc fetch → raw store → normalization → chunking → metadata enrichment → embedding → sufficiency gate. Each stage must pass before the next begins. The sufficiency gate is a formal check that verifies all required engineering data is present.

### services/design-worker

KiCad project generation, validation, and export. Communicates with external KiCad worker via `kicad-worker-client` CLI contracts. Generates `.kicad_pro`, `.kicad_sch`, `.kicad_pcb`, and export files (SVG, PDF, GLB, Gerber). Validates outputs with ERC and DRC.

### services/quote-worker

Rough quote engine. Aggregates supplier pricing, calculates fee components (design automation, engineering review, PCB fabrication, assembly, QA), produces low/mid/high quote bands with confidence levels. Confidence depends on the ratio of live vs. fixture-derived prices.

### services/audit-worker

Audit trail, artifact manifests, provenance tracking, and policy validation. Every BOM decision, part selection, and quote assumption is logged. Artifacts carry manifests with checksums and generation timestamps.

## Key Boundaries

### KiCad Worker Boundary

- KiCad is GPL-licensed external tool, not embedded in Raino (MIT)
- Communication via CLI commands (`kicad-cli`) defined in `@raino/kicad-worker-client`
- Generated designs may carry different license terms
- No KiCad source code in the Raino repository

### Supplier Adapter Boundary

- DigiKey, Mouser, JLCPCB adapters in `@raino/supplier-clients`
- Interface + Adapter pattern with factory for runtime selection
- Mock implementations kept as permanent fixtures
- Quote source of truth is always supplier adapter output, never RAG

### RAG vs Live Data Boundary

- RAG (via `@raino/rag`): engineering knowledge retrieval (datasheets, errata, app notes)
- Stored in Supabase pgvector for production, in-memory for degraded mode
- Supplier adapters: live pricing, stock, MOQ, orders
- These are separate systems with separate data sources

## Authentication Flow

1. User visits `/login` or `/signup` in the studio app
2. Supabase sends a magic link email
3. User clicks the link, which redirects to `/auth/callback`
4. Supabase exchanges the auth code for a session
5. Middleware (`@raino/db/supabase/middleware`) refreshes the session cookie on every request
6. Protected routes check for authenticated session, redirect to `/login` if missing
7. Server components and API routes use the server Supabase client with RLS

## Storage

| Storage Type | Production                 | Degraded Mode          |
| ------------ | -------------------------- | ---------------------- |
| Relational   | Supabase Postgres (Prisma) | In-memory fallbacks    |
| Documents    | Supabase Storage           | Local filesystem       |
| Vector       | Supabase pgvector          | In-memory arrays       |
| Auth         | Supabase Auth              | Session checks skipped |
| Job Queue    | Supabase Postgres table    | In-memory queue        |
