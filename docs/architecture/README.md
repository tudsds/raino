# Raino Architecture

## System Overview

Raino is a constrained, auditable, source-traceable hardware design and manufacturing handoff system. It is not a chatbot or an unconstrained autonomous PCB autopilot.

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

## Product Workflow

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

## Package Architecture

### packages/core

Central domain package. All Zod schemas, validation functions, quote engine logic, BOM types, architecture types, and audit models. Every other package depends on this.

### packages/rag

RAG system for engineering knowledge retrieval. Handles engineering-aware chunking, embedding contracts, retrieval interfaces, and document/vector storage contracts. NOT used for live pricing or stock.

### packages/agents

Workflow state machine, agent prompt templates, orchestration helpers, and inter-service communication contracts. Defines the 12-state workflow and valid transitions.

### packages/ui

Shared hacker/cyberpunk design system. React components with Tailwind CSS. Dark-first theme with neon accents.

### packages/kicad-worker-client

External worker boundary for KiCad. Defines CLI command contracts, job types, and client interface. Does NOT embed KiCad (GPL boundary).

### packages/supplier-clients

Supplier adapter interfaces for DigiKey, Mouser, and JLCPCB. INTERFACE + ADAPTER pattern. Mock implementations for fixture mode. Quote source of truth.

## Service Architecture

### services/ingest-worker

Document ingestion pipeline with 8 stages: candidate discovery → doc fetch → raw store → normalization → chunking → metadata enrichment → embedding → sufficiency gate.

### services/design-worker

KiCad project generation, validation, and export. Communicates with external KiCad worker via kicad-worker-client contracts.

### services/quote-worker

Rough quote engine. Aggregates supplier pricing, calculates fee components, produces low/mid/high quote bands with confidence levels.

### services/audit-worker

Audit trail, artifact manifests, provenance tracking, and policy validation. Every BOM decision must be traceable.

## Key Boundaries

### KiCad Worker Boundary

- KiCad is GPL-licensed external tool
- Not embedded in Raino (MIT)
- Communication via CLI commands (kicad-cli)
- Generated designs may have different license considerations

### Supplier Adapter Boundary

- DigiKey, Mouser, JLCPCB adapters
- Interface + Adapter pattern
- No live credentials assumed
- Fixture mode for testing

### RAG vs Live Data Boundary

- RAG: engineering knowledge (datasheets, errata, app notes)
- Supplier adapters: live pricing, stock, MOQ, orders
- Quote source of truth = supplier adapters, not RAG

## Storage

### Document Storage

- Raw documents with provenance
- Normalized text with section boundaries
- Metadata-enriched chunks

### Vector Storage

- In-memory for fixture mode
- Interface for production vector DB

### Audit Storage

- Decision traces
- Artifact manifests
- Provenance records
- Policy check results
