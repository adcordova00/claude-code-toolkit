---
description: Generate an OpenAPI 3.1 specification from Spring Boot controllers or an API description.
---

# Generate OpenAPI 3.1 Specification

## When to use

Use when documenting a REST API, generating a client SDK, or setting up API mocking. Pass
the Spring Boot controller code or API description in `$ARGUMENTS`. Produces an OpenAPI 3.1
YAML spec compatible with Swagger UI, Redoc, and code generators.

## Instructions

Generate a complete OpenAPI 3.1 spec that accurately represents the API. Follow these conventions:

**Info section**
- `title`: service name
- `version`: current version (e.g., `1.0.0`)
- `description`: 1-2 sentences about what the API does
- `contact` and `license` blocks if known

**Paths**
- One path entry per URL pattern, with all HTTP methods documented
- `summary`: one-line description (shown in navigation)
- `description`: detailed behavior, preconditions, business rules
- `operationId`: unique, camelCase (`getUserById`, `createOrder`)
- `tags`: group related operations (maps to controller name)

**Request/Response schemas**
- Define all models in `components/schemas` and `$ref` them — no inline objects
- Use `required` array to mark mandatory fields
- Use `format` for: `int64`, `date-time`, `email`, `uri`, `uuid`
- Use `example` values for every field (enables better mock generation)
- Enums: list all valid values with descriptions

**Standard response codes to document**
- `200`: successful GET/PUT/PATCH with response body
- `201`: successful POST, include `headers.Location` with `schema.$ref: '#/components/headers/Location'`
- `204`: successful DELETE (no body)
- `400`: validation error (ProblemDetail schema)
- `401`: unauthenticated
- `403`: forbidden
- `404`: resource not found
- `422`: business rule violation
- `500`: internal server error

**Security**
- Define `securitySchemes` in components (JWT Bearer, API key, OAuth2)
- Apply globally or per-operation

**ProblemDetail schema (RFC 9457)** — reusable in components:
```yaml
ProblemDetail:
  type: object
  properties:
    type: { type: string, format: uri }
    title: { type: string }
    status: { type: integer }
    detail: { type: string }
    instance: { type: string, format: uri }
```

## Steps

1. Parse the controller code or API description from `$ARGUMENTS`
2. Extract all endpoints, request/response types, validation rules
3. Generate the full YAML spec

## Output format

Complete OpenAPI 3.1 YAML, ready to save as `openapi.yaml`:

```yaml
openapi: 3.1.0
info:
  title: ...
paths:
  /api/v1/users:
    get:
      ...
components:
  schemas:
    ...
```
