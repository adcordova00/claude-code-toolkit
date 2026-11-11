---
description: Review a diff or selected code for bugs, design issues, and security problems.
---

# Code Review

## When to use

Use when reviewing a PR diff, a specific file, or selected code. Pass the diff, file content,
or describe what to review in `$ARGUMENTS`. Produces a structured review at the level of a
senior engineer — focused on real issues, not style nitpicks.

## Instructions

Analyze the provided code or diff with the mindset of a senior engineer doing a thorough review.
Prioritize findings by severity: **critical** (must fix before merge), **major** (should fix),
**minor** (consider fixing), **nit** (optional).

Focus on:
- **Correctness**: logic errors, off-by-one, null/empty handling, concurrency issues
- **Security**: injection, authentication bypass, sensitive data exposure, input validation
- **Performance**: N+1 queries, unnecessary loops, missing indexes, memory leaks
- **Design**: SRP violations, tight coupling, missing abstractions, over-engineering
- **Error handling**: unhandled exceptions, swallowed errors, missing rollbacks
- **Tests**: missing test coverage for changed behavior, tests that don't actually verify behavior
- **Breaking changes**: API contract changes, removed fields, migration gaps

Do NOT flag:
- Pure style preferences (formatting, naming conventions) unless they cause ambiguity
- Hypothetical future problems with no evidence in the current code
- Issues that are clearly out of scope for this PR

For each finding, provide: location (file:line if available), severity, explanation, and a
concrete fix or suggestion. If the code is solid, say so — don't manufacture issues.

## Steps

1. Read the entire diff or code before commenting on any part
2. Look for patterns, not just individual lines — check how components interact
3. Group findings by severity
4. If reviewing a PR: also comment on what's done well (2-3 positives)

## Output format

```
## Code Review

### Critical
- **[file:line]** [Issue description]. [Why it's a problem]. Fix: [concrete suggestion]

### Major
- **[file:line]** [Issue description]. Fix: [concrete suggestion]

### Minor
- **[file:line]** [Issue description]. Consider: [suggestion]

### Nits
- [Minor style/naming suggestions, if any]

### What's done well
- [Genuine positives about the implementation]
```

## Examples

**Input:** Spring Boot controller that catches all exceptions and returns 500 with the stack trace in the response body

**Output excerpt:**
```
### Critical
- **UserController.java:47** Stack trace exposed in HTTP response body. This leaks internal
  implementation details and can reveal library versions, package structure, and logic to attackers.
  Fix: Return a generic error message. Use `@ControllerAdvice` with `ProblemDetail` to handle
  exceptions globally without leaking internals.

### Major
- **UserController.java:52** `catch (Exception e)` swallows all exceptions including
  `OutOfMemoryError`. Catch specific exceptions or let them propagate to the global handler.
```
