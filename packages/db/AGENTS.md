# packages/db — Prisma + Supabase Persistence Layer

## Purpose

Shared persistence and auth client for all Raino apps and services. Provides Prisma ORM access, Supabase auth clients, and database schema definitions.

## Package Exports

```typescript
import { createClient } from '@raino/db/supabase/server'; // Server components, API routes
import { createClient } from '@raino/db/supabase/browser'; // Client components ("use client")
import { createClient } from '@raino/db/supabase/middleware'; // Next.js middleware
import { prisma } from '@raino/db'; // Prisma client singleton
```

## Prisma Schema

Schema lives at `prisma/schema.prisma`. Key models:

- **User** — mirrors Supabase `auth.users` for app-level profile data
- **Project** — owned by a user, tracks the full design workflow state
- **DesignJob** — async job queue table for KiCad generation and other long-running tasks
- **Document** — ingested engineering documents with processing status
- **AuditEntry** — provenance trail for all significant actions

## Supabase RLS Pattern

Row-Level Security policies live in `supabase/migrations/`. The pattern:

1. Public schema tables use RLS (`ALTER TABLE ... ENABLE ROW LEVEL SECURITY`)
2. Authenticated users can read/write their own rows
3. Service-level access uses `service_role` key (bypasses RLS)
4. Never expose `service_role` to the client bundle

## pgvector Integration

The RAG package (`packages/rag`) stores embeddings in Supabase pgvector columns. This package provides the base Prisma client that the RAG package extends for vector queries. The vector column type is `vector(1536)` (OpenAI-compatible embedding dimension).

## Job Queue Table

`DesignJob` tracks async work:

| Column    | Type      | Purpose                                |
| --------- | --------- | -------------------------------------- |
| id        | uuid      | Primary key                            |
| type      | enum      | `DESIGN`, `INGEST`, `QUOTE`, `EXPORT`  |
| status    | enum      | `PENDING`, `RUNNING`, `DONE`, `FAILED` |
| input     | jsonb     | Job input payload                      |
| output    | jsonb     | Job result payload                     |
| error     | text      | Error message if failed                |
| userId    | uuid      | Owner reference                        |
| projectId | uuid      | Associated project                     |
| createdAt | timestamp | Queue time                             |
| updatedAt | timestamp | Last status change                     |

Workers poll `DesignJob` rows with `status = PENDING`, claim them with `status = RUNNING`, and write results on completion.

## Client Utilities

### Server Client (`src/supabase/server.ts`)

Creates a Supabase client using the `SUPABASE_SERVICE_ROLE_KEY` for backend access. Used in Next.js server components, API routes, and server actions. Has full read/write access.

### Browser Client (`src/supabase/browser.ts`)

Creates a Supabase client using cookies from the request. Used in `"use client"` components. Respects RLS policies based on the authenticated user's session.

### Middleware Client (`src/supabase/middleware.ts`)

Creates a Supabase client for use in `middleware.ts`. Refreshes the session cookie on every request. Does not have database access, only auth token refresh.

## Commands

```bash
pnpm build --filter @raino/db    # prisma generate + tsc
pnpm dev --filter @raino/db      # tsc --watch
pnpm test --filter @raino/db     # vitest run
pnpm prisma:generate             # Regenerate Prisma client
pnpm prisma:validate             # Validate schema
```

## Environment Variables

| Variable                    | Purpose                   | Required |
| --------------------------- | ------------------------- | -------- |
| `DATABASE_URL`              | Prisma connection string  | Yes      |
| `SUPABASE_URL`              | Supabase project URL      | Yes      |
| `SUPABASE_ANON_KEY`         | Supabase anon/public key  | Yes      |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | Yes      |
