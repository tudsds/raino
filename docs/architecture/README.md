# Raino Architecture

## System Overview

Raino is a monorepo with two Next.js 15 applications, eight shared packages, and four worker libraries. The architecture follows a three-tier pattern: frontend, middle-end, and backend-as-a-service. Workers are not separate processes; they are library packages that export functions called directly by API routes and server actions.

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
│                                                                  │
│  Worker libraries called directly from route handlers:          │
│    @raino/design-worker  (generate, validate, export)           │
│    @raino/quote-worker   (calculate rough quotes)               │
│    @raino/audit-worker   (traces, manifests, provenance)        │
│    @raino/ingest-worker  (8-stage ingestion pipeline)           │
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
│                    EXTERNAL BOUNDARIES                            │
│                                                                  │
│  KiCad CLI (GPL) — kicad-cli command contracts                  │
│  DigiKey API — component search, pricing, datasheets            │
│  Mouser API — component search, pricing                          │
│  JLCPCB API — PCB fabrication, PCBA assembly quotes             │
│  OpenAI API — embedding generation (text-embedding-3-small)     │
└─────────────────────────────────────────────────────────────────┘
```

## Frontend Layer

### apps/site

Static marketing site built with Next.js 15 App Router and Tailwind CSS v4. Uses the `@raino/ui` design system for consistent styling. No backend dependencies. Pages: hero, features, architecture overview, how-it-works workflow, docs link, GitHub link. Runs on port 3000.

### apps/studio

Product application built with Next.js 15 App Router. Depends on `@raino/core`, `@raino/db`, `@raino/llm`, `@raino/agents`, and `@raino/ui`. Handles user authentication, project management, the full PCB design workflow, BOM generation, preview rendering, and quote display. API routes in `apps/studio/app/api/` call worker library functions directly. Runs on port 3001.

### @raino/ui

Shared React component library implementing the pixel-art cyberpunk design system. Dark-first theme with neon accents. Uses Press Start 2P for headings and VT323 for body text. Built on Tailwind CSS v4. Shared across both apps.

## Middle-End Layer

### Route Handlers and Server Actions

API routes in `apps/studio/app/api/` handle all backend operations. They import worker library functions directly (e.g., `import { generateKiCadProject } from '@raino/design-worker'`) and call them within the request handler. Server Actions in components handle mutations. Both use the server Supabase client from `@raino/db/supabase/server` for database access.

### @raino/llm (Kimi K2.5 Gateway)

Provides a unified interface for calling language models. The primary implementation targets Kimi K2.5 via the OpenAI-compatible SDK (`openai` npm package with `baseURL` configured via `KIMI_API_BASE_URL`, defaulting to `https://api.moonshot.cn/v1`). Model: `kimi-k2.5`. Temperature: 1.0. Max tokens: 32768.

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

- **Prisma client** (`import { prisma } from '@raino/db'`) for ORM access to Supabase Postgres
- **Server client** (`import { createSupabaseServerClient } from '@raino/db/supabase/server'`) for API routes and server components
- **Browser client** (`import { createSupabaseBrowserClient } from '@raino/db/supabase/browser'`) for client components
- **Middleware client** (`import { updateSession } from '@raino/db/supabase/middleware'`) for session refresh

### Database Schema (Prisma)

Models defined in `packages/db/prisma/schema.prisma`. The schema includes multi-tenant organization support:

| Model              | Purpose                                              |
| ------------------ | ---------------------------------------------------- |
| User               | App-level profile data, mirrors Supabase auth.users  |
| Organization       | Top-level tenant, holds members and projects         |
| OrganizationMember | Many-to-many join between users and organizations    |
| Project            | Owned by an organization, tracks the design workflow |
| IntakeMessage      | Chat messages from the natural-language intake stage |
| Spec               | Structured product specification with JSON fields    |
| Architecture       | Selected architecture template with feature set      |
| BOM                | Bill of materials header with cost totals            |
| BOMRow             | Individual BOM line items with provenance tracking   |
| Quote              | Rough cost quote with low/mid/high bands             |
| IngestionManifest  | Ingestion pipeline status and sufficiency report     |
| DesignArtifact     | Generated files with checksums and storage locations |
| DesignJob          | Async job queue for long-running tasks               |
| HandoffRequest     | Manufacturing handoff requests                       |
| AuditEntry         | Provenance trail for all significant actions         |

### RAG Tables (Raw SQL)

Three pgvector tables are created by raw SQL migrations (not Prisma) because Prisma does not natively support the `vector` column type:

- `documents` — raw and normalized engineering documents
- `chunks` — semantically-split document chunks
- `embeddings` — vector embeddings for similarity search

These tables live in `packages/db/supabase/migrations/00003_vector_and_rag.sql`.

### DesignJob Queue

`DesignJob` rows track long-running work. API routes create jobs with `status = pending`, and worker functions claim and execute them within the same request (synchronous execution) or via the `pollAndExecuteWithPrisma()` helper (async polling). Job types defined by the worker: `generate`, `validate`, `export`. Status flow: `pending` → `running` → `completed` or `failed`.

### pgvector

The RAG package stores embeddings in Supabase pgvector columns. Vector dimension: 1536 (OpenAI `text-embedding-3-small` compatible). Embeddings are generated by OpenAI when `EMBEDDING_PROVIDER=openai` and `OPENAI_API_KEY` is set. Otherwise, a deterministic mock generator produces fake embeddings for development and testing.

### Supabase Storage Buckets

Three storage buckets are created by `packages/db/supabase/migrations/00004_storage_buckets.sql`:

| Bucket      | Public | Purpose                                         |
| ----------- | ------ | ----------------------------------------------- |
| `reports`   | No     | Generated reports and audit trails              |
| `artifacts` | No     | Design artifacts (KiCad projects, Gerber files) |
| `uploads`   | Yes    | User-uploaded documents (datasheets, specs)     |

## Worker Libraries

Workers are library packages under `services/`, not standalone processes. Each has `"main": "./dist/index.js"` in its `package.json` and exports typed functions. API routes and server actions import these functions directly.

### @raino/ingest-worker

8-stage document ingestion pipeline exported as individual stage functions plus orchestration utilities. Stages run sequentially: candidate discovery → doc fetch → raw store → normalization → chunking → metadata enrichment → embedding → sufficiency gate. Each stage must pass before the next begins.

Key exports:

```typescript
import {
  discoverCandidates,
  fetchDocuments,
  storeRawDocuments,
  normalizeDocument,
  chunkDocuments,
  enrichMetadata,
  generateEmbeddings,
  runSufficiencyGate,
} from '@raino/ingest-worker';
```

Also provides CLI entry points for standalone bootstrapping (`ingest:bootstrap`, `ingest:validate`, `ingest:report`).

### @raino/design-worker

KiCad project generation, validation, and export. Communicates with external KiCad worker via `kicad-worker-client` CLI contracts. Generates `.kicad_pro`, `.kicad_sch`, `.kicad_pcb`, and export files (SVG, PDF, GLB, Gerber). Validates outputs with ERC and DRC.

Key exports:

```typescript
import {
  generateKiCadProject,
  runValidation,
  runValidationAsync,
  runExport,
  runExportAsync,
  generatePreviewAssets,
  pollAndExecuteWithPrisma,
} from '@raino/design-worker';
```

The `pollAndExecuteWithPrisma()` helper finds pending `DesignJob` rows, claims them, executes the job, and writes results back. This enables both synchronous (called from a route handler) and async (called from a polling loop) execution patterns.

### @raino/quote-worker

Rough quote engine. Aggregates supplier pricing, calculates fee components (design automation, engineering review, PCB fabrication, assembly, QA), produces low/mid/high quote bands with confidence levels.

Key exports:

```typescript
import {
  calculateRoughQuote,
  aggregateSupplierPrices,
  createQuoteAdapters,
} from '@raino/quote-worker';
```

### @raino/audit-worker

Audit trail, artifact manifests, provenance tracking, and policy validation. Every BOM decision, part selection, and quote assumption is logged. Artifacts carry manifests with checksums and generation timestamps.

Key exports:

```typescript
import {
  createAuditTraceStore,
  generateManifest,
  validatePolicies,
  generateAuditReport,
} from '@raino/audit-worker';
```

Provides both `InMemoryAuditTraceStore` (for tests and degraded mode) and `SupabaseAuditTraceStore` (for production), selected by the `createAuditTraceStore()` factory.

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
- Embeddings generated by OpenAI when configured (`EMBEDDING_PROVIDER=openai` + `OPENAI_API_KEY`), mock otherwise
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
