---
description: Identify untested code paths and suggest high-value test cases to add.
---

# Identify Coverage Gaps

## When to use

Use when you have existing tests but want to find what's missing before shipping. Pass the
source code (not the test file) in `$ARGUMENTS`, or describe the feature and its current test coverage.

## Instructions

Analyze the source code to identify untested or undertested paths. Prioritize by risk:

**High priority paths to test**
- Exception and error handling branches (catch blocks, null checks, validation failures)
- Conditional logic with business significance (`if (user.isPremium())`, `switch` on status)
- Boundary conditions (empty collections, zero values, max/min values, strings at size limits)
- Async operations and their failure modes (timeout, network error, partial failure)
- Authorization/permission checks
- Integration points with external systems (DB, cache, third-party APIs)

**Medium priority**
- Multiple code paths through complex methods (high cyclomatic complexity)
- Happy path variations (different valid inputs that exercise different branches)
- State machine transitions (all edges, not just the common ones)

**Lower priority**
- Simple getters/setters with no logic
- Generated code (Lombok, MapStruct)
- Framework-delegated behavior already covered by framework tests

**For each missing test, specify:**
- The code path or scenario
- Why it matters (what bug it would catch)
- A concrete test description (given/when/then)
- The testing approach (unit / integration / E2E)

## Steps

1. Read the source code and build a mental map of all branches and paths
2. If the test file is provided, identify which paths have coverage
3. List gaps ordered by risk/impact
4. For each gap, write a test description ready to implement

## Output format

```
## Coverage Gaps Analysis

### High priority (ship-blocking if uncovered)
- **[Method/path]**: [what happens if untested]. 
  Test: "given [condition], when [action], then [expected outcome]"
  Type: Unit / Integration

### Medium priority
- **[path]**: [description]
  Test: "..."

### Low priority
- [brief list]

### Already well covered
- [what's tested adequately]
```
