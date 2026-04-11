# Writing Category — Raino

Handles documentation, READMEs, guides, and prose for the Raino project.

## Documentation Style

Serious, contributor-friendly, modeled after mature open-source projects. Write for someone who is technically competent but new to Raino. Explain what and why, not just how.

## Tone Guidelines

1. Direct and factual. No hype, no marketing language in technical docs.
2. Assume the reader is smart but unfamiliar with Raino's internals.
3. State constraints clearly. If something cannot be done, say so upfront.
4. Use concrete examples. Show the actual file path, the actual command, the actual schema.
5. Keep paragraphs short. Use lists and tables to break up dense material.

## Multilingual Requirements

Raino READMEs must be available in four languages: English (EN), Chinese (zh-CN), Japanese (ja), and Korean (ko). All four versions must cover the same content. Technical terms (package names, CLI commands, API endpoints) stay in English. Write the EN version first, then adapt the others.

## README Structure

The root README must include these sections in order:

1. Project name and one-line description
2. What Raino is (2-3 paragraphs, no jargon in the first paragraph)
3. Why Raino exists (the problem it solves)
4. Architecture overview with ASCII diagram
5. Repository structure as a tree
6. Major packages and services table
7. Getting started (prerequisites, clone, install, run)
8. Local development (individual apps, building, type checking, linting)
9. Environment variables table
10. Testing and auditing
11. Deployment
12. Contributing
13. FAQ
14. Licensing
15. Screenshots (placeholder references)

## Doc Sections Under docs/

Each subdirectory under `docs/` must have an `index.md` that explains what that section covers and links to individual pages:

- `docs/architecture/` — System design, package graph, service boundaries, KiCad GPL boundary, RAG scope
- `docs/api/` — API reference for all public endpoints, request/response schemas
- `docs/deployment/` — Vercel setup, environment variables, fixture mode, production considerations
- `docs/ingestion/` — Document ingestion pipeline stages, sufficiency gate, chunking strategy
- `docs/security/` — No-fake-integration policy, provenance tracking, input validation, external boundaries
- `docs/ux/` — Design language, component library, color palette, typography

## Acceptance Criteria

- Every doc page has a clear title and states its audience
- No doc references a feature that does not exist in the codebase
- Code examples in docs are accurate and copy-pasteable
- Fixture mode and degraded behavior are documented, not hidden
- The KiCad GPL boundary is explained in both the architecture and licensing docs
