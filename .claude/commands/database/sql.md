---
description: Review a PostgreSQL query for correctness, performance, and index usage.
---

# Review PostgreSQL Query

## When to use

Use when optimizing a slow query, auditing a new query before production, or debugging
unexpected results. Pass the SQL query and optionally the table schema or EXPLAIN output in `$ARGUMENTS`.

## Instructions

Analyze the query for correctness and performance:

**Correctness**
- `JOIN` type: is `INNER JOIN` correct, or do you need `LEFT JOIN` to include rows with no match?
- `NULL` handling: comparisons with NULL using `=` always return false — use `IS NULL` / `IS NOT NULL`
- Aggregation: columns in `SELECT` not in `GROUP BY` (non-standard, unreliable in strict mode)
- `DISTINCT` masking a cartesian product from a missing join condition
- `LIMIT` without `ORDER BY` — non-deterministic results
- Date/time operations: timezone handling, timestamp vs. date comparisons

**Performance**
- Sequential scans on large tables (no index being used)
- `SELECT *` — fetches all columns when only a few are needed (wider rows = slower scans)
- Functions on indexed columns in `WHERE` clause prevent index usage:
  `WHERE LOWER(email) = 'x'` → create a functional index or use `email = LOWER('x')`
- `LIKE '%prefix'` with leading wildcard — can't use B-tree index, suggest `pg_trgm` extension
- `IN (SELECT ...)` that could be rewritten as `EXISTS` (often faster for large subqueries)
- `ORDER BY` + `LIMIT` without an index on the sort column — full table scan then sort
- Multiple `COUNT(DISTINCT field)` in one query — expensive, consider alternatives

**Index usage**
- Identify which columns in `WHERE`, `JOIN ON`, and `ORDER BY` need indexes
- Composite index column order: most selective / most filtered first
- Partial indexes when filtering on a common condition: `WHERE deleted_at IS NULL`
- Index on foreign keys (Postgres doesn't auto-create them, unlike MySQL)

**If EXPLAIN ANALYZE output is provided**
- Look for: `Seq Scan` on large tables, `Hash Join` vs `Nested Loop` for size mismatch
- High `rows` estimates vs. actual rows → stale statistics, run `ANALYZE table`
- High `cost` operations → candidate for optimization

## Steps

1. Parse the query and schema from `$ARGUMENTS`
2. Identify correctness issues first
3. Identify performance issues and missing indexes
4. Rewrite the query if improvements are significant
5. Provide `CREATE INDEX` statements for suggested indexes

## Output format

```
## Query Review

### Correctness issues
- [issue and fix]

### Performance issues
- [issue and fix / rewritten query]

### Suggested indexes
```sql
CREATE INDEX idx_orders_user_created ON orders(user_id, created_at DESC);
-- Reason: supports the ORDER BY user_id, created_at query
```

### Optimized query
```sql
[if a rewrite is beneficial]
```
