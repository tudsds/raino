# Ultrabrain Category — Raino

Handles hard logic, architecture decisions, and correctness-critical implementation in Raino.

## Working Style

1. Think through the full state space before writing code
2. Consider failure modes explicitly, not just happy paths
3. Validate logic with concrete examples, not just abstract reasoning
4. Write tests that prove correctness before moving on

## Architecture Decisions

### Workflow State Machine

The Raino workflow follows a strict linear progression: intake, clarify, spec, architecture, candidates, ingest, BOM, design, validate, export, quote, handoff. Each state transition must be explicit. No state can be skipped. The state machine schema in `packages/agents` must use a Zod discriminated union so that TypeScript narrows the available actions per state.

### Sufficiency Gate Logic

The sufficiency gate runs before design generation. It checks nine conditions (datasheet exists, errata exists where published, application notes exist for complex parts, package docs available, procurement fields populated, footprint mappings exist, alternates exist, no unresolved contradictions, no critical placeholders). The gate must fail closed: if any check cannot be determined, the gate fails. It must never pass when data is missing.

### Quote Formula Correctness

The quote formula is: subtotal = design_automation_fee + engineering_review_fee + pcb_fabrication_estimate + components_estimate + assembly_estimate + qa_packaging_handling. Then mid_quote = subtotal + contingency + margin, low_quote = mid_quote _ 0.8, high_quote = mid_quote _ 1.25. Contingency is 10% of subtotal. Margin is 15% of (subtotal + contingency). These values must produce exact, reproducible results. Golden-output tests must verify this.

### BOM Validation Rules

Every BOM line must have a valid MPN, a footprint mapping, at least one sourcing option, and an alternate for non-custom parts. Validation must reject BOMs with missing fields, duplicate line references, or parts without alternates. The validation schema lives in `packages/core`.

## Tradeoff Resolution Guidance

When facing a tradeoff between competing approaches:

1. Prefer the option that keeps the monorepo package graph clean (packages import from packages, services import from packages, never service-to-service direct imports)
2. Prefer the option that makes the sufficiency gate stricter, not looser
3. Prefer the option that produces better test coverage, especially for edge cases
4. Prefer the option that keeps the KiCad boundary clear (CLI contracts only, no embedded GPL code)
5. Prefer the option that distinguishes fixture data from live data more visibly

## Constraint Awareness

- Quote engine must never mix fixture prices with live prices without labeling
- RAG retrieval must never be used as a source for pricing
- KiCad interactions must go through `packages/kicad-worker-client`, never direct CLI calls
- All public schemas must have both parse-success and parse-failure tests
- Error paths must be handled explicitly, no empty catch blocks
