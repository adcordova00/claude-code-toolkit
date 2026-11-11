---
description: Review a GitHub Actions workflow for security vulnerabilities, efficiency, and correctness.
---

# Review GitHub Actions Workflow

## When to use

Use when auditing an existing workflow before merging or hardening it. Pass the workflow YAML
file or its path in `$ARGUMENTS`. Security issues are the highest priority.

## Instructions

Review the workflow for these categories:

**Security (critical)**
- `pull_request_target` with `actions/checkout` of the PR head — allows arbitrary code execution
  from forks in a trusted context. Only safe if you never run untrusted code in that context.
- Secrets logged or echoed: `echo ${{ secrets.TOKEN }}` prints the secret in logs
- `permissions: write-all` or missing `permissions` block (defaults vary by repo settings)
- Pinning actions by mutable tag (`@v4`) vs. commit SHA (`@a1b2c3d`) — tags can be moved
  (at minimum, check if the action author is trusted)
- Using `${{ github.event.issue.title }}` or similar user-controlled input in `run:` steps
  without sanitization → script injection
- Third-party actions from untrusted authors with broad permissions

**Efficiency**
- Missing dependency caching (`actions/cache`) — each run reinstalls from scratch
- Sequential jobs that could run in parallel
- Uploading build artifacts that are never downloaded
- Running expensive jobs on every push (including `doc:` commits that don't affect tests)
- No `timeout-minutes` — jobs can hang and consume minutes indefinitely

**Correctness**
- `npm install` instead of `npm ci` in CI (non-deterministic, ignores lockfile)
- Missing `--watchAll=false` or `--ci` flag on Jest (runs interactively and hangs)
- Health checks missing on service containers (DB may not be ready when tests start)
- Environment variables set globally when only one job needs them
- `continue-on-error: true` masking real failures

**Maintainability**
- Duplicated steps across jobs (extract to composite action or reusable workflow)
- Hardcoded versions (`node: '18'`) without a comment explaining why that version is pinned
- Missing `workflow_dispatch` trigger for manual reruns

## Steps

1. Read the full workflow
2. Check each trigger, job, step for the issues above
3. Flag by severity: Critical (security) → Major (correctness) → Minor (efficiency)

## Output format

```
## Workflow Review: <filename>

### Critical (security)
- [step/line]: [vulnerability]. Fix: [concrete change]

### Major (correctness)
- [issue and fix]

### Minor (efficiency/maintainability)
- [suggestion]

### Looks good
- [positives]
```
