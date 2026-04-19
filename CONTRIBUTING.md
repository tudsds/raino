# Contributing to Raino

Thank you for your interest in contributing to Raino. This guide covers everything you need to get started.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Making Changes](#making-changes)
- [Code Standards](#code-standards)
- [Testing Requirements](#testing-requirements)
- [Commit Messages](#commit-messages)
- [Pull Request Process](#pull-request-process)
- [Reporting Issues](#reporting-issues)

## Code of Conduct

This project follows the [Contributor Covenant Code of Conduct](CODE_OF_CONDUCT.md). By participating, you agree to uphold its standards.

## Getting Started

1. Fork the repository on GitHub.
2. Clone your fork locally.
3. Create a branch for your work.

```bash
git clone https://github.com/YOUR_USERNAME/raino.git
cd raino
git checkout -b my-feature-branch
```

## Development Setup

Raino uses pnpm workspaces. Make sure you have Node.js 20+ and pnpm 9+ installed.

```bash
pnpm install
pnpm dev
```

The development servers start on:
- Marketing site: http://localhost:3000
- Studio app: http://localhost:3001

## Making Changes

1. Create a descriptive branch name. Use prefixes like `feat/`, `fix/`, `docs/`, `refactor/`.
2. Make your changes on the branch.
3. Run the full check suite before committing.

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

All four commands must pass. Fix any failures before opening a PR.

## Code Standards

These rules are non-negotiable. CI will reject violations.

**TypeScript**
- Strict mode is enabled. All code must pass strict type checking.
- Never use `as any`, `@ts-ignore`, or `@ts-expect-error`. If the types are wrong, fix the types.
- Never leave empty catch blocks. At minimum, log or rethrow.

**General**
- Prefer plain language. "Use" not "utilize". "Help" not "facilitate".
- No em dashes or en dashes in prose. Use commas, periods, or line breaks.
- Remove AI-sounding filler phrases. Write like a human.
- Keep functions focused and small. If a function does more than one thing, split it.

**Architecture**
- KiCad is an external worker boundary. Do not embed GPL-licensed code.
- Supplier adapters follow the interface + adapter pattern. Never couple directly to a supplier API.
- RAG is for engineering knowledge retrieval only. Never use it for live pricing, stock, or order state.
- Never fabricate live integration data. Use fixture/degraded mode and label it clearly.

## Testing Requirements

- Every Zod schema must have parse success and parse failure tests.
- The quote engine must have golden-output tests with known inputs and expected outputs.
- The ingestion pipeline must have sufficiency-gate tests.
- RAG retrieval must have provenance verification tests.
- Failure modes must be tested: hallucinated parts, missing errata, malformed inputs.
- Never delete tests to pass a build.

## Commit Messages

Use [Conventional Commits](https://www.conventionalcommits.org/):

```
type(scope): description

feat(core): add impedance calculation schema
fix(supplier-clients): handle missing DigiKey API key gracefully
docs(architecture): clarify KiCad boundary constraints
refactor(rag): extract embedding normalization into utility
test(quote-engine): add golden-output test for multi-board quote
chore(deps): update prisma to 5.x
```

**Types:** `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`, `ci`, `build`

Keep the subject line under 72 characters. Write it in imperative mood: "add feature" not "added feature".

## Pull Request Process

1. Push your branch to your fork.
2. Open a pull request against the `main` branch of the upstream repository.
3. Fill out the PR template completely. Incomplete PRs will be asked for more detail.
4. Ensure CI passes. Address any review feedback promptly.
5. Squash commits if requested by maintainers.

**What gets merged:**
- Bug fixes with tests.
- New features with tests and documentation.
- Documentation improvements.
- Refactors that improve clarity without changing behavior.

**What does not get merged:**
- Changes that break existing tests without replacement.
- Code with `as any`, `@ts-ignore`, or empty catch blocks.
- PRs that fake live integration data.
- Large changes without prior discussion in an issue.

## Reporting Issues

See the issue templates for bug reports and feature requests. Include as much detail as possible. Vague issues will be closed with a request for more information.

## Questions?

Open a GitHub Discussion if you have a question that is not a bug or feature request. For security vulnerabilities, see [SECURITY.md](SECURITY.md).
