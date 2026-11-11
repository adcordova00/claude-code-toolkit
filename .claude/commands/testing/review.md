---
description: Review existing tests for quality, coverage completeness, and maintainability.
---

# Review Test Quality

## When to use

Use when auditing existing tests to find gaps, anti-patterns, or tests that give false confidence.
Pass the test file(s) or describe the test suite in `$ARGUMENTS`.

## Instructions

Review tests with a critical eye for what they actually verify vs. what they claim to verify.

**Test isolation**
- Tests that share mutable state between them (class-level variables modified in tests)
- `@BeforeAll` / `beforeAll()` used for state that should be per-test
- Tests that pass individually but fail when run in sequence

**Assertion quality**
- Tests with no assertions (test always passes) — the most dangerous kind
- Assertions so broad they can't catch regressions: `assertThat(result).isNotNull()`
- `assertTrue(true)` or other vacuous assertions
- Missing assertions on the most important property being tested

**Mock overuse**
- Mocking the class under test (defeats the purpose)
- Mocking simple value objects (mock `String`, `LocalDate`, etc.)
- Asserting on mock interactions instead of outcomes (fragile, couples tests to implementation)
- `any()` matchers everywhere — tests that don't verify what was actually passed

**Test coverage gaps**
- Happy path only — no error or edge case tests
- No test for the behavior described in the method name
- Missing tests for boundary values (empty list, zero, max integer, null)
- Exception cases not tested (what happens when a dependency throws?)

**Test naming**
- Names that describe implementation instead of behavior: `testMethod()`, `test1()`
- Names that are too vague to understand what the test verifies without reading it

**Setup quality (unit tests)**
- `@SpringBootTest` used where `@ExtendWith(MockitoExtension.class)` would suffice (10x slower)
- Test fixtures that create far more data than the test uses

**Flakiness risks**
- `Thread.sleep()` used to wait for async operations
- Tests that depend on system time without injecting a `Clock`
- Tests that depend on file system state or external services without proper mocking/isolation
- Random data used without fixed seeds (causes non-deterministic failures)

## Steps

1. Read all tests in the provided file
2. For each test: identify what it claims to test, what it actually verifies, and what it misses
3. Group findings by category
4. Prioritize: tests that give false confidence (pass when they should fail) are most critical

## Output format

```
## Test Quality Review

### False confidence (tests that always pass or miss the point)
- [TestClass.testMethod]: [what's wrong]. Fix: [how to make the assertion meaningful]

### Missing test cases
- [scenario]: [why it matters]. Suggested test: [description]

### Anti-patterns
- [test]: [pattern and fix]

### Flakiness risks
- [test]: [what makes it flaky and how to fix]

### Well-written tests
- [what's done well]
```
