---
description: Stage changes, generate a conventional commit message, and execute the commit.
---

# Stage & Commit with Conventional Message

## When to use

Use when you have changes ready to commit (staged or unstaged). This skill handles the full
flow: staging, message generation, and committing. Pass a ticket number or context in `$ARGUMENTS`.

## Instructions

Execute the full commit flow in this order:

### Step 0 — Verify branch safety

Before doing anything else, run `git branch --show-current` and compare it against the
repo's default branch (`git remote show origin | grep 'HEAD branch'`, usually `main` or
`master`).

- **If the current branch IS the default branch**: **stop** — do not stage or commit
  anything yet. Tell the user they're on `main`/`master` and offer to run `/git:branch`
  first to create a feature branch. Only commit directly to the default branch if the
  user explicitly confirms that's what they want (rare — e.g. an approved one-line hotfix
  or a solo-maintained repo with no branch workflow). Never assume this silently.
- **Otherwise**: continue to Step 0.5.

### Step 0.5 — Pre-commit quality gate

Before touching git, run the project's type-check **and lint** commands to catch errors early.
Detect which tools are available by reading `package.json` scripts:

- **TypeScript**: run `tsc --noEmit` (or the `type-check` script if present)
- **Lint**: run `eslint` (or the `lint` script if present) — **treat errors as blocking**; fix them before committing

If **type-check or lint fails**:
1. Show the user the errors clearly.
2. **Fix every error** before proceeding. Common quick fixes:
   - Unused import → remove the import line
   - Unused eslint-disable directive → remove the comment
   - Missing useEffect dependency → add the variable to the dep array (verify it won't cause an infinite loop first)
   - Explicit `any` without suppress → add a type or narrow the cast
3. Re-run the failing check to confirm it passes.
4. Only then continue to Step 1.

> Why: Lint errors that slip past local commits fail CI on the PR, forcing a fixup commit.
> Running lint locally costs 5 seconds; a broken CI run costs 5 minutes.

### Step 1 — Assess the working tree

Run `git status` and `git diff` (unstaged) plus `git diff --staged` (staged) in parallel.

- If **nothing is staged and nothing is modified**: report "nothing to commit" and stop.
- If there are **unstaged changes**: stage them with `git add` by naming specific files
  (never `git add -A` blindly — skip `.env`, secrets, large binaries, and generated lockfiles
  unless they were explicitly modified as part of the task). Show the user which files you are staging.
- If **everything is already staged**: proceed directly to step 2.

### Step 2 — Generate the commit message

Analyze the full diff holistically — understand the intent, not just the lines changed.

Produce a message that:
- Uses the correct **type**: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `perf`, `ci`, `build`
- Includes an optional **scope** when changes are localized (component, module, layer)
- Writes a **subject line** in imperative mood, lowercase, no period, max 72 characters
- Adds a **body** (blank line separator) when the why or context is non-obvious
- Adds `BREAKING CHANGE:` footer if the change breaks backward compatibility
- References issue numbers as `Closes #123` or `Refs #123` when mentioned in `$ARGUMENTS`

The subject line must explain WHAT changed semantically, not what files were touched.

### Step 3 — Execute the commit

Run `git commit -m` passing the message via a heredoc so multi-line messages are preserved
correctly. Append the Co-Authored-By trailer using **your current model name** (never hardcode
a version — it goes stale the moment the model is upgraded):

```
Co-Authored-By: Claude <current model name> <noreply@anthropic.com>
```

Report the resulting commit hash and subject line.

## Commit message format

```
<type>(<scope>): <subject>

<body — only if needed>

<footer — only if needed>

Co-Authored-By: Claude <current model name> <noreply@anthropic.com>
```

## Examples

**Unstaged changes:** JWT validation added to auth filter, session auth removed

**Flow:**
1. `git add src/auth/AuthFilter.java src/auth/JwtService.java`
2. Commit with:
```
feat(auth): replace session auth with JWT validation

Removes HttpSession dependency and validates Bearer tokens on every
request. Token expiry and signature verification handled by JwtService.

Closes #241

Co-Authored-By: Claude <current model name> <noreply@anthropic.com>
```

**Already staged:** Null pointer fix in UserService

**Flow:**
1. Nothing to stage — proceed directly.
2. Commit with:
```
fix(user): handle null email in UserService.findByEmail

Co-Authored-By: Claude <current model name> <noreply@anthropic.com>
```

**On the default branch (`main`):** changes are sitting uncommitted on `main`

**Flow:**
1. `git branch --show-current` → `main`
2. Stop. Report: "You're on `main` — want me to create a feature branch first with `/git:branch`?"
3. Do not stage or commit until the user answers.
