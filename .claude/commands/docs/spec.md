---
description: Write a technical specification for a feature or system component.
---

# Write Technical Specification

## When to use

Use before starting implementation of a non-trivial feature. Pass the feature name and
high-level requirement in `$ARGUMENTS`. A good tech spec aligns the team before code is written
and serves as the reference during code review.

## Instructions

Write a technical specification that answers: what are we building, why, how, and how do we
know it's done? The spec should be detailed enough that any engineer on the team could
implement it independently.

**Spec sections**

1. **Overview**: What this feature does and why. 2-3 sentences. No jargon.
2. **Background**: Context a new engineer needs to understand why this is needed.
   Link to relevant tickets, existing code, or prior discussions.
3. **Goals and non-goals**: Explicit list of what's in scope and what's intentionally out of scope.
   Non-goals are as important as goals — they prevent scope creep.
4. **Proposed design**: The technical approach. Include:
   - System diagram or data flow (ASCII or Mermaid)
   - Key components and their responsibilities
   - Data model changes (new tables, new fields)
   - API changes (new endpoints, changed contracts)
   - Key algorithms or logic decisions
5. **Alternative designs considered**: 2-3 alternatives and why they were rejected.
   (Even a brief note shows the design is intentional)
6. **API contract**: Full request/response format for any new or changed endpoints.
7. **Data model**: Schema changes with migration plan.
8. **Error handling**: How each failure mode is handled. What the user/caller sees.
9. **Security considerations**: Permissions, input validation, data exposure risks.
10. **Observability**: New metrics, logs, or alerts needed.
11. **Testing plan**: Unit, integration, E2E tests to be written. Acceptance criteria.
12. **Rollout plan**: Feature flag? Gradual rollout? Backward compatibility window?
13. **Open questions**: Explicitly list unresolved questions that need answers before/during implementation.

**Writing quality bar**
- Measurable success criteria — not "the feature should be fast" but "p99 latency < 200ms"
- No hand-waving on hard parts — the hardest parts should have the most detail
- Reviewers should be able to catch design flaws without seeing code

## Steps

1. Parse `$ARGUMENTS` for the feature description
2. Infer the tech stack and context from the codebase if visible
3. Generate the full spec with all applicable sections

## Output format

Full Markdown spec, ready to save or paste into Notion/Confluence.
Use `[TBD]` for sections that need input from the team.
