---
description: Design a global exception handler for Spring Boot using RFC 9457 ProblemDetail.
---

# Design Global Exception Handler

## When to use

Use when setting up or improving error handling in a Spring Boot application. Pass the list
of domain exceptions or describe the current error handling situation in `$ARGUMENTS`.
Produces a production-ready `@ControllerAdvice` using Spring 6's `ProblemDetail` (RFC 9457).

## Instructions

Generate a global exception handler following these principles:

**Never expose internals**
- No stack traces in responses
- No Hibernate/JPA error messages in responses
- No exception class names in responses (unless it's a domain exception meant for clients)

**RFC 9457 ProblemDetail** (Spring 6 / Boot 3+)
- Use `ProblemDetail.forStatusAndDetail(status, detail)` for all responses
- Add `type` URI: `problem.setType(URI.create("https://api.yourapp.com/problems/<type>"))`
- Add `title` following HTTP status name for standard errors, domain-specific for business errors
- Use `ProblemDetail.setProperty(key, value)` for extra context (field errors, error codes)
- Content-Type: `application/problem+json`

**Exception hierarchy to handle**

| Exception | HTTP Status | Notes |
|-----------|-------------|-------|
| `ResourceNotFoundException` | 404 | Domain exception for entity not found |
| `BusinessRuleException` | 422 | Domain exception for rule violations |
| `MethodArgumentNotValidException` | 400 | Bean Validation failures — list field errors |
| `ConstraintViolationException` | 400 | Path/query param validation failures |
| `DataIntegrityViolationException` | 409 | DB unique constraint violation |
| `AccessDeniedException` | 403 | Spring Security |
| `AuthenticationException` | 401 | Spring Security |
| `HttpMessageNotReadableException` | 400 | Malformed JSON body |
| `NoHandlerFoundException` | 404 | Route not found |
| `MethodNotAllowedException` | 405 | Wrong HTTP method |
| `Exception` (fallback) | 500 | Log with ERROR, return generic message |

**Logging**
- 5xx errors: log at ERROR with full stack trace (for alerting/debugging)
- 4xx errors: log at DEBUG or WARN (client errors, not actionable for ops)
- Include a correlation/request ID in the response for traceability

## Steps

1. Parse `$ARGUMENTS` for any domain exceptions to handle specifically
2. Generate the `@ControllerAdvice` class with all handlers
3. Generate the domain exception classes (`ResourceNotFoundException`, etc.)
4. Show example response bodies for each case

## Output format

```java
// === GlobalExceptionHandler.java ===
// === ResourceNotFoundException.java ===
// === BusinessRuleException.java ===
```

Then show example JSON responses for: 404, 400 (validation), 409, 500.
