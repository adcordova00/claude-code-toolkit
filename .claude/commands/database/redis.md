---
description: Design a Redis caching strategy for a described use case (TTL, eviction, key naming, invalidation).
---

# Design Redis Caching Strategy

## When to use

Use when adding caching to a feature or reviewing an existing cache implementation. Pass the
use case description in `$ARGUMENTS` (e.g., "cache user profile data, updated rarely, read heavily").

## Instructions

Design a caching strategy that addresses: what to cache, key naming, TTL, eviction policy,
cache invalidation, and failure handling.

**What to cache (and what NOT to)**
- Cache: expensive DB queries, external API responses, computed aggregations, session data
- Don't cache: frequently changing data that would make stale reads unacceptable, data that's
  cheap to recompute, data that must always be fresh (account balances, inventory stock)
- Cache-aside pattern (most common for databases): app checks cache first, on miss fetches DB and populates cache
- Write-through: write to cache and DB simultaneously (strong consistency, higher latency)
- Write-behind: write to cache, DB update async (eventual consistency, higher throughput)

**Key naming conventions**
```
<app>:<entity>:<id>           → myapp:user:1234
<app>:<entity>:<id>:<field>   → myapp:user:1234:profile
<app>:<collection>:<params>   → myapp:products:category:electronics:page:1
```
- Use colons as separators
- Include entity version if the data model can change: `myapp:user:v2:1234`
- Don't include sensitive data in keys (keys are visible in Redis CLI/monitoring)

**TTL strategy**
- Short TTL (1-60 seconds): rate limiting, deduplication, very frequently updated data
- Medium TTL (1-60 minutes): user sessions, search results, feeds
- Long TTL (hours/days): rarely changing reference data (country list, product catalog)
- No TTL (persistent): only for data that's always explicitly invalidated (never appropriate for DB cache)
- Add jitter to TTL to prevent cache stampede: `TTL = base_ttl + random(0, base_ttl * 0.1)`

**Cache invalidation**
- On write: delete the cache key when the underlying data changes (simpler than updating)
- Tag-based: group related keys with a tag key, increment tag to invalidate the group
- Pattern-based DELETE: `DEL myapp:user:1234:*` — avoid on large datasets (blocks Redis)
- Prefer explicit key tracking over pattern deletes in production

**Eviction policy for the use case**
- `allkeys-lru`: general purpose cache (evict least recently used when full)
- `volatile-lru`: mixed use (only evict keys with TTL set)
- `noeviction`: session store (never evict, return errors when full)

**Failure handling**
- Cache should be optional — if Redis is down, fall through to the DB (circuit breaker pattern)
- Log cache errors at WARN, not ERROR (unless Redis is the primary store)
- Set connection pool timeout low (100-200ms) to fail fast when Redis is unresponsive

**Data structures**
- String: simple key-value, JSON blobs
- Hash: object with multiple fields (efficient for partial updates)
- Sorted Set: leaderboards, rate limiting with sliding window
- Set: unique collections, tags, deduplication
- List: queues, activity feeds

## Steps

1. Parse `$ARGUMENTS` for: entity type, read/write ratio, consistency requirements, scale
2. Design the complete caching strategy
3. Show Spring Boot `@Cacheable`/`@CacheEvict` implementation OR raw Redis commands

## Output format

```
## Caching Strategy: <Use Case>

### Decision: Cache this? Yes / No / Partial
[Rationale]

### Key naming
`<pattern>` — Example: `myapp:user:1234`

### TTL
X minutes (with jitter: X ± Y seconds)
Reason: [why this TTL is appropriate]

### Invalidation
[Strategy and trigger points]

### Eviction policy
[Policy and reason]

### Implementation
```java / typescript
[Code example]
```

### Failure handling
[Circuit breaker / fallback approach]
```
