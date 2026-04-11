#!/usr/bin/env bash
set -euo pipefail

echo "=== Raino CI Pipeline ==="
echo ""

echo "--- Typecheck ---"
pnpm typecheck
echo "Typecheck: PASSED"
echo ""

echo "--- Lint ---"
pnpm lint
echo "Lint: PASSED"
echo ""

echo "--- Build ---"
pnpm build
echo "Build: PASSED"
echo ""

echo "--- Tests ---"
pnpm test
echo "Tests: PASSED"
echo ""

echo "=== All checks passed ==="
