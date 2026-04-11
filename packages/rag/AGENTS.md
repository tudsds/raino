# packages/rag — RAG System

## Purpose

Retrieval-Augmented Generation for engineering knowledge. Handles chunking, embedding contracts, retrieval interfaces, and storage contracts.

## Scope

RAG IS for:

- Datasheets, reference manuals, errata, application notes
- Reference designs, evaluation board guides
- Package/land-pattern documents
- Internal engineering notes

RAG is NOT for:

- Live stock/price/MOQ → supplier adapters
- Order placement state → supplier adapters
- Vendor transaction state → supplier adapters

## Modules

- `chunking/` — Engineering-aware chunking (by semantic section, not windows)
- `embeddings/` — Embedding generation contracts
- `retrieval/` — Retrieval interfaces with provenance
- `storage/` — Document and vector storage contracts
- `pipeline/` — Pipeline orchestration

## Chunk Categories

- Absolute maximum ratings
- Recommended operating conditions
- Power requirements
- Pin descriptions
- Boot configuration
- Clock tree
- Reset guidelines
- USB/ADC/interface guidelines
- Recommended PCB layout
- Package outline
- Errata items
- Reference circuits

## Storage Modes

- fixture mode: local JSON/SQLite for tests
- live mode: configured vector store (interface only)

## Commands

```bash
pnpm build --filter @raino/rag
pnpm test --filter @raino/rag
```
