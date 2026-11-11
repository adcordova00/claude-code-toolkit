---
description: Generate a safe Flyway or Liquibase migration for a described schema change.
---

# Generate Database Migration

## When to use

Use when adding, modifying, or removing database schema. Pass the desired schema change in
`$ARGUMENTS` (e.g., "add `photo_url varchar(500)` nullable to users, add index on email").
Specify Flyway or Liquibase if you have a preference.

## Instructions

Generate a migration that is **safe to run against a live production database** — zero downtime,
no locking issues, backward-compatible with the current deployed code.

**Flyway naming convention**
`V<version>__<description_with_underscores>.sql`
Examples: `V13__add_photo_url_to_users.sql`, `V14__create_product_categories_table.sql`

**Safety rules for zero-downtime migrations**

Adding columns:
- Always `nullable` first, without default (adding NOT NULL with a default locks the table in PG < 11)
- For PG 11+: `ADD COLUMN col type NOT NULL DEFAULT value` is safe (stored as metadata, not rewritten)
- Backfill default in a separate UPDATE (batched if table is large)
- Add NOT NULL constraint separately after backfill

Removing columns (3-step process across 3 deploys):
1. Deploy 1: make column nullable, stop writing to it in code
2. Deploy 2: migration drops the column (code no longer reads it)
3. (Deploy 1 code must tolerate the column being absent if using ORM column mapping)

Renaming columns (also 3-step):
1. Add the new column, write to both
2. Backfill old → new, switch reads to new column
3. Drop old column

Indexes:
- Always create indexes `CONCURRENTLY` on PostgreSQL: `CREATE INDEX CONCURRENTLY idx_name ON ...`
- Concurrent index creation cannot run inside a transaction — use `-- not in transaction`
- Drop indexes `CONCURRENTLY` too

Constraints:
- Adding a `UNIQUE` constraint: create a unique index CONCURRENTLY first, then add the constraint
- Adding `NOT NULL`: requires a full table scan — backfill first, add as NOT VALID, then VALIDATE

**For Liquibase**
- Use YAML or XML changesets, each with `id`, `author`, `comment`
- Add `rollback` block for every changeset that can be reversed

## Steps

1. Parse `$ARGUMENTS` for the schema change
2. Determine if it's a zero-downtime safe operation
3. Generate the migration file(s) — may need multiple steps across deploys
4. Add a rollback script

## Output format

```sql
-- === V13__add_photo_url_to_users.sql ===
-- Safe: adding nullable column, no table lock

ALTER TABLE users ADD COLUMN photo_url VARCHAR(500);

-- Run separately (optional backfill):
-- UPDATE users SET photo_url = '' WHERE photo_url IS NULL;

-- Index (run outside migration, CONCURRENTLY):
-- CREATE INDEX CONCURRENTLY idx_users_photo_url ON users(photo_url) WHERE photo_url IS NOT NULL;
```

```sql
-- === Rollback ===
ALTER TABLE users DROP COLUMN photo_url;
```

After the SQL: explain any multi-step deployment requirements.
