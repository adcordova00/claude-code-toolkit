---
description: Generate an incident runbook for an alert or service.
---

# Generate Incident Runbook

## When to use

Use when creating a runbook for a Datadog alert, PagerDuty policy, or service. Pass the
service name, alert condition, or incident type in `$ARGUMENTS`. Good runbooks allow anyone
on the on-call rotation to respond effectively, not just the original author.

## Instructions

Generate a runbook that enables a responder who didn't write the service to diagnose and
resolve the incident. Structure it so the most common causes come first.

**Runbook principles**
- Assume the responder has never seen this service before
- Every command must be copy-pasteable (no placeholders like `<your-cluster>` without explaining where to get the value)
- Escalation path must be clear — who to call if self-service steps don't work
- Include a "This is NOT the problem" section for common false positives
- Time-box steps: if X doesn't resolve within 5 minutes, move to step Y

**Standard runbook sections**

1. **Alert summary**: what fired, what it means in user terms
2. **Impact**: which users/features are affected, estimated severity
3. **Quick checks** (< 2 minutes): simple things to rule out first
4. **Diagnosis steps**: ordered investigation steps with expected outputs
5. **Common causes and fixes**: the top 3-5 causes with resolution steps
6. **Rollback procedure**: how to roll back the last deploy if that's the cause
7. **Escalation**: who to call and when (after how long / which conditions)
8. **Post-incident**: what to do after resolution (ticket, postmortem trigger threshold)

**For each diagnosis step, include**
- The command or action to take
- What to look for in the output
- What it means if the result is unexpected
- Link to relevant dashboard/log query

## Steps

1. Parse `$ARGUMENTS` for: service name, alert condition, tech stack
2. Infer likely causes from the service type and alert
3. Generate the full runbook in Markdown

## Output format

```markdown
# Runbook: <Alert Name> — <Service Name>

**Alert**: [What fired]
**Severity**: P1 / P2
**Owner team**: [Team]
**Last updated**: [date]

## Impact

[What users experience when this fires]

## Quick checks (do these first)

1. [ ] Check [dashboard URL] — is this a known incident?
2. [ ] Check recent deployments: `git log --oneline -5`
3. [ ] Verify service health: `curl https://api.service.com/health`

## Diagnosis

### Step 1: Check error logs
```bash
# Datadog log query
service:my-service status:error @http.status_code:5*
```
Expected: [what to look for]

...

## Common causes

### Cause 1: [Name]
**Symptoms**: [how to recognize it]
**Fix**:
```bash
[resolution commands]
```

## Rollback
[How to roll back the last deploy]

## Escalation
- After 15 min unresolved: page [Name/Team] via [channel]
- Database issues: contact [DBA team]

## Post-incident
- [ ] Create follow-up ticket if > 5 min user impact
- [ ] Trigger postmortem if > 30 min P1
```
