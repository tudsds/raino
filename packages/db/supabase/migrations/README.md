# Supabase SQL Migrations

These migrations run **after** Prisma migrations and manage raw SQL features Prisma cannot model.

## Order

| File                          | Purpose                                                       |
| ----------------------------- | ------------------------------------------------------------- |
| `00001_enable_extensions.sql` | Enables `pgcrypto` and `vector` extensions                    |
| `00002_rls_policies.sql`      | RLS policies for tenant-scoped tables                         |
| `00003_vector_and_rag.sql`    | pgvector tables (`documents`, `chunks`, `embeddings`) and RLS |
| `00004_pgvector_1536.sql`     | Migrate vector dimension from 384 to 1536 (OpenAI compatible) |
| `00005_storage_buckets.sql`   | Supabase Storage bucket configuration                         |
| `00006_seed_data.sql`         | Initial seed data (if any)                                    |

## Prerequisites

The Prisma migration (`../prisma/migrations/`) must be applied **first**, as these SQL files reference the tables it creates.

## Running

```bash
# Apply all Supabase migrations after Prisma migrations
./scripts/migrate.sh
```

Or individually:

```bash
psql "$DATABASE_URL" -f 00001_enable_extensions.sql
psql "$DATABASE_URL" -f 00002_rls_policies.sql
psql "$DATABASE_URL" -f 00003_vector_and_rag.sql
psql "$DATABASE_URL" -f 00004_pgvector_1536.sql
psql "$DATABASE_URL" -f 00005_storage_buckets.sql
psql "$DATABASE_URL" -f 00006_seed_data.sql
```

## Notes

- `00003_vector_and_rag.sql` requires the `vector` extension enabled by `00001_enable_extensions.sql`
- RLS policies reference `public.is_org_member()` defined in `00002_rls_policies.sql`
- Do not run these against a production database without testing on a staging environment first
