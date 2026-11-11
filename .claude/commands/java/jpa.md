---
description: Audit JPA entities and queries for N+1 problems, fetch strategies, and correctness.
---

# JPA / Hibernate Audit

## When to use

Use when debugging slow queries, reviewing entity design, or auditing JPA repositories before
a performance-sensitive release. Pass the entity class(es), repository, or service code in `$ARGUMENTS`.

## Instructions

Audit JPA code for these common problems:

**N+1 query problem**
- `@OneToMany` / `@ManyToMany` collections accessed in a loop without eager fetching or JOIN FETCH
- Identify the exact collection traversal that triggers N additional queries
- Fix options (in order of preference):
  1. `@EntityGraph` on the repository method
  2. `JOIN FETCH` in `@Query` JPQL
  3. `@BatchSize(size = 25)` as a last resort (still fires extra queries but batches them)

**Fetch type issues**
- `FetchType.EAGER` on `@OneToMany` or `@ManyToMany` — always bad, causes Cartesian products
- `FetchType.LAZY` on `@ManyToOne` — usually fine, but verify it's not accessed after session close
  (LazyInitializationException risk when entities are returned from services without DTOs)

**Entity design**
- Bidirectional relationships without `mappedBy` on the non-owning side
- Missing `@JoinColumn` — Hibernate generates column names that differ from conventions
- Using `@Data` (Lombok) on entities — generates `equals`/`hashCode` using all fields, causing
  issues with proxied entities and collections. Use `@EqualsAndHashCode(of = "id")` instead
- `CascadeType.ALL` or `CascadeType.REMOVE` on collections without understanding the implications
- Missing `orphanRemoval = true` when child entities shouldn't outlive the parent

**Query correctness**
- JPQL using `%:param%` for LIKE (works but case-sensitive) — suggest `LOWER()` if needed
- Bulk `UPDATE`/`DELETE` queries not clearing the first-level cache after execution (`em.clear()`)
- Missing `@Modifying` and `@Transactional` on mutating `@Query` methods
- `findAll()` with no pagination on large tables — always use `Pageable`

**Transaction boundary**
- Lazy collections accessed outside a transaction — will throw `LazyInitializationException`
  at runtime; fix by using DTOs and mapping inside the service (within the transaction)

## Steps

1. Identify all entity relationships and their fetch types
2. Find all repository methods and how their results are used in service/controller layers
3. Trace any collection traversals to find N+1 patterns
4. Check for `LazyInitializationException` risks

## Output format

```
## JPA Audit

### N+1 query risks
- [Entity.field / method]: [description of N+1]. Fix: [JOIN FETCH / @EntityGraph code]

### Fetch strategy issues
- [relationship]: [problem]. Fix: [recommendation]

### Entity design issues
- [issue]. Fix: [code]

### Query issues
- [query]: [problem]. Fix: [corrected query]

### Looks good
- [what's well done]
```
