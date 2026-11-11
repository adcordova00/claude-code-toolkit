---
description: Review a REST API design for consistency, naming, HTTP semantics, and best practices.
---

# Review REST API Design

## When to use

Use when designing new endpoints or reviewing existing ones for consistency. Pass the API
definition (endpoint list, controller code, or OpenAPI spec) in `$ARGUMENTS`.

## Instructions

Review the API design against REST best practices:

**Resource naming**
- Plural nouns for collections: `/users`, `/orders`, not `/user`, `/getOrders`
- Hierarchical nesting for relationships (max 2 levels deep): `/users/{id}/orders`
- Avoid verbs in URLs (use HTTP method instead): `/users/{id}/activate` → `POST /users/{id}/activation`
- kebab-case for multi-word resources: `/product-categories`, not `/productCategories`

**HTTP methods and status codes**
- `GET`: safe + idempotent, never modifies state, returns 200/404
- `POST`: creates a resource, returns 201 with `Location` header, not idempotent
- `PUT`: full replace (all fields), idempotent, returns 200 or 204
- `PATCH`: partial update, returns 200 with updated resource
- `DELETE`: idempotent (delete again → still 204, not 404), returns 204
- `422 Unprocessable Content` for business rule violations (not 400)
- `409 Conflict` for concurrency conflicts or unique constraint violations
- `202 Accepted` for async operations (return a job/status URL)

**Query parameters for collections**
- Pagination: `?page=0&size=20` (0-indexed) or `?cursor=...` for cursor-based
- Sorting: `?sort=createdAt,desc`
- Filtering: `?status=ACTIVE&category=electronics`
- Search: `?q=search+term`

**Versioning**
- URL path versioning: `/api/v1/` — simple and cache-friendly
- Document the versioning strategy and deprecation policy

**Response consistency**
- Collections: always return an envelope `{ content: [...], totalElements, page, size }`
  even for empty results (never return null or raw array for paginated endpoints)
- Single resources: return the resource directly (no wrapper)
- Error responses: RFC 9457 ProblemDetail format

**Idempotency**
- `PUT` and `DELETE` must be idempotent — verify the implementation doesn't fail on repeat calls
- For non-idempotent POST operations that clients might retry: consider idempotency keys

**Security**
- No sensitive data in query params (they appear in logs and browser history)
- Pagination limits — is there a max page size to prevent abuse?
- Are bulk endpoints rate-limited or size-limited?

## Steps

1. List all endpoints from the input
2. Check each against the rules above
3. Propose corrected endpoint designs where needed

## Output format

```
## API Design Review

### Naming issues
- `GET /getUsers` → should be `GET /users`

### HTTP semantics
- [endpoint]: [issue and fix]

### Status code mismatches
- [endpoint]: returns [X] but should return [Y] because [reason]

### Response structure
- [issue and fix]

### Missing patterns
- [suggestion: pagination, filtering, etc.]

### Looks good
- [what's well designed]
```
