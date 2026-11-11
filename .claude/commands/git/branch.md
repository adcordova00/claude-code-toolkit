---
description: Create a git branch from a ticket, description, or task and switch to it.
---

# Create & Checkout Branch

## When to use

Use when starting new work. Pass the ticket number, description, or task in `$ARGUMENTS`.
The skill generates a name following team conventions, presents options, and creates the branch.

## Instructions

### Step 1 — Generate branch name options

Parse `$ARGUMENTS` to identify: ticket number (if any), type of work, key action.
Produce 2–3 options following these conventions:

- Format: `<type>/<ticket-or-scope>/<short-description>`
- Types: `feat`, `fix`, `hotfix`, `refactor`, `chore`, `docs`, `test`, `release`
- Ticket number: include if present (e.g., `feat/PROJ-123/add-photo-upload`)
- No ticket: use a short scope instead (e.g., `fix/auth/null-email-handling`)
- Description: kebab-case, max 4 words, imperative verb first (add, fix, remove, update, migrate)
- No special characters, no uppercase, no spaces — max 60 characters total

Type selection guide:
- New functionality → `feat`
- Bug fix → `fix`
- Urgent production fix → `hotfix`
- Code restructuring without behavior change → `refactor`
- Tooling, config, dependencies → `chore`
- Tests only → `test`

Present the options to the user and ask which one to use (or if they want a custom name).

### Step 2 — Confirm and create the branch

Once the user picks an option (or provides a custom name), always branch from the default branch
(`main` / `master`), not from wherever HEAD currently is. Execute this sequence:

```bash
# 1. Stash any uncommitted changes so they survive the branch switch
git stash   # skip if working tree is clean

# 2. Switch to the default branch and pull latest
git checkout main    # or master — use whichever is default
git pull origin main

# 3. Create the new branch from the now-clean, up-to-date default branch
git checkout -b <branch-name>

# 4. Restore the stashed changes onto the new branch
git stash pop   # skip if nothing was stashed
```

**Why this matters:** branching from a feature branch instead of `main` silently includes
all of that branch's commits in the new branch's diff, causing unexpected conflicts when
merging to `main` later.

- If the branch already exists, report the conflict and ask whether to switch to it instead (`git checkout <branch-name>`).
- Report the created branch name and current HEAD commit.

### Step 3 — Report

Confirm success:
```
Branch created: `<branch-name>`
From: main @ <short-sha>
Stash restored: yes / no
```

## Examples

**`$ARGUMENTS`:** `PROJ-312 — add photo upload to user profile`

**Presented options:**
```
1. feat/PROJ-312/add-photo-upload  ← recommended
2. feat/PROJ-312/user-photo-upload
3. feat/user/add-photo-upload
```

**After user picks option 1:**
```bash
git checkout -b feat/PROJ-312/add-photo-upload
```
```
Branch created: `feat/PROJ-312/add-photo-upload`
From: main @ a3f9c12
```

---

**`$ARGUMENTS`:** `Fix null pointer when email is missing in registration`

**Presented options:**
```
1. fix/auth/null-email-on-register  ← recommended
2. fix/registration/handle-null-email
3. fix/user/null-email-registration
```
