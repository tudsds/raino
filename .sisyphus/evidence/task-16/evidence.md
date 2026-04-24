# Task-16 Evidence: Supabase Storage Bucket Name Alignment

## Problem

Three different configurations existed:

- Code referenced: `design-artifacts`
- Migration created: `designs`, `documents`, `avatars`
- Actual Supabase has: `reports`, `artifacts`, `uploads`

## Changes Made

### 1. services/design-worker/src/queue/worker.ts

```diff
- const STORAGE_BUCKET = 'design-artifacts';
+ const STORAGE_BUCKET = 'artifacts';
```

### 2. packages/db/supabase/migrations/00004_storage_buckets.sql

Changed bucket names:

- `designs` → `reports`
- `documents` → `artifacts`
- `avatars` → `uploads`

Updated all RLS policies to reference new bucket names.

### 3. docs/deployment/README.md

Updated bucket documentation table and migration command comment.

### 4. docs/architecture/README.md

Updated bucket documentation table.

### 5. .env.example

Added bucket documentation comment:

```
# Supabase Storage Buckets:
# - reports: Generated reports and audit trails
# - artifacts: Design artifacts (KiCad projects, Gerber files)
# - uploads: User-uploaded documents (datasheets, specs)
```

## Verification

### grep for old bucket names (excluding RAG database tables)

```bash
$ grep -rn "design-artifacts\|'designs'\|'documents'\|'avatars'" --include="*.ts" --include="*.tsx" --include="*.sql" . | grep -v node_modules
```

Remaining `documents` references are RAG database table names (not storage buckets).

### STORAGE_BUCKET value

```bash
$ grep -n "STORAGE_BUCKET" services/design-worker/src/queue/worker.ts
45:const STORAGE_BUCKET = 'artifacts';
```

### typecheck

```
 Tasks:    25 successful, 25 total
Cached:    25 cached, 25 total
  Time:    1.105s >>> FULL TURBO
```

## Result

All code now aligns with actual Supabase storage buckets: `reports`, `artifacts`, `uploads`.
