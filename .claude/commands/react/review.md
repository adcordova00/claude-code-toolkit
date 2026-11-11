---
description: Review a React component for correctness, performance, and modern patterns.
---

# Review React Component

## When to use

Use when you want a thorough review of a React component before merging or shipping. Pass
the component code or file path in `$ARGUMENTS`. Works for both class and functional components
but assumes modern React (18+) patterns are the target.

## Instructions

Review the component with the mindset of a senior React engineer. Evaluate:

**Correctness**
- Missing or wrong dependency arrays in `useEffect`, `useCallback`, `useMemo`
- State mutations (modifying objects/arrays directly instead of returning new ones)
- Stale closures trapping outdated values
- Conditional hook calls (hooks inside conditions, loops, or callbacks)
- Missing cleanup in `useEffect` (subscriptions, timers, event listeners)
- Key prop issues in lists (using index as key when items can reorder/delete)

**Performance**
- Components that re-render on every parent render without memoization
- Expensive computations not wrapped in `useMemo`
- Stable callbacks not wrapped in `useCallback` when passed to memoized children
- Unnecessary state (values derivable from existing state/props)
- Context that causes too many consumers to re-render (split context by update frequency)

**Design**
- Components doing too many things (more than one clear responsibility)
- Prop drilling deeper than 2-3 levels (consider context or composition)
- Business logic mixed into the UI layer (extract to custom hooks or services)
- Hard-coded values that should be props or constants
- Missing loading, error, and empty states

**Accessibility**
- Interactive elements not using semantic HTML (`div` as button without role/keyboard support)
- Missing `alt` on images, `aria-label` on icon buttons, `htmlFor` on form labels

## Steps

1. Read the entire component before commenting
2. Trace the data flow: where does state live, how does it flow down, how do events flow up
3. Mentally render the component in: initial load, loading state, error state, empty data, populated data
4. Flag issues by severity: Critical → Major → Minor

## Output format

```
## Component Review: <ComponentName>

### Critical
- [issue]: [explanation]. Fix: [concrete code suggestion]

### Major
- [issue]: [explanation]. Fix: [concrete suggestion]

### Minor
- [issue]: [suggestion]

### What's solid
- [2-3 genuine positives]
```
