# Security Model

## Overview

Raino's security model is built on three pillars: Supabase Auth for identity, Row-Level Security for data isolation, and server-only API key access for external services. No API keys or secrets are ever exposed to the browser.

## Authentication

### Supabase Magic Link Auth

Users sign in with email magic links through Supabase Auth. The flow:

1. User enters email at `/login` or `/signup`
2. Supabase sends a magic link to the user's email
3. User clicks the link, which redirects to `/auth/callback`
4. Supabase exchanges the auth code for a session (JWT)
5. Session cookie is set on the response
6. Subsequent requests include the session cookie

### Session Management via Middleware

`middleware.ts` in `apps/studio` runs on every request. It:

1. Creates a Supabase middleware client (`@raino/db/supabase/middleware`)
2. Refreshes the session cookie if it is close to expiry
3. Does NOT have database access (auth token refresh only)
4. Redirects unauthenticated users to `/login` for protected routes

### Three-Client Pattern

The `@raino/db` package exports three Supabase clients for different contexts:

| Client     | Import Path                     | Context                       | Access Level                |
| ---------- | ------------------------------- | ----------------------------- | --------------------------- |
| Server     | `@raino/db/supabase/server`     | API routes, server components | Service role (bypasses RLS) |
| Browser    | `@raino/db/supabase/browser`    | Client components             | Anon key (respects RLS)     |
| Middleware | `@raino/db/supabase/middleware` | Next.js middleware            | Auth refresh only (no DB)   |

The service role key is NEVER included in client bundles. It is only accessible in server-side code.

## Row-Level Security

### RLS Policies

All Supabase tables have Row-Level Security enabled (`ALTER TABLE ... ENABLE ROW LEVEL SECURITY`). The policy pattern:

- Authenticated users can read their own rows
- Authenticated users can write their own rows
- Service-level access uses `service_role` key, which bypasses RLS
- Unauthenticated requests via the anon key can only access explicitly public data

### Policy Examples

- `projects` table: Users can `SELECT`, `INSERT`, `UPDATE`, `DELETE` rows where `user_id = auth.uid()`
- `audit_entries` table: Users can `SELECT` rows where `user_id = auth.uid()`, but only services can `INSERT`
- `design_jobs` table: Users can `SELECT` rows where `user_id = auth.uid()`, but only services can `UPDATE` status

## Server-Side Model Access

### API Keys Are Never Exposed to the Browser

All external API keys are environment variables on the server side:

| Variable                    | Used By                   | Exposed to Browser |
| --------------------------- | ------------------------- | ------------------ |
| `KIMI_API_KEY`              | `@raino/llm`              | No                 |
| `SUPABASE_SERVICE_ROLE_KEY` | `@raino/db`               | No                 |
| `DIGIKEY_CLIENT_SECRET`     | `@raino/supplier-clients` | No                 |
| `MOUSER_API_KEY`            | `@raino/supplier-clients` | No                 |
| `JLCPCB_SECRET_KEY`         | `@raino/supplier-clients` | No                 |
| `RESEND_API_KEY`            | Email service             | No                 |

Browser-exposed variables are limited to:

| Variable                        | Purpose                           |
| ------------------------------- | --------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | Supabase client initialization    |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key for RLS         |
| `NEXT_PUBLIC_APP_URL`           | Studio app URL for auth callbacks |
| `NEXT_PUBLIC_SITE_URL`          | Marketing site URL for CTA links  |

### Route Handler Security

All API routes in `apps/studio/app/api/` run server-side. They:

1. Validate the authenticated session using the server Supabase client
2. Check that the user owns the requested resource (project, job, etc.)
3. Call external APIs with server-side keys
4. Return results to the client

Client components never make direct calls to external APIs.

## Input Validation

All API inputs are validated with Zod schemas before processing:

- Type-safe parsing with clear error messages
- No `any` types anywhere in the stack
- No `@ts-ignore` or `@ts-expect-error` allowed
- Invalid input returns 400 with descriptive error details

## Data Handling

### Engineering Documents

- Sourced from official manufacturer websites
- Provenance tracked (source URL, fetch timestamp, revision)
- Trust levels: canonical (manufacturer direct) vs. secondary
- Checksums for integrity verification

### User Data

- Project descriptions and specifications belong to the user
- File uploads are stored in Supabase Storage with user-scoped buckets
- Not shared with third parties without explicit consent

### Supplier API Data

- Supplier API credentials are server-side environment variables
- Never committed to the repository
- Rate-limited to respect supplier terms of service
- Fixture mode available when credentials are missing (clearly labeled)

## No-Fake-Integration Policy

Raino never:

- Fabricates live pricing or stock data
- Claims a live API connection when using fixture data
- Silently downgrades to degraded mode without reporting
- Proceeds past critical ambiguity without user confirmation

Every degraded-mode path is inspectable through the audit trail.

## Audit Trail

Every significant action is logged by the audit worker:

- BOM decisions with source provenance
- Part selection rationale
- Artifact manifests with checksums
- Quote assumptions and confidence levels
- Policy violation flags
- Authentication events

Audit trails are queryable through the API at `GET /api/projects/:id/audit`.

## External Boundaries

### KiCad Worker

- External GPL-licensed tool boundary
- Not embedded in Raino
- Communication via defined CLI command contracts
- No KiCad code in Raino repository

### Supplier Adapters

- Interface + Adapter pattern in `@raino/supplier-clients`
- No direct database connections from adapters
- Mock implementations for testing and degraded mode
- Real implementations require server-side API credentials

## Licensing

- Raino: MIT license
- KiCad: External GPL boundary (not embedded)
- KiCad libraries and generated designs have different license considerations
- No GPL code copied into Raino
