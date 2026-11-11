---
description: Open a browser with Playwright, reproduce a described bug, and diagnose the root cause from dev tools.
---

# Playwright Debugger

## When to use

Use when you've read the code and still can't identify the root cause of a bug. Describe the
bug in `$ARGUMENTS` and this skill will drive a real browser to reproduce it, inspect the
console, network, and DOM at the moment of failure, and propose a concrete fix.

Requires the Playwright MCP server active (configured in `.claude/settings.json`).

## Instructions

You are acting as a senior front-end debugger. Your job is not to guess — it is to observe
the browser state at the exact moment the bug occurs and reason from evidence.

### Step 1 — Parse the bug description

Read `$ARGUMENTS` carefully. Extract:
- **URL** to navigate to (ask the user if not mentioned — default to `$STAGING_URL` or `http://localhost:3000`)
- **Reproduction steps** — the exact sequence of actions that triggers the bug
- **Expected behavior** — what should happen
- **Actual behavior** — what is happening instead

If the description is ambiguous, ask one clarifying question before opening the browser.

### Step 2 — Open the browser and reproduce

Use the Playwright MCP to:
1. Launch a Chromium browser (headed, so you can observe)
2. Navigate to the target URL
3. Execute each reproduction step exactly as described — do not skip or shortcut

After each step that is likely to trigger the bug, **pause and capture a screenshot**.

### Step 3 — Inspect the dev tools at the failure point

At the moment the bug manifests (or immediately after), check all of the following:

**Console tab — highest priority**
- Any `Error:` or `Uncaught` exceptions → note the message, file, and line number
- `Warning:` messages that could indicate state mismatches or missing dependencies
- `Failed to load resource` entries

**Network tab**
- Any requests with status `4xx` or `5xx` → capture URL, method, request payload, and response body
- Any requests that are `pending` longer than expected (potential race condition)
- CORS errors or blocked requests

**DOM / Elements**
- Inspect the element involved in the bug — check its attributes, classes, and `aria-*` values
- If it's a form: check input `value`, `disabled`, `readonly` states
- If it's a list: check if items are rendered, missing, or duplicated

**Application tab**
- `localStorage` and `sessionStorage` — check for stale or missing keys that the component depends on
- Cookies — check for expired or missing auth tokens if the bug involves auth

**React DevTools** (if the app uses React)
- Find the component that owns the failing UI
- Check its `state` and `props` at the time of failure
- Check if a hook dependency array is causing stale closures

### Step 4 — Form a hypothesis

After gathering all observations, identify the single most likely root cause. Categorize it:

| Category | Examples |
|----------|---------|
| **State bug** | Stale closure, missing dep in `useEffect`, wrong initial state |
| **Network bug** | Wrong endpoint, missing auth header, incorrect payload shape |
| **Timing bug** | Race condition, async without await, event fires before mount |
| **DOM bug** | Wrong selector, element not in viewport, z-index/overlay blocking click |
| **Data bug** | `null`/`undefined` not handled, wrong type coercion, missing fallback |
| **Auth bug** | Token expired, missing cookie, wrong CORS config |

### Step 5 — Propose a fix

Write a specific, minimal fix:
- Point to the exact file and line
- Show the code before and after
- Explain why this change resolves the observed failure
- If multiple hypotheses remain, rank them and propose a fix for the most likely one first

## Steps

1. Read `$ARGUMENTS` → extract URL, reproduction steps, expected vs actual behavior
2. Open browser via Playwright MCP and navigate to URL
3. Execute reproduction steps, capturing a screenshot at each critical action
4. Inspect console, network, DOM, storage, and React state at the failure point
5. Document all observed evidence (errors, failed requests, wrong state)
6. Identify root cause category and form a hypothesis
7. Propose a targeted code fix with before/after snippet

## Output format

```
## Bug Investigation: <one-line bug summary>

### Reproduction confirmed
[Screenshot or description of what was observed in the browser]

### Evidence collected

**Console errors:**
- [Error message — file:line]

**Network failures:**
- [METHOD URL — status — response body excerpt]

**DOM state at failure:**
- [Element, attribute, or value that is wrong]

**Storage / auth:**
- [Any relevant stale or missing value]

### Root cause

Category: <State bug | Network bug | Timing bug | DOM bug | Data bug | Auth bug>

[1–3 sentences explaining exactly why this causes the observed behavior]

### Proposed fix

File: `src/path/to/file.tsx` line XX

**Before:**
```tsx
[current code]
```

**After:**
```tsx
[fixed code]
```

**Why this works:** [one sentence]
```

## Examples

**`$ARGUMENTS`:** `On http://localhost:3000/checkout, clicking "Place Order" shows a spinner
that never resolves. Expected: order confirmation screen. Actual: spinner forever.`

Claude navigates to `/checkout`, fills in the form, clicks "Place Order", and observes:
- Console: `Uncaught TypeError: Cannot read properties of undefined (reading 'id')` in `OrderService.ts:42`
- Network: `POST /api/orders` returns `200` but the response handler crashes before updating state

**Output excerpt:**
```
### Root cause
Category: State bug

OrderService.ts:42 reads `user.id` but the user object is not yet resolved from the
async auth context at the time the submit handler fires. The promise is awaited for
the API call but not for the user lookup, causing a stale undefined reference.

### Proposed fix
File: `src/services/OrderService.ts` line 42

Before:
  const order = await createOrder({ userId: user.id, items });

After:
  const resolvedUser = await getUser();
  const order = await createOrder({ userId: resolvedUser.id, items });
```
