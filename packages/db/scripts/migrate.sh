#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DB_DIR="$(dirname "$SCRIPT_DIR")"

echo "==> Loading environment..."
if [ -f "$DB_DIR/.env" ]; then
  export "$(grep -v '^#' "$DB_DIR/.env" | xargs)"
fi

if [ -z "$DATABASE_URL" ]; then
  echo "Error: DATABASE_URL is not set"
  exit 1
fi

echo "==> Running Prisma migrations..."
cd "$DB_DIR"
npx prisma migrate deploy

echo "==> Applying Supabase SQL migrations in order..."
SUPABASE_MIGRATIONS="$DB_DIR/supabase/migrations"
for f in $(ls "$SUPABASE_MIGRATIONS"/*.sql | sort); do
  echo "Applying $(basename $f)..."
  psql "$DATABASE_URL" -f "$f"
done

echo "==> Migration complete"