<p align="center">
  <img src="docs/assets/raino-logo.svg" alt="Raino" width="320" />
</p>

<p align="center">
  <strong>From napkin sketch to Gerber files, guided by an agent that knows when to stop.</strong>
</p>

<p align="center">
  <a href="https://github.com/tudsds/raino/stargazers"><img src="https://img.shields.io/github/stars/tudsds/raino?style=social" alt="Stars" /></a>
  <a href="https://github.com/tudsds/raino/forks"><img src="https://img.shields.io/github/forks/tudsds/raino?style=social" alt="Forks" /></a>
  <a href="https://github.com/tudsds/raino/actions"><img src="https://img.shields.io/github/actions/workflow/status/tudsds/raino/ci.yml?branch=main" alt="CI" /></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="License" /></a>
  <a href="https://vercel.com"><img src="https://img.shields.io/badge/deploy-Vercel-black.svg" alt="Deploy" /></a>
</p>

<p align="center">
  <a href="README.md">English</a> &middot; <a href="README.zh-CN.md">中文</a> &middot; <a href="README.ja.md">日本語</a> &middot; <a href="README.ko.md">한국어</a> &middot; <a href="docs/">Docs</a>
</p>

<p align="center">
  🌐 <a href="https://raino-site.vercel.app">Website</a> &middot; <a href="https://raino-site.vercel.app/zh">中文站</a> &middot; <a href="https://raino-site.vercel.app/ja">日本語サイト</a> &middot; <a href="https://raino-site.vercel.app/ko">한국어 사이트</a>
</p>

---

## What is Raino?

You describe a hardware idea in plain language. Raino turns it into a manufacturing-ready PCB bundle: structured spec, validated bill of materials, KiCad schematic and layout, electrical rule checks, and a rough cost quote with confidence bands.

Raino is not a chatbot with a soldering iron. It is a constrained, auditable, source-traceable workflow engine. Every design decision is bounded by approved architecture templates. Every part number traces back to a supplier datasheet or a clearly labeled fixture estimate. Every quote flags which prices are live and which are projected. The system runs formal sufficiency gates before generating any design. When it hits ambiguity it cannot resolve, it stops and asks you.

Think of it as the layer between "I need a motor driver board" and "here are the Gerber files and a BOM you can actually order."

## Why Raino?

Hardware design has a long tail of decisions that do not require a senior engineer but do require consistency. Component selection. Pin compatibility. Supplier cross-referencing. DRC rule compliance. Quote assembly. These are structured problems with structured solutions, and they are exactly the kind of thing an agent system can handle if it is built with the right constraints.

Most AI hardware tools today are either glorified chatbots that hallucinate part numbers, or rigid automation that breaks the moment you deviate from a template. Raino sits in between: it follows a rigorous twelve-stage pipeline, but at every stage it can pause, ask clarifying questions, and incorporate your judgment. The LLM reasons. You decide. The system records both.

### Design Principles

| Principle                | What it means in practice                                                                                      |
| ------------------------ | -------------------------------------------------------------------------------------------------------------- |
| **Constrained autonomy** | The agent operates inside approved architecture templates. It does not invent board topologies.                |
| **Source traceability**  | Every part selection links to a datasheet, a supplier page, or a labeled estimate. No ghost parts.             |
| **Honest degraded mode** | When credentials are missing, the system falls back to fixture data and clearly says so. No silent downgrades. |
| **Sufficiency gates**    | The pipeline does not proceed past a stage until its inputs are complete and consistent.                       |
| **Human in the loop**    | Critical ambiguity stops the workflow. You are the final authority on your own design.                         |

## Features

### Core Workflow

- **Natural language intake** -- Describe your board in plain English. The LLM asks follow-up questions to resolve ambiguity before writing a single line of spec.
- **Structured specification** -- Your answers become a formal, machine-readable product spec with validated parameters.
- **Architecture selection** -- The system matches your requirements against a library of approved circuit architectures.
- **Part family shortlisting** -- Candidate components are selected based on the spec, the architecture, and real supplier availability.
- **Document ingestion** -- Datasheets, errata, and application notes are chunked and indexed for retrieval.
- **RAG-assisted reasoning** -- The LLM reasons over ingested engineering documents to validate part choices against real constraints.
- **BOM assembly** -- A KiCad-ready bill of materials with alternate parts for every line item.
- **KiCad project generation** -- Schematic and layout files produced through the KiCad CLI. No KiCad code is embedded in Raino.
- **ERC/DRC and export** -- Electrical rule checks, design rule checks, and Gerber file generation.
- **Quote generation** -- Rough cost estimates with high, medium, and low confidence bands and a full assumption log.

### Platform Features

- **Two-app architecture** -- A marketing site for discovery and a product studio for design work.
- **iOS 26 Liquid Glass design system** -- Custom React component library with glassmorphism, Noto Serif typography, and fluid animations.
- **Real supplier integration** -- DigiKey, Mouser, and JLCPCB adapters with live pricing, stock, and MOQ data.
- **Mock adapter layer** -- Permanent, honest fallbacks that let the entire system run without any credentials.
- **Audit trail** -- Every workflow decision, part selection, and degraded-mode fallback is logged and inspectable.
- **Magic-link auth** -- Passwordless login through Supabase Auth.
- **Multi-language docs** -- READMEs in English, Chinese, Japanese, and Korean.

## Quick Start

**Prerequisites:** Node.js >= 20, pnpm >= 9, Git

```bash
git clone https://github.com/tudsds/raino.git
cd raino
pnpm install
cp .env.example .env.local    # fill in your credentials
pnpm dev
```

Two apps start on your local machine:

- **Marketing site** at `http://localhost:3000` -- works fully with zero backend dependencies
- **Product studio** at `http://localhost:3001` -- shows auth prompts in degraded mode, allows browsing

Without any credentials, both apps render in degraded mode. The system never pretends to have data it does not. See [Degraded Mode](#degraded-mode) for details.

### Development Commands

```bash
pnpm dev                            # Run all apps in dev mode
pnpm dev --filter @raino/site       # Marketing site only
pnpm dev --filter @raino/studio     # Product studio only
pnpm build                          # Build all packages and apps
pnpm typecheck                      # Type check everything
pnpm lint                           # Lint everything
pnpm test                           # Run all tests
pnpm test:unit                      # Unit tests only
pnpm test:integration               # Integration tests only
pnpm test:e2e                       # End-to-end tests only
```

## The Workflow Pipeline

Raino guides a hardware project through twelve stages. Each stage has a formal sufficiency gate. The pipeline does not advance until the current stage's inputs are complete, consistent, and approved.

![Pipeline](docs/assets/architecture-pipeline.svg)

1. **Natural Language Intake** -- You describe what you want to build in plain English.
2. **Clarifying Question Loop** -- The LLM asks follow-up questions to pin down requirements.
3. **Structured Product Specification** -- Your answers become a formal spec document.
4. **Architecture Template Selection** -- The system picks an approved architecture matching your requirements.
5. **Candidate Part Family Selection** -- Part families are shortlisted based on the spec and architecture.
6. **Engineering Document Ingestion** -- Datasheets, errata, and application notes are ingested and chunked.
7. **Supplier Metadata Resolution** -- Real pricing, stock, and MOQ data from DigiKey, Mouser, and JLCPCB.
8. **RAG-Assisted Engineering Reasoning** -- The system reasons over ingested documents to validate part choices.
9. **Full BOM with Alternates** -- A KiCad-ready bill of materials with alternates for every line.
10. **KiCad Project Generation** -- Schematic and layout files produced via the KiCad CLI.
11. **ERC/DRC/Export** -- Electrical rule checks, design rule checks, and Gerber/export generation.
12. **Quote Generation and Handoff** -- A rough cost quote with an optional request for a full PCBA quote.

### Quote Confidence

The quote engine produces cost estimates with three confidence bands:

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

## Architecture

![Architecture](docs/assets/architecture-overview.svg)

### Architectural Boundaries

**KiCad** is an external GPL-licensed tool. Raino communicates with it through CLI commands only. No KiCad source code is embedded in this repository. Generated KiCad projects and library files may carry different license terms.

**Supplier adapters** (DigiKey, Mouser, JLCPCB) use the Interface + Adapter pattern with a factory for runtime selection. When credentials are missing, mock adapters provide fixture data. The mock layer is a permanent part of the codebase, not a temporary hack.

**RAG** handles engineering knowledge retrieval: datasheets, errata, application notes. It is explicitly not used for live pricing or stock lookups. The quote source of truth is always the structured supplier adapter output.

**Persistence** uses Prisma ORM against Supabase Postgres with Row-Level Security. The `@raino/db` package exports server, browser, and middleware Supabase clients.

**Auth** uses Supabase magic link. The middleware refreshes session cookies on every request.

**LLM gateway** (`@raino/llm`) wraps the OpenAI SDK pointed at Moonshot's API (Kimi K2.5), with exponential backoff retry and Zod-validated structured output.

For full architectural documentation, see `docs/architecture/`.

## Tech Stack

| Layer         | Technology                                              |
| ------------- | ------------------------------------------------------- |
| Frontend      | Next.js 15, React 19, Tailwind CSS v4                   |
| Design System | @raino/ui (iOS 26 Liquid Glass, Noto Serif) |
| Backend       | Next.js Route Handlers, Server Actions, Supabase        |
| Database      | Supabase Postgres, Prisma ORM, pgvector                 |
| Auth          | Supabase Auth (magic link)                              |
| Storage       | Supabase Storage                                        |
| LLM           | Kimi K2.5 via OpenAI SDK (moonshot.ai)                  |
| Validation    | Zod                                                     |
| Testing       | Vitest, Playwright                                      |
| Build         | Turborepo, pnpm workspaces                              |
| Deploy        | Vercel (monorepo, two apps)                             |
| EDA           | KiCad CLI (external GPL boundary)                       |
| Suppliers     | DigiKey, Mouser, JLCPCB (adapter interfaces)            |

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
│   ├── ui/                  # iOS 26 Liquid Glass design system
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
└── tests/                   # Integration and e2e tests
```

## Packages and Services

| Name                         | Purpose                                                | Location                       |
| ---------------------------- | ------------------------------------------------------ | ------------------------------ |
| `@raino/site`                | Marketing website                                      | `apps/site`                    |
| `@raino/studio`              | Product app: auth, intake, spec, BOM, previews, quotes | `apps/studio`                  |
| `@raino/core`                | Zod schemas, validation, quote engine, domain types    | `packages/core`                |
| `@raino/db`                  | Prisma ORM, Supabase auth/storage/pgvector clients     | `packages/db`                  |
| `@raino/llm`                 | Kimi K2.5 gateway, structured output, retry logic      | `packages/llm`                 |
| `@raino/rag`                 | Engineering-aware chunking, pgvector retrieval         | `packages/rag`                 |
| `@raino/agents`              | Workflow state machine, agent prompts, orchestration   | `packages/agents`              |
| `@raino/ui`                  | iOS 26 Liquid Glass design system                     | `packages/ui`                  |
| `@raino/kicad-worker-client` | KiCad CLI command contracts, job types                 | `packages/kicad-worker-client` |
| `@raino/supplier-clients`    | DigiKey, Mouser, JLCPCB adapter interfaces + factory   | `packages/supplier-clients`    |
| `ingest-worker`              | 8-stage document ingestion pipeline                    | `services/ingest-worker`       |
| `design-worker`              | KiCad project generation and export                    | `services/design-worker`       |
| `quote-worker`               | Rough quote calculation with confidence bands          | `services/quote-worker`        |
| `audit-worker`               | Audit trail, artifact manifests, provenance            | `services/audit-worker`        |

## Environment Variables

See `.env.example` for all 22 placeholders. The app runs in degraded or fixture mode without credentials. No single variable is required for the app to start.

| Variable                        | Purpose                                | Fallback                       |
| ------------------------------- | -------------------------------------- | ------------------------------ |
| `KIMI_API_KEY`                  | Moonshot API key for Kimi K2.5         | LLM calls fail gracefully      |
| `NEXT_PUBLIC_SUPABASE_URL`      | Supabase project URL                   | Degraded mode (no persistence) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key                      | Degraded mode                  |
| `SUPABASE_SERVICE_ROLE_KEY`     | Supabase service role key              | Degraded mode                  |
| `DATABASE_URL`                  | Prisma connection string               | Degraded mode                  |
| `DIGIKEY_CLIENT_ID`             | DigiKey API client ID                  | Fixture mode                   |
| `DIGIKEY_CLIENT_SECRET`         | DigiKey API client secret              | Fixture mode                   |
| `MOUSER_API_KEY`                | Mouser API key                         | Fixture mode                   |
| `JLCPCB_APP_ID`                 | JLCPCB API app ID                      | Fixture mode                   |
| `JLCPCB_ACCESS_KEY`             | JLCPCB API access key                  | Fixture mode                   |
| `JLCPCB_SECRET_KEY`             | JLCPCB API secret key                  | Fixture mode                   |
| `EMBEDDING_PROVIDER`            | Embedding backend ("openai" or "mock") | Defaults to "mock"             |
| `OPENAI_API_KEY`                | OpenAI key for embeddings              | Mock embeddings                |
| `KICAD_CLI_PATH`                | Path to KiCad CLI binary               | KiCad generation skipped       |

## Deployment

Raino deploys to Vercel as a monorepo with two apps.

| App    | Root Directory | URL                                                        |
| ------ | -------------- | ---------------------------------------------------------- |
| Site   | `apps/site`    | [raino-site.vercel.app](https://raino-site.vercel.app)     |
| Studio | `apps/studio`  | [raino-studio.vercel.app](https://raino-studio.vercel.app) |

**Steps:**

1. Push the repository to GitHub
2. Connect each Vercel project to the correct root directory
3. Set environment variables in each Vercel project dashboard
4. Deploy

Every pull request gets a preview deployment. Merging to main triggers production.

**Supabase setup:** Create a project, enable RLS on all tables, configure magic-link auth, enable the pgvector extension, run Prisma migrations, and set redirect URLs. See `docs/deployment/` for the full guide.

## Degraded Mode

Raino is designed to run without credentials. When keys are missing, it falls back to mock adapters and fixture data, and it labels every fallback clearly. You never have to guess whether the data you are looking at is live or synthetic.

| Missing Credential   | What Still Works                | What Falls Back                    |
| -------------------- | ------------------------------- | ---------------------------------- |
| Supabase credentials | Static pages, UI rendering      | Auth, project persistence, RAG     |
| `KIMI_API_KEY`       | Everything except LLM calls     | Natural language intake, reasoning |
| Supplier API keys    | All design workflow steps       | Live pricing, stock, MOQ data      |
| KiCad CLI            | Project management, BOM, quotes | Actual KiCad project generation    |

Mock adapters and fixture data are permanent parts of the codebase. They exist so the system is always inspectable and testable without live credentials. They are not temporary scaffolding.

## No-Fake-Integration Policy

This is worth calling out explicitly because it shapes every design decision in the project.

Raino never fabricates live pricing or stock data. It never claims a live API connection when using fixture data. It never silently downgrades to degraded mode without reporting it. And it never proceeds past critical ambiguity without user confirmation.

Every degraded-mode path is inspectable through the audit trail. Every fixture price is labeled as an estimate. Every mock adapter is a permanent, honest fallback, not a placeholder waiting to be replaced.

## Testing

```bash
pnpm test             # All tests
pnpm test:unit        # Unit tests only
pnpm test:integration # Integration tests only
pnpm test:e2e         # End-to-end tests only
```

### Testing Requirements

- Every Zod schema must have parse-success and parse-failure tests
- The quote engine must have golden-output tests verifying exact numeric results
- The ingestion pipeline must have sufficiency-gate tests confirming pass/fail behavior
- RAG retrieval must have provenance verification tests
- Failure modes must be tested: hallucinated parts, missing errata, contradictory documents

### Code Standards

TypeScript strict mode is enforced across the entire monorepo. The following are hard bans:

- No `as any`, `@ts-ignore`, or `@ts-expect-error`
- No empty catch blocks
- No committed credentials or API keys
- No deleted tests to pass builds
- No simplifying user requirements into demo-friendly shortcuts

## Contributing

Contributions are welcome. Here is the process:

1. Fork the repository
2. Create a feature branch from `main`
3. Make your changes with tests
4. Run `pnpm typecheck`, `pnpm lint`, and `pnpm test`
5. Open a pull request

If you are adding a new supplier adapter, a new architecture template, or a new workflow stage, open an issue first to discuss the approach. The constraint model matters, and we would rather align on boundaries before you write code.

## License

- **Raino**: MIT License. See [LICENSE](LICENSE). Copyright (c) 2024 Raino Contributors.
- **KiCad**: External GPL-licensed tool. Not embedded in Raino. KiCad libraries and generated designs may carry different license terms.
- Third-party attributions and notices: see [NOTICES.md](NOTICES.md).

## Acknowledgements

See [NOTICES.md](NOTICES.md) for third-party attributions and licence information.

---

<p align="center">
  <strong>Raino</strong> -- constrained autonomy for hardware design
</p>
<p align="center">
  <a href="https://github.com/tudsds/raino">GitHub</a> &middot; <a href="https://raino-site.vercel.app">Live Site</a> &middot; <a href="https://raino-studio.vercel.app">Studio</a> &middot; MIT License
</p>
