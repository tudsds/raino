# Raino Tools & Agents

## Packages

- `@raino/core` — Zod schemas, validation, quote engine, domain types
- `@raino/db` — Prisma ORM, Supabase auth/storage/pgvector clients
- `@raino/llm` — Kimi K2.5 gateway (OpenAI-compatible), structured output, retry
- `@raino/rag` — Engineering-aware chunking, pgvector retrieval
- `@raino/agents` — Workflow state machine, prompts, orchestration, memory
- `@raino/ui` — Pixel-art cyberpunk design system (React + Tailwind v4)
- `@raino/kicad-worker-client` — KiCad CLI command contracts, job types
- `@raino/supplier-clients` — DigiKey, Mouser, JLCPCB adapter interfaces + factory

## Services

- `ingest-worker` — 8-stage document ingestion pipeline (datasheets, errata, app notes)
- `design-worker` — KiCad project generation and export
- `quote-worker` — Rough quote calculation with confidence bands (high/medium/low)
- `audit-worker` — Audit trail, artifact manifests, provenance logging

## Workflow Stages

1. **Intake** — Natural language description of the board
2. **Clarifying** — Question-answer loop to resolve ambiguity
3. **Spec Compiled** — Formal machine-readable product specification
4. **Architecture Planned** — Approved architecture template selected
5. **Candidates Discovered** — Part families shortlisted
6. **Ingested** — Engineering documents chunked and indexed
7. **BOM Generated** — KiCad-ready BOM with alternate parts
8. **Design Pending/Generated** — KiCad schematic and layout
9. **Validated** — ERC/DRC passed
10. **Exported** — Gerber files and previews ready
11. **Quoted** — Rough cost estimate with assumptions log
12. **Handed Off** — Optional PCBA quote requested
