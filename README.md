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

The platform consists of a marketing site, a product studio application, a RAG (retrieval-augmented generation) pipeline for engineering knowledge, a quote engine, an audit trail system, and adapters for external suppliers and the KiCad EDA tool. All of it is open source under the MIT license.

## Why Raino?

Designing a PCB is not a single step. It is a long workflow that starts with a vague idea and ends with Gerber files, a bill of materials, and a manufacturing handoff. Along the way you need to select components, verify pin compatibility, check errata, resolve footprint conflicts, run electrical rule checks, and get cost estimates from suppliers. Each step has room for error, and errors in hardware are expensive to fix.

Most existing tools treat these steps as separate problems. EDA tools handle layout but not sourcing. Supplier search tools handle pricing but not design rules. Chat-based assistants can suggest parts but cannot validate them against a real schematic. Raino ties the entire workflow together under one roof with formal checkpoints, provenance tracking, and a no-fake-data policy. It never fabricates a part number, never claims a live price when it is using an estimate, and never proceeds past a critical ambiguity without stopping to ask.

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
│                              API Routes │                     │
│                                       ▼                      │
│  ┌─────────────────────────────────────────────────────┐     │
│  │                 packages/core                         │     │
│  │  Schemas · Validation · Quote Engine · Domain Logic   │     │
│  └──┬──────────┬──────────┬──────────┬──────────┬───────┘    │
│     │          │          │          │          │             │
│  packages/  packages/  packages/  packages/  packages/        │
│  agents      rag     kicad-w-c  supplier-c  ui               │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐     │
│  │                 Worker Services                        │     │
│  │  ingest-worker · design-worker · quote-worker · audit  │     │
│  └─────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

### Product Workflow

```
Natural Language Intake
         │
         ▼
Clarifying Question Loop
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

## Repository Structure

```
raino/
├── apps/
│   ├── site/                # Next.js marketing site (port 3000)
│   └── studio/              # Next.js product application (port 3001)
├── packages/
│   ├── core/                # Zod schemas, validation, domain logic
│   ├── rag/                 # Chunking, embeddings, retrieval
│   ├── agents/              # Workflow contracts, orchestration
│   ├── ui/                  # Cyberpunk design system (React + Tailwind)
│   ├── kicad-worker-client/ # KiCad CLI contracts and client interface
│   └── supplier-clients/    # Supplier adapter interfaces
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
├── package.json             # Root package configuration
├── pnpm-workspace.yaml      # Monorepo workspace definition
├── turbo.json               # Turborepo task configuration
├── tsconfig.json            # Root TypeScript configuration
└── vercel.json              # Vercel deployment configuration
```

## Major Packages and Services

| Name                         | Purpose                                                      | Location                       |
| ---------------------------- | ------------------------------------------------------------ | ------------------------------ |
| `@raino/site`                | Marketing website with hero, features, architecture overview | `apps/site`                    |
| `@raino/studio`              | Product application: intake, spec, BOM, previews, quotes     | `apps/studio`                  |
| `@raino/core`                | Zod schemas, validation, quote engine, domain types          | `packages/core`                |
| `@raino/rag`                 | Engineering-aware chunking, embedding contracts, retrieval   | `packages/rag`                 |
| `@raino/agents`              | Workflow state machine, agent prompts, orchestration         | `packages/agents`              |
| `@raino/ui`                  | Shared React component library, cyberpunk theme              | `packages/ui`                  |
| `@raino/kicad-worker-client` | KiCad CLI command contracts, job types                       | `packages/kicad-worker-client` |
| `@raino/supplier-clients`    | DigiKey, Mouser, JLCPCB adapter interfaces                   | `packages/supplier-clients`    |
| `ingest-worker`              | 8-stage document ingestion pipeline                          | `services/ingest-worker`       |
| `design-worker`              | KiCad project generation and export                          | `services/design-worker`       |
| `quote-worker`               | Rough quote calculation with confidence bands                | `services/quote-worker`        |
| `audit-worker`               | Audit trail, artifact manifests, provenance tracking         | `services/audit-worker`        |

## Outside APIs and Boundaries

Raino interacts with several external systems. Each is treated as a strict boundary with defined contracts.

### KiCad (GPL Boundary)

KiCad is an external GPL-licensed EDA tool. Raino does not embed KiCad code. Communication happens through CLI commands (`kicad-cli`) defined in `packages/kicad-worker-client`. Generated KiCad designs and KiCad library files may carry different license considerations than Raino itself.

### Supplier Adapters

Raino defines adapter interfaces for DigiKey, Mouser, and JLCPCB in `packages/supplier-clients`. These use the Interface + Adapter pattern. No live API credentials are assumed. When credentials are missing, the system runs in fixture mode with clearly labeled estimates.

### RAG Boundaries

The RAG system in `packages/rag` handles embedding and retrieval for engineering documents. It connects to embedding services via a pluggable interface. In fixture mode, embeddings use in-memory storage.

## RAG Scope and Non-Scope

### What RAG is for

- Datasheets and component specifications
- Errata documents from manufacturers
- Application notes and reference designs
- Package outlines and land patterns
- Engineering knowledge retrieval for design decisions

### What RAG is NOT for

- Live pricing data
- Stock availability
- Minimum order quantities
- Order placement
- Any data that changes faster than document ingestion can keep up with

Live pricing, stock, and ordering are handled exclusively by supplier adapters. Quote source of truth is always the structured supplier adapter output, never RAG retrieval.

## Sufficiency Gate

Before Raino generates any design, it runs a formal sufficiency check. This gate verifies that all required data is present and consistent. The check includes:

- Official datasheet exists for each candidate part
- Errata exists if the vendor publishes errata
- Application notes exist for complex parts
- Package and land pattern documentation is available
- Structured procurement fields are populated
- Footprint mapping exists for each BOM line
- Alternates exist for all non-custom parts
- No unresolved contradictions across documents
- No critical placeholders remain

If the sufficiency gate fails, Raino reports specific gaps and does not proceed to design generation. The user must resolve the gaps or explicitly accept the risk before continuing.

## KiCad Worker Boundary

Raino uses KiCad as an external worker, not an embedded dependency. The boundary works as follows:

1. `packages/kicad-worker-client` defines CLI command contracts and job types
2. `services/design-worker` sends jobs to the KiCad CLI
3. KiCad generates `.kicad_pro`, `.kicad_sch`, `.kicad_pcb`, and export files
4. Raino validates outputs with ERC (electrical rule check) and DRC (design rule check)
5. Preview assets (SVG, PDF, GLB) are generated from the KiCad outputs

No KiCad source code is included in the Raino repository. KiCad libraries and generated designs have their own license terms separate from Raino's MIT license.

## Preview and Download Flows

After a design passes validation, Raino generates several preview and download artifacts:

| Artifact             | Format    | Description                               |
| -------------------- | --------- | ----------------------------------------- |
| Schematic preview    | SVG, PDF  | Circuit schematic rendering               |
| PCB 2D preview       | SVG       | Top and bottom copper layer views         |
| PCB 3D preview       | GLB       | Interactive 3D board model                |
| BOM export           | CSV, JSON | Full bill of materials with alternates    |
| Gerber files         | RS-274X   | Manufacturing-ready PCB files             |
| Manufacturing bundle | ZIP       | Gerbers, BOM, pick-and-place, drill files |

All artifacts carry checksums and provenance metadata in their manifests.

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

### Fee Components

| Component               | Default Value                        |
| ----------------------- | ------------------------------------ |
| Design automation fee   | $500                                 |
| Engineering review fee  | $300                                 |
| PCB fabrication         | $0.10 per cm² (estimated board area) |
| Assembly                | $0.05 per component placement        |
| QA, packaging, handling | $100 base + $0.50 per unit           |
| Contingency             | 10% of subtotal                      |
| Margin                  | 15% of (subtotal + contingency)      |

### Confidence Levels

| Level      | Criteria                                                   |
| ---------- | ---------------------------------------------------------- |
| **High**   | All BOM lines have real supplier prices                    |
| **Medium** | 70%+ of lines have real prices, 30% or fewer are estimates |
| **Low**    | More than 30% of lines use estimated prices                |

Every quote includes a full list of assumptions. When any component price comes from fixture data rather than a live supplier query, the quote is clearly flagged as an estimate.

## Raino Handoff Flow

After a rough quote is generated, users can optionally request a PCBA (printed circuit board assembly) quote from Raino. This handoff flow:

1. User reviews the rough quote and assumptions
2. User clicks "Request PCBA Quote from Raino"
3. Raino submits an order intent with the quote ID and desired quantity
4. A handoff record is created with status tracking
5. The user receives confirmation and can track progress

This is an optional step. Users can download all manufacturing artifacts and work with any fabricator they choose.

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
pnpm dev
```

### What Runs

After `pnpm dev`, two applications start:

- **Marketing site** at `http://localhost:3000`
- **Product studio** at `http://localhost:3001`

No supplier API keys are required for initial setup. Without keys, the system runs in fixture mode with labeled estimates.

## Local Development

### Running Individual Apps

```bash
# Marketing site only
pnpm dev --filter @raino/site

# Product studio only
pnpm dev --filter @raino/studio
```

### Building

```bash
# Build all packages and apps
pnpm build

# Build a specific package
pnpm build --filter @raino/core
```

### Type Checking

```bash
pnpm typecheck
```

### Linting

```bash
pnpm lint
```

### Formatting

```bash
pnpm format        # Write changes
pnpm format:check  # Check only
```

## Environment Variables

| Variable                | Description                | Required                  |
| ----------------------- | -------------------------- | ------------------------- |
| `DIGIKEY_CLIENT_ID`     | DigiKey API client ID      | No (fixture mode without) |
| `DIGIKEY_CLIENT_SECRET` | DigiKey API client secret  | No (fixture mode without) |
| `MOUSER_API_KEY`        | Mouser API key             | No (fixture mode without) |
| `JLCPCB_API_KEY`        | JLCPCB API key             | No (fixture mode without) |
| `EMBEDDING_API_KEY`     | Embedding service API key  | No (mock mode without)    |
| `EMBEDDING_MODEL`       | Embedding model identifier | No (mock mode without)    |
| `NEXTAUTH_SECRET`       | NextAuth.js session secret | No (open for dev)         |
| `NEXTAUTH_URL`          | NextAuth.js callback URL   | No (open for dev)         |

Without supplier API keys, Raino uses fixture data for component pricing. All fixture-derived values are labeled as estimates in the UI and audit trail. The system never claims a live connection when it is using fixtures.

## Testing and Auditing

### Test Commands

```bash
# Run all tests
pnpm test

# Unit tests only
pnpm test:unit

# Integration tests only
pnpm test:integration

# End-to-end tests only
pnpm test:e2e
```

### Test Requirements

Raino enforces strict testing standards:

- Every Zod schema must have both parse-success and parse-failure tests
- The quote engine must have golden-output tests that verify exact numeric results
- The ingestion pipeline must have sufficiency-gate tests that confirm pass/fail behavior
- RAG retrieval must have provenance verification tests that confirm source attribution
- Failure modes must be tested, including hallucinated parts, missing errata, and contradictory documents

### Audit Trail

Every significant action is logged by the audit worker. The trail covers:

- BOM decisions with source provenance
- Part selection rationale
- Artifact manifests with checksums
- Quote assumptions and confidence levels
- Policy violation flags

Audit trails are inspectable through the API at `GET /api/projects/:id/audit`.

## Deployment

Raino is designed for Vercel deployment with Turborepo build orchestration.

### Steps

1. Fork or push the repository to GitHub
2. Connect the GitHub repository to Vercel
3. Set the root directory to `/` (monorepo root)
4. Vercel auto-detects the Next.js apps from `vercel.json`
5. Set environment variables in the Vercel dashboard
6. Deploy

### Preview and Production

- Every pull request gets an automatic preview deployment
- Merging to the main branch triggers a production deployment

### Build Configuration

The root `vercel.json` specifies:

- `buildCommand`: `pnpm build`
- `installCommand`: `pnpm install`
- Turborepo handles internal build ordering

## Roadmap

- User authentication and project ownership
- Live supplier API integration (DigiKey, Mouser, JLCPCB)
- Production vector database for RAG
- Collaborative editing with multi-user sessions
- Version control for designs (diff, branch, merge)
- Expanded architecture template library
- IPC-2581 and ODB++ export formats
- Design rule customization per manufacturer
- Automated DFM (design for manufacturing) checks
- Real-time pricing alerts when supplier stock changes
- Component lifecycle and obsolescence tracking
- Multi-language UI (zh-CN, ja, ko)

## Contributing

Contributions are welcome. To contribute:

1. Fork the repository
2. Create a feature branch from `main`
3. Make your changes with tests
4. Run `pnpm typecheck`, `pnpm lint`, and `pnpm test` to verify
5. Open a pull request with a clear description

### Code Standards

- TypeScript strict mode. No `as any`, `@ts-ignore`, or `@ts-expect-error`
- No empty catch blocks
- All public functions must have tests
- Follow the existing project structure and patterns
- Commit messages should be clear and describe the change

### Anti-Patterns to Avoid

- Deleting tests to pass builds
- Simplifying user requirements into demos
- Adding features without corresponding tests
- Committing credentials or secrets

## FAQ

**Is Raino a chatbot?**

No. Raino is a structured workflow system with a natural language intake step. It uses constrained agents with formal state machines, sufficiency gates, and audit trails. It does not generate open-ended responses or make unvalidated design decisions.

**Do I need KiCad installed to use Raino?**

For local development without design generation, no. To generate actual KiCad projects, you need KiCad installed with `kicad-cli` available on your PATH. Without KiCad, the design worker runs in mock mode.

**How accurate are the quotes?**

Quotes are rough estimates. Accuracy depends on the confidence level. "High" confidence means most prices come from live supplier data. "Low" confidence means most prices are fixture estimates. Every quote includes a detailed assumptions list so you can judge for yourself.

**Can I use my own supplier instead of Raino's handoff?**

Yes. All manufacturing artifacts (Gerbers, BOM, pick-and-place files) are available for download. You can send them to any PCB fabricator or assembler.

**What happens when a supplier API is unavailable?**

Raino falls back to fixture mode and clearly labels all affected data as estimates. It never silently degrades. The audit trail records exactly which data came from fixtures and when.

**Does Raino work for analog designs, or just digital?**

Raino supports any design that fits within its architecture template system. The current bootstrap focuses on common digital board architectures, but the template system is extensible to analog and mixed-signal designs.

**How is Raino different from just using ChatGPT to design a PCB?**

ChatGPT can suggest parts and explain concepts, but it cannot run ERC/DRC, generate KiCad projects, query live supplier pricing, or maintain a traceable audit trail. Raino combines LLM reasoning with structured engineering tools and formal checkpoints.

**Can I run Raino entirely offline?**

Yes. With fixture data and mock embeddings, the entire system works offline. You will not have live pricing or real-time supplier data, but the design workflow, validation, and artifact generation all function without network access.

## Licensing

- **Raino**: MIT License. See [LICENSE](LICENSE).
- **KiCad**: External GPL-licensed tool. Not embedded in Raino.
- **KiCad libraries and generated designs**: May carry different license terms than Raino itself. Consult KiCad's license documentation for details.

Raino does not copy any GPL-licensed code into its repository. The KiCad boundary is maintained through CLI contracts only.

## Screenshots

[Screenshot: Raino marketing site hero section]

[Screenshot: Raino studio intake panel with natural language input]

[Screenshot: Raino studio BOM panel with sourcing data and risk indicators]

[Screenshot: Raino studio PCB 3D preview with interactive model viewer]

[Screenshot: Raino studio quote panel showing low/mid/high bands with confidence level]

## Provenance and Security

### No-Fake-Integration Policy

Raino never:

- Fabricates live pricing or stock data
- Claims a live API connection when using fixture data
- Silently downgrades to degraded mode without reporting
- Proceeds past critical ambiguity without user confirmation

Every degraded-mode path is inspectable through the audit trail.

### Provenance Tracking

Every design decision in Raino is traceable:

- Part selections link back to datasheets, errata, and application notes
- BOM entries record the supplier, price source, and whether the price is an estimate
- Artifacts carry manifests with checksums and generation timestamps
- Quotes include a full assumptions list and confidence scoring
- Policy violations are surfaced and logged

### Input Validation

All API inputs are validated with Zod schemas. Type-safe parsing with clear error messages. No untyped data enters the system.

### External Boundaries

- KiCad communicates only through defined CLI contracts
- Supplier adapters use the Interface + Adapter pattern with no direct database connections
- Embedding services connect through pluggable interfaces with mock fallbacks

---

<p align="center">
  <a href="https://github.com/tudsds/raino">GitHub</a> &middot; MIT License &middot; Built with TypeScript, Next.js, and KiCad
</p>
