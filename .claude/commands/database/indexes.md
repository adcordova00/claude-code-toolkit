---
description: Analyze table access patterns and recommend optimal PostgreSQL indexes.
---

# Analyze and Recommend PostgreSQL Indexes

## When to use

Use when a table is growing and queries are slowing down, or before launching a feature that
will add new query patterns. Pass the table schema, current indexes, and key queries in `$ARGUMENTS`.

## Instructions

Analyze the queries and schema to recommend indexes that provide the most benefit with the
least write overhead. More indexes = faster reads, slower writes, more disk.

**Index type selection**
- `B-tree` (default): equality, range, `ORDER BY`, `LIKE 'prefix%'` (without leading wildcard)
- `GIN`: full-text search (`tsvector`), JSONB containment (`@>`), array containment
- `GiST`: geographic data (PostGIS), range types, full-text search alternative
- `Hash`: equality only — rarely better than B-tree in PostgreSQL
- `BRIN`: very large tables with naturally ordered data (time-series, sequential IDs)
- Functional index: `CREATE INDEX ON users (LOWER(email))` for case-insensitive lookups
- Partial index: `CREATE INDEX ON orders (user_id) WHERE status = 'PENDING'` — smaller, faster

**Composite index analysis**
- Column order matters: leftmost columns must be used for the index to help
- Rule: most filtered / highest cardinality first, then order-by columns last
- `(user_id, created_at DESC)` helps both: `WHERE user_id = ? ORDER BY created_at DESC`
- An index on `(a, b)` also helps queries on just `a`, but not queries on just `b`

**Index cost vs. benefit**
- Every index adds overhead on INSERT/UPDATE/DELETE
- Indexes on write-heavy tables (logs, events) need justification
- Unused indexes: check `pg_stat_user_indexes` for `idx_scan = 0` indexes older than 1 week

**Identifying missing indexes**
- Look for: frequent `WHERE` clauses, `JOIN ON` conditions, `ORDER BY` columns, `GROUP BY` columns
- Foreign keys in PostgreSQL do NOT get automatic indexes (unlike MySQL) — always add them
- High-cardinality columns (user_id, email) benefit more from indexes than low-cardinality (status, boolean)

**Queries to check index usage**
```sql
-- Find slow queries
SELECT query, calls, mean_exec_time, total_exec_time
FROM pg_stat_statements
ORDER BY total_exec_time DESC
LIMIT 20;

-- Find unused indexes
SELECT schemaname, tablename, indexname, idx_scan
FROM pg_stat_user_indexes
WHERE idx_scan = 0
ORDER BY tablename;

-- Find tables with sequential scans
SELECT relname, seq_scan, idx_scan
FROM pg_stat_user_tables
WHERE seq_scan > 0
ORDER BY seq_scan DESC;
```

## Steps

1. Parse queries and schema from `$ARGUMENTS`
2. For each query: identify all columns in WHERE, JOIN, ORDER BY, GROUP BY
3. Check if existing indexes cover these columns
4. Recommend new indexes with creation order (CONCURRENTLY)
5. Identify any existing indexes that are redundant or unused

## Output format

```
## Index Analysis

### Missing indexes (ordered by estimated impact)
1. **[table].[column(s)]**
   Helps query: [SQL snippet]
   ```sql
   CREATE INDEX CONCURRENTLY idx_<table>_<columns> ON <table>(<columns>);
   ```

### Indexes to review (potentially unused or redundant)
- [index name]: [reason to review]

### Queries that cannot benefit from indexes
- [query]: [why — e.g., leading wildcard LIKE, very low selectivity]
  Alternative: [pg_trgm / full-text search / application-level solution]
```
