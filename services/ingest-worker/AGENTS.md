# services/ingest-worker — Document Ingestion Pipeline

## Purpose

Full ingestion pipeline from candidate discovery through sufficiency validation.

## Pipeline Stages

1. candidate-discovery — Identify candidate MPNs from spec + architecture
2. official-doc-fetch — Fetch official engineering documents
3. raw-document-store — Store canonical raw files with provenance
4. normalization — Convert to normalized text + metadata
5. engineering-aware-chunking — Chunk by semantic section
6. metadata-enrichment — Enrich with manufacturer, MPN, trust level, etc.
7. vector/doc-store — Persist normalized docs, chunks, embeddings
8. sufficiency-gate — Validate sufficient information for design generation

## Modes

- live mode: fetch from official sources
- fixture mode: use committed local fixtures
- degraded mode: process what's available, report gaps

## CLI Entry Points

- `ingest:bootstrap` — Run full bootstrap ingestion
- `ingest:validate` — Run sufficiency validation only
- `ingest:report` — Generate ingestion report

## Outputs

- Ingestion manifest (JSON)
- Sufficiency report (JSON + Markdown)
- Raw document storage
- Normalized documents
- Chunk records
- Embedding records
- Summary report

## Commands

```bash
pnpm build --filter @raino/ingest-worker
pnpm ingest:bootstrap --filter @raino/ingest-worker
```
