---
description: Review Java/Spring Boot code for correctness, Spring idioms, and design quality.
---

# Review Java / Spring Boot Code

## When to use

Use when reviewing a PR, a service class, or any Java code before merging. Pass the code or
file path in `$ARGUMENTS`. Reviews at the level of a senior Java engineer familiar with Spring Boot.

## Instructions

Review Java/Spring Boot code for these categories, in priority order:

**Transactional correctness**
- `@Transactional` on service methods that modify data — not on controllers or repositories
- `@Transactional(readOnly = true)` on read-only service methods (enables optimizations)
- Transactions not propagating correctly across method calls within the same class
  (Spring proxy doesn't intercept internal calls — self-injection or restructuring needed)
- Catching exceptions inside a `@Transactional` method prevents rollback — must rethrow or
  use `@Transactional(rollbackFor = ...)`

**Exception handling**
- HTTP exceptions (`ResponseStatusException`) thrown from service layer — services shouldn't
  know about HTTP; throw domain exceptions instead
- `Exception` caught silently (empty catch blocks, or `log.error` without rethrowing)
- Missing `ResourceNotFoundException` or similar for entity lookups

**Security**
- Mass assignment: entity fields bound directly from request without DTO
- Missing `@Valid` on `@RequestBody` — validation annotations on DTOs are ignored without it
- Sensitive data (passwords, tokens) returned in response DTOs
- SQL injection via string-concatenated JPQL (use parameters: `?1` or `:name`)

**Performance**
- N+1 queries: loading collections lazily in a loop — use `JOIN FETCH` or `@EntityGraph`
- `FetchType.EAGER` on `@OneToMany` / `@ManyToMany` relationships
- Fetching full entities when only a few fields are needed — use projections or DTOs in queries

**Design**
- Business logic in controllers (should be in services)
- Entities used as DTOs (leaks JPA internals, causes serialization issues)
- Static utility methods with side effects
- Missing `@RequiredArgsConstructor` + `final` fields (prefer constructor injection)

**Spring idioms**
- `@Autowired` on fields (use constructor injection)
- `new` creating Spring beans (use injection)
- `applicationContext.getBean()` inside business code

## Steps

1. Identify the layer (controller, service, repository, entity, config)
2. Apply layer-specific rules first, then cross-cutting concerns
3. Rate each issue: Critical / Major / Minor

## Output format

```
## Java Code Review

### Critical
- [Class.method() line X]: [issue]. Fix: [concrete suggestion]

### Major
- [issue]: [explanation and fix]

### Minor
- [improvement suggestion]

### Looks good
- [2-3 positives]
```
