---
description: Generate a pre-deployment checklist tailored to the service being deployed.
---

# Pre-Deployment Checklist

## When to use

Use before deploying to production or a shared environment. Pass the service name, type,
and any known changes in `$ARGUMENTS` (e.g., "Spring Boot API with DB migration and new env var").

## Instructions

Generate a deployment checklist tailored to the described service and changes. Adapt items
based on what's in `$ARGUMENTS` — don't include sections that don't apply.

**Always include**
- [ ] All CI checks passing on the branch/commit being deployed
- [ ] Code review approved and all review comments resolved
- [ ] No `TODO`, `FIXME`, or `console.log`/debug statements in the diff

**Database changes**
- [ ] Migration script reviewed by a second engineer
- [ ] Migration is backward-compatible (old code can run against new schema during rollout)
  - Additive changes (add column/table) are safe
  - Renaming or dropping columns requires a multi-step deployment
- [ ] Migration tested against a production-size data copy (timing, locking)
- [ ] Rollback plan documented for the migration
- [ ] Backup taken or verified before deploying

**New environment variables**
- [ ] Variable added to all environments (staging, production)
- [ ] Variable documented in `.env.example`
- [ ] Secret stored in the secrets manager (not in code, not in CI env vars as plain text)
- [ ] Application starts and passes health check with the new variable

**API changes**
- [ ] Backward-compatible? (new fields added, nothing removed or renamed)
- [ ] If breaking: version bump, old version still works, deprecation notice sent
- [ ] API documentation updated

**Infrastructure / dependency changes**
- [ ] New dependencies audited for known vulnerabilities
- [ ] License of new dependencies compatible with project license
- [ ] Resource limits (memory, CPU) adjusted if needed

**Observability**
- [ ] New code paths have appropriate logging (not too verbose, not silent on errors)
- [ ] Metrics/dashboards updated for new endpoints or jobs
- [ ] Alerts reviewed — new failure modes covered

**Deployment process**
- [ ] Deployment run during business hours (or on-call engineer available)
- [ ] Rollback procedure clear and tested (can you roll back in < 5 minutes?)
- [ ] Health check URL verified post-deploy
- [ ] Key user journeys smoke-tested post-deploy

## Steps

1. Parse `$ARGUMENTS` for the type of changes being deployed
2. Generate a Markdown checklist tailored to those changes
3. Add a "Rollback plan" section at the end

## Output format

```markdown
# Pre-Deployment Checklist: <Service Name>

## Before deploying
- [ ] ...

## Database changes
- [ ] ...

## Post-deployment verification
- [ ] Health check: `GET /actuator/health` returns 200
- [ ] Smoke test: [specific user journey]

## Rollback plan
[How to roll back within 5 minutes if something goes wrong]
```
