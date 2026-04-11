# packages/core — Domain Schemas, Validation, and Logic

## Purpose

Central package containing all Zod schemas, validation functions, domain types, quote engine logic, BOM engine, architecture types, and audit models.

## Key Modules

- `schemas/` — Zod schemas for all domain entities
- `validation/` — Validation functions using schemas
- `quote/` — Rough quote engine (formula-based)
- `bom/` — BOM generation and validation logic
- `architecture/` — Architecture template types and selection
- `spec/` — Structured product specification
- `audit/` — Audit log and provenance types

## Schema Design Rules

- All schemas use Zod
- Every schema must have `.parse()` success and failure tests
- Inferred types via `z.infer<typeof Schema>`
- No `any` types

## Key Schemas

- ProjectSchema, ProjectStatus
- ProductSpecSchema (structured requirements)
- ArchitectureTemplateSchema
- BOMRowSchema (full BOM with all fields)
- QuoteSchema (low/mid/high + assumptions)
- AuditEntrySchema, AuditManifestSchema
- IngestionManifestSchema, SufficiencyReportSchema

## Commands

```bash
pnpm build --filter @raino/core
pnpm test --filter @raino/core
```
