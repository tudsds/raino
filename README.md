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

Raino turns a vague hardware idea into a manufacturing-ready PCB bundle. You describe what you want in plain language, and the system walks you through a structured workflow: refining the spec, picking parts from real suppliers, generating a KiCad project, and producing a rough cost quote.

It is not a chatbot or an unconstrained autopilot. Every design decision is bounded by approved architecture templates. Every part selection is traceable to its source. Every quote clearly marks which prices came from live supplier data and which came from fixture estimates. The system runs formal sufficiency gates before generating any design, and it stops to ask for your input when it hits ambiguity it cannot resolve on its own.

The platform runs on two frontend apps, eight shared packages, and four worker services. Supabase handles persistence, auth, and vector storage. Kimi K2.5 handles LLM reasoning. Everything is MIT-licensed and open source.

## Quick Start

**Prerequisites:** Node.js >= 20, pnpm >= 9, Git

```bash
git clone https://github.com/tudsds/raino.git
cd raino
pnpm install
cp .env.example .env.local    # edit with your credentials
pnpm dev
```

Two apps start:

- **Marketing site** at `http://localhost:3000`
- **Product studio** at `http://localhost:3001`

Without any credentials both apps render in degraded mode. The marketing site works fully since it has no backend dependencies. The studio shows auth prompts but allows browsing.

**Local development commands:**

```bash
pnpm dev --filter @raino/site      # Run marketing site only
pnpm dev --filter @raino/studio    # Run product studio only
pnpm build                         # Build all packages and apps
pnpm typecheck                     # Type check all
pnpm lint                          # Lint all
pnpm test                          # Run all tests
```

See [Environment Variables](#environment-variables) below for what each credential controls, or consult `.env.example` for all 20 placeholders.

## The Workflow

Raino guides a hardware project through twelve stages from idea to handoff:

1. **Natural Language Intake** -- You describe what you want to build in plain English.
2. **Clarifying Question Loop** -- The LLM asks follow-up questions to resolve ambiguity.
3. **Structured Product Specification** -- Your answers become a formal spec document.
4. **Architecture Template Selection** -- The system picks an approved architecture matching your requirements.
5. **Candidate Part Family Selection** -- Part families are shortlisted based on the spec and architecture.
6. **Engineering Document Ingestion** -- Datasheets, errata, and application notes are ingested and chunked.
7. **Supplier Metadata Resolution** -- Real pricing, stock, and MOQ data are pulled from DigiKey, Mouser, and JLCPCB.
8. **RAG-Assisted Engineering Reasoning** -- The system reasons over ingested documents to validate part choices.
9. **Full BOM with Alternates** -- A KiCad-ready bill of materials is assembled, with alternates for every line.
10. **KiCad Project Generation** -- Schematic and layout files are produced via the KiCad CLI.
11. **ERC/DRC/Export** -- Electrical rule checks, design rule checks, and Gerber/export generation.
12. **Quote Generation and Handoff** -- A rough cost quote is produced, with an optional request for a full PCBA quote.

### Quote Confidence

The quote engine produces rough cost estimates with three confidence bands:

| Level      | Criteria                                                   |
| ---------- | ---------------------------------------------------------- |
| **High**   | All BOM lines have real supplier prices                    |
| **Medium** | 70%+ of lines have real prices, 30% or fewer are estimates |
| **Low**    | More than 30% of lines use estimated prices                |

```
subtotal = design_automation_fee
         + engineering_review_fee
         + pcb_fabrication_estimate
         + components_estimate
         + assembly_estimate
         + qa_packaging_handling

mid_quote  = subtotal + contingency + margin
low_quote  = mid_quote * 0.8
high_quote = mid_quote * 1.25
```

Every quote includes a full list of assumptions. When any component price comes from fixture data rather than a live supplier query, the quote is clearly flagged as an estimate.

## Architecture at a Glance

```
┌─────────────────────────────────────────────────────────────┐
│                        Users                                 │
│                                                              │
│  ┌──────────────┐              ┌──────────────────────┐      │
│  │  apps/site   │              │    apps/studio       │      │
│  │  Marketing   │───CTA──────▶│    Product App       │      │
│  │  raino-site │              │    raino-studio      │      │
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

Key architectural boundaries:

- **KiCad** is an external GPL-licensed tool. Raino communicates through CLI commands only; no KiCad code is embedded.
- **Supplier adapters** (DigiKey, Mouser, JLCPCB) use the Interface + Adapter pattern with a factory for runtime selection. Mock adapters are used when credentials are missing.
- **RAG** handles engineering knowledge retrieval (datasheets, errata, app notes). It is not used for live pricing or stock. Quote source of truth is always the structured supplier adapter output.
- **Persistence** uses Prisma ORM against Supabase Postgres with Row-Level Security. The `@raino/db` package exports server, browser, and middleware Supabase clients.
- **Auth** uses Supabase magic link. The middleware refreshes session cookies on every request.
- **LLM gateway** (`@raino/llm`) wraps the OpenAI SDK pointed at Moonshot's API, with exponential backoff retry and Zod-validated structured output.

For full details, see `docs/architecture/`.

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

## Project Structure

```
raino/
├── apps/
│   ├── site/                # Next.js 15 marketing site (port 3000)
│   └── studio/              # Next.js 15 product app (port 3001)
├── packages/
│   ├── core/                # Zod schemas, validation, domain logic
│   ├── db/                  # Prisma ORM + Supabase clients
│   ├── llm/                 # Kimi K2.5 model gateway
│   ├── rag/                 # Chunking, embeddings, pgvector retrieval
│   ├── agents/              # Workflow state machine, orchestration
│   ├── ui/                  # Pixel-art cyberpunk design system
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

## Packages & Services

| Name                         | Purpose                                                | Location                       |
| ---------------------------- | ------------------------------------------------------ | ------------------------------ |
| `@raino/site`                | Marketing website                                      | `apps/site`                    |
| `@raino/studio`              | Product app: auth, intake, spec, BOM, previews, quotes | `apps/studio`                  |
| `@raino/core`                | Zod schemas, validation, quote engine, domain types    | `packages/core`                |
| `@raino/db`                  | Prisma ORM, Supabase auth/storage/pgvector clients     | `packages/db`                  |
| `@raino/llm`                 | Kimi K2.5 gateway, structured output, retry logic      | `packages/llm`                 |
| `@raino/rag`                 | Engineering-aware chunking, pgvector retrieval         | `packages/rag`                 |
| `@raino/agents`              | Workflow state machine, agent prompts, orchestration   | `packages/agents`              |
| `@raino/ui`                  | Pixel-art cyberpunk design system                      | `packages/ui`                  |
| `@raino/kicad-worker-client` | KiCad CLI command contracts, job types                 | `packages/kicad-worker-client` |
| `@raino/supplier-clients`    | DigiKey, Mouser, JLCPCB adapter interfaces + factory   | `packages/supplier-clients`    |
| `ingest-worker`              | 8-stage document ingestion pipeline                    | `services/ingest-worker`       |
| `design-worker`              | KiCad project generation and export                    | `services/design-worker`       |
| `quote-worker`               | Rough quote calculation with confidence bands          | `services/quote-worker`        |
| `audit-worker`               | Audit trail, artifact manifests, provenance            | `services/audit-worker`        |

## Environment Variables

See `.env.example` for all 20 placeholders. Key variables:

| Variable                               | Purpose                        | Required                   |
| -------------------------------------- | ------------------------------ | -------------------------- |
| `KIMI_API_KEY`                         | Moonshot API key for Kimi K2.5 | No (LLM calls fail)        |
| `NEXT_PUBLIC_SUPABASE_URL`             | Supabase project URL           | No (degraded mode)         |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase anon key              | No (degraded mode)         |
| `SUPABASE_SERVICE_ROLE_KEY`            | Supabase service role key      | No (degraded mode)         |
| `DATABASE_URL`                         | Prisma connection string       | No (degraded mode)         |
| `DIGIKEY_CLIENT_ID`                    | DigiKey API client ID          | No (fixture mode)          |
| `DIGIKEY_CLIENT_SECRET`                | DigiKey API client secret      | No (fixture mode)          |
| `MOUSER_API_KEY`                       | Mouser API key                 | No (fixture mode)          |
| `JLCPCB_APP_ID`                        | JLCPCB API app ID              | No (fixture mode)          |
| `JLCPCB_ACCESS_KEY`                    | JLCPCB API access key          | No (fixture mode)          |
| `JLCPCB_SECRET_KEY`                    | JLCPCB API secret key          | No (fixture mode)          |
| `NEXT_PUBLIC_APP_URL`                  | Studio app public URL          | No (defaults to localhost) |

## Deployment

Raino deploys to Vercel as a monorepo with two apps.

| App    | Root Directory | Preview/Production                                         |
| ------ | -------------- | ---------------------------------------------------------- |
| Site   | `apps/site`    | [raino-site.vercel.app](https://raino-site.vercel.app)     |
| Studio | `apps/studio`  | [raino-studio.vercel.app](https://raino-studio.vercel.app) |

**Steps:**

1. Push the repository to GitHub
2. Connect each Vercel project to the correct root directory
3. Set environment variables in each Vercel project dashboard
4. Deploy

Every PR gets a preview deployment. Merging to main triggers production.

**Supabase setup:** Create a project, enable RLS on all tables, configure magic-link auth, enable the pgvector extension, run Prisma migrations, and set redirect URLs. See `docs/deployment/` for the full guide.

## Degraded Mode

Raino runs in degraded mode when credentials are missing. The app labels every degraded path clearly.

| Missing Credential                          | What Still Works                | What Falls Back                    |
| ------------------------------------------- | ------------------------------- | ---------------------------------- |
| Supabase credentials                        | Static pages, UI rendering      | Auth, project persistence, RAG     |
| `KIMI_API_KEY`                              | Everything except LLM calls     | Natural language intake, reasoning |
| Supplier API keys (DigiKey, Mouser, JLCPCB) | All design workflow steps       | Live pricing, stock, MOQ data      |
| KiCad CLI                                   | Project management, BOM, quotes | Actual KiCad project generation    |

Mock adapters and fixture data are permanent parts of the codebase, not temporary hacks. They exist so the system is always inspectable and testable without live credentials.

## No-Fake-Integration Policy

Raino never fabricates live pricing or stock data. It never claims a live API connection when using fixture data. It never silently downgrades to degraded mode without reporting it. And it never proceeds past critical ambiguity without user confirmation.

Every degraded-mode path is inspectable through the audit trail. Mock adapters are permanent, honest fallbacks.

## Testing

```bash
pnpm test             # All tests
pnpm test:unit        # Unit tests only
pnpm test:integration # Integration tests only
pnpm test:e2e         # E2e tests only
```

Testing requirements:

- Every Zod schema must have parse-success and parse-failure tests
- The quote engine must have golden-output tests verifying exact numeric results
- The ingestion pipeline must have sufficiency-gate tests confirming pass/fail behavior
- RAG retrieval must have provenance verification tests
- Failure modes must be tested (hallucinated parts, missing errata, contradictory documents)

## Contributing

1. Fork the repository
2. Create a feature branch from `main`
3. Make your changes with tests
4. Run `pnpm typecheck`, `pnpm lint`, and `pnpm test`
5. Open a pull request

Code standards: TypeScript strict mode, no `as any` / `@ts-ignore` / `@ts-expect-error`, no empty catch blocks, no committed credentials, no deleted tests to pass builds, no simplifying user requirements into demos.

## License

- **Raino**: MIT License. See [LICENSE](LICENSE).
- **KiCad**: External GPL-licensed tool. Not embedded in Raino.
- **KiCad libraries and generated designs**: May carry different license terms than Raino itself.

---

<p align="center">
  <a href="https://github.com/tudsds/raino">GitHub</a> &middot; MIT License &middot; Built with TypeScript, Next.js 15, Supabase, and KiCad
</p>
