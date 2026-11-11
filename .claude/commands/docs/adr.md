---
description: Write an Architecture Decision Record (ADR) in MADR format for a technical decision.
---

# Write Architecture Decision Record (ADR)

## When to use

Use when making a significant technical decision that should be documented for future reference.
Pass the decision topic and context in `$ARGUMENTS` (e.g., "choosing between PostgreSQL and MongoDB
for the product catalog"). Good ADRs capture the why, not just the what.

## Instructions

Write an ADR in MADR (Markdown Architectural Decision Records) format. An ADR should be:
- Written at the time of the decision (not retrospectively)
- Concise: 1-2 pages max
- Focused on the problem and the reasoning, not technical documentation
- Honest about trade-offs — no decision is perfect

**MADR format fields**

- **Status**: Proposed / Accepted / Deprecated / Superseded by [ADR-XXX]
- **Context and Problem Statement**: What situation forced this decision? What's the question being answered?
- **Decision Drivers**: The 3-5 criteria that matter most for this decision
- **Considered Options**: All options seriously evaluated (minimum 2, ideally 3)
- **Decision Outcome**: Chosen option and the primary reason
- **Pros and Cons of the Options**: For each option, honest list of pros and cons against the decision drivers

**Writing quality bar**
- Context section must explain the WHY behind needing this decision — the reader should understand
  the situation without any prior knowledge
- Decision drivers should be measurable or at least verifiable
- "Pro" and "Con" entries should be specific — not "simpler" but "requires no schema migration"
- The decision outcome section should state the chosen option AND the key reason — not just "we chose X"

**Common ADR topics worth documenting**
- Technology selection (database, framework, language, cloud service)
- Architectural patterns (microservices vs. monolith, event-driven vs. request-response)
- API design decisions (REST vs. GraphQL, versioning strategy)
- Data modeling decisions
- Authentication/authorization approach
- Caching strategy
- Testing strategy

## Steps

1. Parse `$ARGUMENTS` for: the decision topic, constraints, context
2. Explore the codebase to understand the current architecture relevant to the decision
3. Generate at least 3 options to consider (even if the decision is already made)
4. Write the full ADR with honest trade-off analysis
5. Always append the Implementation Plan section at the end, split into Backend and Frontend subsections

## Output format

```markdown
# ADR-XXX: <Title>

**Date**: YYYY-MM-DD  
**Status**: Proposed

## Context and Problem Statement

[2-3 paragraphs: what situation, what forced the decision, what question is being answered]

## Decision Drivers

* [Driver 1]
* [Driver 2]
* [Driver 3]

## Considered Options

* Option A: [name]
* Option B: [name]
* Option C: [name]

## Decision Outcome

Chosen option: **Option X**, because [primary reason stated concisely].

### Consequences

**Good:**
* [positive consequence]

**Bad:**
* [negative consequence / accepted trade-off]

## Pros and Cons of the Options

### Option A: [Name]

* ✅ [Pro]
* ✅ [Pro]
* ❌ [Con]
* ❌ [Con]

### Option B: [Name]
...

---

## Implementation Plan

### Backend

[Schema migrations, new entities, services, controllers, config changes, dependencies.
List exact file paths to create or modify with a one-line description of the change each.]

| File | Change |
|---|---|
| `path/to/File.java` | [what changes] |

### Frontend

[New pages, components, hooks, API services, types, router entries, and nav changes.
Include UI mockups (ASCII) for non-trivial screens. Describe the user-facing flow step by step.]

#### New files

| File | Description |
|---|---|
| `src/pages/...` | [purpose] |
| `src/hooks/api/...` | [purpose] |

#### User flow

[Step-by-step description of what the user sees and does, including loading/error states]

#### New API endpoints consumed

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/api/v1/...` | [description] |
```

**Notes on the Implementation Plan section:**
- If the decision has no frontend impact (e.g., a pure infrastructure or DB decision), write "No frontend changes required" under the Frontend subsection — never omit the section entirely.
- If the decision has no backend impact (e.g., a pure UI pattern decision), write "No backend changes required" under Backend.
- File paths should be relative to each project root.
- ASCII mockups are preferred over prose descriptions for UI — they communicate layout instantly.
