---
description: Audit a custom React hook for correctness, dependency arrays, and reusability.
---

# Audit Custom React Hook

## When to use

Use when reviewing or debugging a custom hook. Pass the hook code or file path in `$ARGUMENTS`.
Especially useful for hooks with `useEffect`, `useCallback`, `useMemo`, or complex state logic.

## Instructions

Audit the hook with these specific concerns:

**Dependency array correctness**
- Every value used inside `useEffect`/`useCallback`/`useMemo` that comes from outside the callback
  must be in the dependency array (props, state, context, external variables, functions)
- Flag missing deps (causes stale closures) and unnecessary deps (causes excessive re-runs)
- Functions defined outside the hook that are used inside effects need to be stable (wrapped in
  `useCallback`) or moved inside the effect

**Effect correctness**
- Does the effect clean up after itself? (timers, subscriptions, abort controllers, event listeners)
- Does it handle the case where the component unmounts before an async operation completes?
- Does it fetch on mount with no deps when it should re-fetch on param changes?

**State design**
- Is each piece of state truly independent, or should some be combined? (e.g., `{ data, loading, error }`)
- Are derived values stored in state when they could be computed? (`const isValid = value.length > 0`)
- Is `useReducer` more appropriate than multiple `useState` calls for related state?

**Reusability**
- Does the hook expose the right interface? (not too much, not too little)
- Is it parameterized where it should be? (e.g., accepts a URL rather than hardcoding it)
- Does it reset properly when key params change?

**Race conditions**
- Multiple rapid calls (e.g., fast typing in search) — does the hook handle cancellation?
- Suggest `AbortController` for fetch-based effects or cleanup flags for boolean guards

## Steps

1. Read the full hook, map all state and effects
2. For each effect: check deps, check cleanup, check async safety
3. For each `useCallback`/`useMemo`: verify the optimization is actually needed
4. Suggest refactors with concrete code

## Output format

```
## Hook Audit: <hookName>

### Dependency array issues
- [useEffect at line X]: missing `<dep>` — [why it causes a bug]
- [useCallback at line Y]: `<dep>` is unnecessary — [why]

### Effect issues
- [effect]: no cleanup for [subscription/timer]. Fix: [code]

### State design
- [suggestion with rationale]

### Race condition risks
- [description]. Fix: [AbortController / cleanup flag approach]

### Reusability improvements
- [suggestion]

### Looks good
- [what's well done]
```
