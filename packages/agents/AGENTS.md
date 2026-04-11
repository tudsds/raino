# packages/agents — Workflow Contracts and Orchestration

## Purpose

Agent prompts, workflow state machines, orchestration helpers, and inter-service contracts.

## Modules

- `prompts/` — Prompt templates for intake, clarification, spec compilation, BOM generation
- `workflow/` — Workflow state machines (intake → spec → architecture → BOM → design → validate → export)
- `orchestration/` — Orchestration helpers for coordinating workers
- `contracts/` — TypeScript interfaces for inter-service communication

## Workflow States

1. intake — Natural language + file upload
2. clarifying — Question-answer loop
3. spec_compiled — Structured product specification
4. architecture_planned — Architecture template selected
5. candidates_discovered — Candidate part families identified
6. ingested — Documents ingested and indexed
7. bom_generated — Full BOM with alternates
8. design_generated — KiCad project artifacts
9. validated — ERC/DRC passed
10. exported — Previews and downloads ready
11. quoted — Rough quote generated
12. handed_off — Optional PCBA quote requested

## Commands

```bash
pnpm build --filter @raino/agents
pnpm test --filter @raino/agents
```
