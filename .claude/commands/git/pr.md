---
description: Push the branch, then create or update the GitHub PR with a generated description.
---

# Push Branch & Open Pull Request

## When to use

Use when you're ready to push your work and optionally open or update a PR. Handles the full
flow: pushing the branch, detecting whether a PR is needed, generating the description, and
creating or updating the PR via `gh`. Pass a ticket number or extra context in `$ARGUMENTS`.

## Requirements

- **`gh` CLI** must be installed and authenticated (`gh auth login`).
  Install: `winget install --id GitHub.cli` (Windows) / `brew install gh` (macOS).
  If `gh` is not available, the skill pushes the branch and stops — report this to the user.

## Instructions

Execute the full PR flow in this order:

### Step 1 — Verify the branch state

Run `git status` and check that there are no uncommitted changes. If there are, stop and
tell the user to commit first (offer to run `/git:commit`).

Also get the current branch name with `git branch --show-current` and the default branch
(usually `main` or `master`) with `git remote show origin | grep 'HEAD branch'`.

**If the current branch IS the default branch (e.g. `main`):** pushing here skips PR review
entirely — this is almost never what's intended. **Stop before pushing** and ask the user to
confirm: do they really want to push straight to `main`, or would they rather create a
feature branch first (`/git:branch`)? Only proceed with the push if they explicitly confirm
`main` is intentional (e.g. an approved hotfix). Never push to the default branch silently.

### Step 2 — Push the branch

Run `git push -u origin HEAD` and capture the output.

- If the push is rejected (non-fast-forward), do NOT force-push. Report the conflict and stop.

### Step 3 — Determine if a PR is needed

**If the current branch IS the default branch** (and the user confirmed in Step 1 that
pushing there was intentional): the push is the final step. Report: "Pushed directly to
`main` — no PR needed." Stop here.

**If the current branch is NOT the default branch:**
- Continue to steps 4 and 5.

### Step 4 — Analyze the diff

Run in parallel:
- `git log main..HEAD --oneline`
- `git diff main...HEAD`

### Step 5 — Generate the PR description

Write a description that a senior engineer with zero context can use to review the PR:

- **Summary**: 2–4 bullets — what changed and why
- **Changes**: grouped by area (Frontend, Backend, CI/CD, DB, etc.) with specific file/function callouts
- **Test plan**: numbered steps to verify the happy path and key edge cases
- **Screenshots**: placeholder section if UI files (`.tsx`, `.css`) are in the diff
- **Breaking changes**: only if the diff removes/renames API fields, endpoints, or requires a migration

Reference the ticket/issue from `$ARGUMENTS` if provided (`Closes #N` or `Refs #N`).

### Step 6 — Create or update the PR

Check if a PR already exists for this branch:

```bash
gh pr view --json number,url 2>/dev/null
```

**If no PR exists** — create it. **If a PR already exists** — update the body with `gh pr edit <number> --body`.

Use the subject of the latest conventional commit on the branch as the PR title.

#### Shell-specific syntax for multi-line body

Always prefer the Bash tool. If Bash is unavailable or the tool explicitly runs in PowerShell, use the matching syntax:

**Bash (preferred):**
```bash
gh pr create --title "feat(scope): subject" --body "$(cat <<'EOF'
## Summary
...
EOF
)"
```

**PowerShell (fallback):**
```powershell
gh pr create --title "feat(scope): subject" --body @'
## Summary
...
'@
```

> Note: In PowerShell here-strings the closing `'@` **must** be at column 0 (no leading whitespace).
> Never mix bash heredoc syntax inside PowerShell — it will cause a parser error.

Return the PR URL at the end.

## PR description format

```markdown
## Summary

- [What this PR does at a high level]
- [Why it was needed / what problem it solves]
- [Key design decision if non-obvious]

## Changes

**<Area>**
- `File`: specific change

## Test plan

1. [Concrete step for happy path]
2. [Edge case to verify]
3. [Regression: what should NOT happen]

## Screenshots

<!-- Add before/after screenshots for UI changes -->

## Breaking changes

<!-- List breaking API changes, removed fields, or required migrations -->
<!-- Remove section if none -->
```

## Examples

**On `main` branch, no confirmation yet:**
> You're on `main` — pushing here skips PR review. Do you want to push directly to `main`,
> or create a feature branch first with `/git:branch`?

**On `main` branch, user confirmed it's intentional:**
> Pushed directly to `main` — no PR needed.

**On feature branch, `$ARGUMENTS`:** `Closes #312 — user profile photo upload`

**PR title:** `feat(profile): add photo upload endpoint`

**PR body excerpt:**
```markdown
## Summary

- Adds `POST /api/users/{id}/photo` accepting multipart/form-data (max 5 MB)
- Resolves the missing avatar feature tracked in #312
- Files stored in S3; URL persisted in `users.photo_url`

## Changes

**Backend**
- `UserController`: new upload endpoint with size validation
- `S3StorageService`: wraps AWS SDK v2 multipart upload

**Database / Migrations**
- `V12__add_users_photo_url.sql`: nullable `photo_url varchar(500)` on `users`

Closes #312
```
