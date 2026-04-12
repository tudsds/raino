<p align="center">
  <strong>Raino</strong>
</p>
<p align="center">
  Agentic PCB &amp; PCBA Workflow Platform
</p>

[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![GitHub](https://img.shields.io/badge/repository-tudsds%2Fraino-181717.svg)](https://github.com/tudsds/raino)

---

## What is Raino?

Raino is a constrained, auditable, source-traceable hardware design and manufacturing handoff system. It takes fuzzy hardware intent expressed in natural language and turns it into structured product specifications, selects approved architectures, resolves procurement data from real suppliers, generates KiCad projects, and produces manufacturing bundles with rough cost quotes.

Raino is not a chatbot. It is not an unconstrained autonomous PCB autopilot. Every design decision is bounded by approved architecture templates, every part selection is traceable to its source, and every quote clearly distinguishes between live supplier data and fixture estimates. The system runs formal sufficiency gates before it generates any design, and it stops and asks for human input when it encounters ambiguity it cannot resolve.

The platform has two frontend applications, eight shared packages, and four worker services. It uses Supabase for persistence, auth, and vector storage, Kimi K2.5 for LLM reasoning, and a pixel-art cyberpunk design system. All of it is open source under the MIT license.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        Users                                 │
│                                                              │
│  ┌──────────────┐              ┌──────────────────────┐      │
│  │  apps/site   │              │    apps/studio       │      │
│  │  Marketing   │───CTA──────▶│    Product App       │      │
│  │  (Port 3000) │              │    (Port 3001)       │      │
│  └──────────────┘              └──────┬───────────────┘      │
│                                       │                      │
│                         Route Handlers │ Server Actions       │
│                         + LLM Gateway  │ + Supabase Client    │
│                                       ▼                      │
│  ┌─────────────────────────────────────────────────────┐     │
│  │                 packages/core                         │     │
│  │  Schemas · Validation · Quote Engine · Domain Logic   │     │
│  └──┬──────┬──────┬──────┬──────┬──────┬──────┬────────┘    │
│     │      │      │      │      │      │      │               │
│  packages/  packages/  packages/  packages/  packages/  packages/
│  agents      rag     kicad-w-c  supplier-c  db       llm        │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐     │
│  │                 packages/ui                           │     │
│  │  Pixel-art cyberpunk design system (React + TW v4)  │     │
│  └─────────────────────────────────────────────────────┘     │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐     │
│  │                 Worker Services                        │     │
│  │  ingest-worker · design-worker · quote-worker · audit  │     │
│  └─────────────────────────────────────────────────────┘     │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐     │
│  │                 External Boundaries                   │     │
│  │  Supabase (Auth + Postgres + Storage + pgvector)      │     │
│  │  KiCad CLI (GPL) · DigiKey · Mouser · JLCPCB         │     │
│  └─────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

## Repository Structure

```
raino/
├── apps/
│   ├── site/                # Next.js 15 marketing site (port 3000)
│   └── studio/              # Next.js 15 product app (port 3001)
├── packages/
│   ├── core/                # Zod schemas, validation, domain logic
│   ├── db/                  # Prisma ORM + Supabase auth/storage/pgvector clients
│   ├── llm/                 # Kimi K2.5 model gateway (OpenAI-compatible SDK)
│   ├── rag/                 # Chunking, embeddings, retrieval (Supabase pgvector)
│   ├── agents/              # Workflow contracts, state machine, orchestration
│   ├── ui/                  # Pixel-art cyberpunk design system (React + Tailwind v4)
│   ├── kicad-worker-client/ # KiCad CLI contracts and client interface
│   └── supplier-clients/    # Supplier adapter interfaces + factory
├── services/
│   ├── ingest-worker/       # Document ingestion pipeline
│   ├── design-worker/       # KiCad project generation
│   ├── quote-worker/        # Rough quote engine
│   └── audit-worker/        # Traces, manifests, provenance
├── docs/
│   ├── architecture/        # System architecture documentation
│   ├── api/                 # API reference
│   ├── deployment/          # Deployment guides
│   ├── ingestion/           # Ingestion pipeline docs
│   ├── security/            # Security model documentation
│   └── ux/                  # UX design language
├── prompts/                 # Agent prompts and evaluation criteria
├── data/                    # Seed data and fixtures
├── examples/                # Example projects and usage
├── scripts/                 # Build and utility scripts
├── tests/                   # Integration and e2e tests
├── AGENTS.md                # Development agent instructions
├── LICENSE                  # MIT License
├── .env.example             # All 20 environment variable placeholders
├── package.json             # Root package configuration
├── pnpm-workspace.yaml      # Monorepo workspace definition
├── turbo.json               # Turborepo task configuration
├── tsconfig.json            # Root TypeScript configuration
└── vercel.json              # Vercel deployment configuration
```

## All Packages and Services

| Name                         | Purpose                                                      | Location                       |
| ---------------------------- | ------------------------------------------------------------ | ------------------------------ |
| `@raino/site`                | Marketing website with hero, features, architecture overview | `apps/site`                    |
| `@raino/studio`              | Product app: auth, intake, spec, BOM, previews, quotes       | `apps/studio`                  |
| `@raino/core`                | Zod schemas, validation, quote engine, domain types          | `packages/core`                |
| `@raino/db`                  | Prisma ORM, Supabase auth/storage/pgvector clients           | `packages/db`                  |
| `@raino/llm`                 | Kimi K2.5 model gateway, structured output, retry logic      | `packages/llm`                 |
| `@raino/rag`                 | Engineering-aware chunking, Supabase pgvector retrieval      | `packages/rag`                 |
| `@raino/agents`              | Workflow state machine, agent prompts, orchestration         | `packages/agents`              |
| `@raino/ui`                  | Pixel-art cyberpunk design system, React + Tailwind v4       | `packages/ui`                  |
| `@raino/kicad-worker-client` | KiCad CLI command contracts, job types                       | `packages/kicad-worker-client` |
| `@raino/supplier-clients`    | DigiKey, Mouser, JLCPCB adapter interfaces + factory         | `packages/supplier-clients`    |
| `ingest-worker`              | 8-stage document ingestion pipeline                          | `services/ingest-worker`       |
| `design-worker`              | KiCad project generation and export                          | `services/design-worker`       |
| `quote-worker`               | Rough quote calculation with confidence bands                | `services/quote-worker`        |
| `audit-worker`               | Audit trail, artifact manifests, provenance tracking         | `services/audit-worker`        |

## Tech Stack

| Layer      | Technology                                              |
| ---------- | ------------------------------------------------------- |
| Frontend   | Next.js 15, React 19, Tailwind CSS v4                   |
| Design     | @raino/ui (pixel-art cyberpunk, Press Start 2P + VT323) |
| Backend    | Next.js Route Handlers, Server Actions, Supabase        |
| Database   | Supabase Postgres, Prisma ORM, pgvector                 |
| Auth       | Supabase Auth (magic link)                              |
| Storage    | Supabase Storage                                        |
| LLM        | Kimi K2.5 via OpenAI SDK (moonshot.ai)                  |
| Validation | Zod                                                     |
| Testing    | Vitest                                                  |
| Build      | Turborepo, pnpm workspaces                              |
| Deploy     | Vercel (monorepo, two apps)                             |
| EDA        | KiCad CLI (external GPL boundary)                       |
| Suppliers  | DigiKey, Mouser, JLCPCB (adapter interfaces)            |

## Phase 2 Architecture

Raino has been upgraded from a fixture-only prototype to a production-grade architecture with real persistence, authentication, and model access.

### Supabase Persistence Layer (`@raino/db`)

Prisma ORM connects to a Supabase Postgres database. Key models: User, Project, DesignJob, Document, AuditEntry. The package also exports three Supabase clients:

- **Server client** (`@raino/db/supabase/server`) for API routes and server components
- **Browser client** (`@raino/db/supabase/browser`) for client components
- **Middleware client** (`@raino/db/supabase/middleware`) for session refresh

Row-Level Security (RLS) policies restrict data access to authenticated users. The service role key bypasses RLS for backend operations and is never exposed to the browser.

### Kimi K2.5 Model Gateway (`@raino/llm`)

A unified LLM interface using the OpenAI SDK pointed at Moonshot's API. Supports structured output through Zod schema validation. The gateway wraps every call with exponential backoff retry (3 attempts) and structured parse retry (2 attempts). Without `KIMI_API_KEY`, the gateway throws a clear configuration error at call time.

### Pixel-Art Cyberpunk Design System (`@raino/ui`)

The UI uses Press Start 2P for headings and VT323 for body text. Dark-first theme with neon accents. Built on React and Tailwind CSS v4. Shared across both the marketing site and the product studio.

### Authentication Flow

Users sign in with Supabase magic link. The middleware refreshes the session cookie on every request. Protected routes redirect unauthenticated users to `/login`. Auth pages: `/login`, `/signup`, `/auth/callback`.

## Degraded / Fixture Mode

Raino runs in degraded mode when credentials are missing. This is not a secret. The app labels every degraded path clearly.

| Missing Credential                          | What Still Works                | What Falls Back                          |
| ------------------------------------------- | ------------------------------- | ---------------------------------------- |
| Supabase credentials                        | Static pages, UI rendering      | Auth, project persistence, RAG           |
| `KIMI_API_KEY`                              | Everything except LLM calls     | Natural language intake, agent reasoning |
| Supplier API keys (DigiKey, Mouser, JLCPCB) | All design workflow steps       | Live pricing, stock, MOQ data            |
| KiCad CLI                                   | Project management, BOM, quotes | Actual KiCad project generation          |

Mock adapters and fixture data are permanent fixtures of the codebase, not temporary hacks. They exist so the system is always inspectable and testable without live credentials.

## Outside APIs and Boundaries

### KiCad (GPL Boundary)

KiCad is an external GPL-licensed EDA tool. Raino does not embed KiCad code. Communication happens through CLI commands (`kicad-cli`) defined in `packages/kicad-worker-client`. Generated KiCad designs and KiCad library files may carry different license considerations than Raino itself.

### Supplier Adapters

Raino defines adapter interfaces for DigiKey, Mouser, and JLCPCB in `packages/supplier-clients`. These use the Interface + Adapter pattern with a factory for runtime selection. No live API credentials are assumed. When credentials are missing, the system uses mock adapters with clearly labeled estimates.

### RAG Boundaries

The RAG system in `packages/rag` stores embeddings in Supabase pgvector. It connects to the OpenAI-compatible embedding endpoint via a pluggable interface. In degraded mode, embeddings use in-memory storage.

RAG is for engineering knowledge (datasheets, errata, application notes). It is NOT for live pricing, stock, or ordering. Quote source of truth is always the structured supplier adapter output.

## Product Workflow

```
Natural Language Intake
         │
         ▼
Clarifying Question Loop (LLM-assisted)
         │
         ▼
Structured Product Specification
         │
         ▼
Approved Architecture Template Selection
         │
         ▼
Candidate Part Family Selection
         │
         ▼
Official Engineering Document Ingestion
         │
         ▼
Structured Supplier Metadata Resolution
         │
         ▼
RAG-Assisted Engineering Reasoning
         │
         ▼
Full BOM with Alternates (KiCad-ready)
         │
         ▼
KiCad Project Generation
         │
         ▼
ERC/DRC/Export Workflow
         │
         ▼
Preview Asset Generation
         │
         ▼
Downloadable Artifact Generation
         │
         ▼
Raino Rough Quote Generation
         │
         ▼
Optional "Request PCBA Quote from Raino" Handoff
```

## Quote Flow

The quote engine in `services/quote-worker` produces rough cost estimates with three confidence bands.

### Formula

```
subtotal = design_automation_fee
         + engineering_review_fee
         + pcb_fabrication_estimate
         + components_estimate
         + assembly_estimate
         + qa_packaging_handling

mid_quote = subtotal + contingency + margin
low_quote = mid_quote * 0.8
high_quote = mid_quote * 1.25
```

### Confidence Levels

| Level      | Criteria                                                   |
| ---------- | ---------------------------------------------------------- |
| **High**   | All BOM lines have real supplier prices                    |
| **Medium** | 70%+ of lines have real prices, 30% or fewer are estimates |
| **Low**    | More than 30% of lines use estimated prices                |

Every quote includes a full list of assumptions. When any component price comes from fixture data rather than a live supplier query, the quote is clearly flagged as an estimate.

## Getting Started

### Prerequisites

- Node.js >= 20.0.0
- pnpm >= 9.0.0
- Git

### Clone and Install

```bash
git clone https://github.com/tudsds/raino.git
cd raino
pnpm install
```

### Configure Environment

```bash
cp .env.example .env.local
# Edit .env.local with your credentials (see .env.example for all 20 variables)
```

### Run

```bash
pnpm dev
```

Two applications start:

- **Marketing site** at `http://localhost:3000`
- **Product studio** at `http://localhost:3001`

Without any credentials, both apps render their UI in degraded mode. The marketing site works fully since it has no backend dependencies. The studio shows auth prompts but allows browsing.

## Local Development

```bash
# Run specific app
pnpm dev --filter @raino/site
pnpm dev --filter @raino/studio

# Build all
pnpm build

# Type check
pnpm typecheck

# Lint
pnpm lint

# Format
pnpm format
pnpm format:check

# Test
pnpm test
```

## Environment Variables

See `.env.example` for all 20 placeholders. Key variables:

| Variable                               | Purpose                        | Required                   |
| -------------------------------------- | ------------------------------ | -------------------------- |
| `KIMI_API_KEY`                         | Moonshot API key for Kimi K2.5 | No (LLM calls fail)        |
| `NEXT_PUBLIC_SUPABASE_URL`             | Supabase project URL           | No (degraded mode)         |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase anon key              | No (degraded mode)         |
| `SUPABASE_SERVICE_ROLE_KEY`            | Supabase service role key      | No (degraded mode)         |
| `SUPABASE_DB_URL`                      | Prisma connection string       | No (degraded mode)         |
| `DIGIKEY_CLIENT_ID`                    | DigiKey API client ID          | No (fixture mode)          |
| `DIGIKEY_CLIENT_SECRET`                | DigiKey API client secret      | No (fixture mode)          |
| `MOUSER_API_KEY`                       | Mouser API key                 | No (fixture mode)          |
| `JLCPCB_API_KEY`                       | JLCPCB API key                 | No (fixture mode)          |
| `NEXT_PUBLIC_APP_URL`                  | Studio app public URL          | No (defaults to localhost) |

## Testing

Raino enforces strict testing standards:

- Every Zod schema must have both parse-success and parse-failure tests
- The quote engine must have golden-output tests that verify exact numeric results
- The ingestion pipeline must have sufficiency-gate tests that confirm pass/fail behavior
- RAG retrieval must have provenance verification tests
- Failure modes must be tested (hallucinated parts, missing errata, contradictory documents)

```bash
pnpm test           # All tests
pnpm test:unit      # Unit tests only
pnpm test:integration # Integration tests only
pnpm test:e2e       # E2E tests only
```

## Deployment

Raino deploys to Vercel as a monorepo with two separate apps.

### Vercel Projects

| App    | Project ID                         | Root Directory |
| ------ | ---------------------------------- | -------------- |
| Site   | `prj_S21pnUYzOXX7iTDRnFTsJZ6z2YBk` | `apps/site`    |
| Studio | `prj_hDs51OKC5XkyZxH8qsnJmFOkkY40` | `apps/studio`  |

### Steps

1. Push the repository to GitHub
2. Connect each Vercel project to the correct root directory
3. Set environment variables in each Vercel project dashboard
4. Deploy

Every PR gets a preview deployment. Merging to main triggers production deployment.

### Supabase Setup

1. Create a Supabase project
2. Enable Row-Level Security on all tables
3. Configure auth providers (magic link)
4. Enable the pgvector extension
5. Run Prisma migrations
6. Set redirect URLs in Supabase auth settings

## Live Deployments

- **Marketing site**: [raino.site](https://raino.site)
- **Product studio**: [studio.raino.site](https://studio.raino.site)

## Contributing

Contributions are welcome.

1. Fork the repository
2. Create a feature branch from `main`
3. Make your changes with tests
4. Run `pnpm typecheck`, `pnpm lint`, and `pnpm test`
5. Open a pull request

### Code Standards

- TypeScript strict mode. No `as any`, `@ts-ignore`, or `@ts-expect-error`
- No empty catch blocks
- All public functions must have tests
- Never commit credentials or secrets
- Never delete tests to pass builds
- Never simplify user requirements into demos

## No-Fake-Integration Policy

Raino never:

- Fabricates live pricing or stock data
- Claims a live API connection when using fixture data
- Silently downgrades to degraded mode without reporting
- Proceeds past critical ambiguity without user confirmation

Every degraded-mode path is inspectable through the audit trail. Mock adapters are kept as permanent, honest fallbacks.

## Licensing

- **Raino**: MIT License. See [LICENSE](LICENSE).
- **KiCad**: External GPL-licensed tool. Not embedded in Raino.
- **KiCad libraries and generated designs**: May carry different license terms than Raino itself.

---

<p align="center">
  <a href="https://github.com/tudsds/raino">GitHub</a> &middot; MIT License &middot; Built with TypeScript, Next.js 15, Supabase, and KiCad
</p>
