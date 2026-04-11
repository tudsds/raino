#!/usr/bin/env bash
set -euo pipefail

echo "=== Raino Bootstrap Ingestion ==="
echo ""

echo "Running ingestion pipeline with fixture data..."
pnpm --filter @raino/ingest-worker ingest:bootstrap

echo ""
echo "=== Bootstrap ingestion complete ==="
