# services/audit-worker — Traces, Manifests, Provenance

## Purpose

Audit trail, manifest generation, provenance tracking, and policy checks.

## Modules

- `traces/` — Decision trace logging
- `manifests/` — Artifact manifest generation
- `policy/` — Policy validation checks
- `reports/` — Audit report generation

## Audit Requirements

- Every BOM decision must be traceable to sources
- Every selected part must record provenance
- Every artifact must have a manifest
- Every quote must record assumptions
- Every degraded-mode path must be inspectable
