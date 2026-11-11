---
description: Analyze a React component or app for render performance issues and optimization opportunities.
---

# React Performance Analysis

## When to use

Use when a component feels slow, causes jank, or you suspect unnecessary re-renders. Pass
the component code or describe the performance symptom in `$ARGUMENTS`. Produces concrete,
evidence-based optimizations — not premature micro-optimizations.

## Instructions

Analyze for the most common React performance problems, in order of impact:

**Unnecessary re-renders (highest impact)**
- Parent re-renders causing all children to re-render even when their props didn't change
  → Identify components that should be wrapped in `React.memo`
- Object/array literals or inline functions in JSX props that create new references every render:
  `<Comp style={{ color: 'red' }} />` → extract to constant or `useMemo`
- Context consumers that re-render when unrelated context values change
  → Split context by update frequency or use selectors

**Expensive computations**
- Filtering, sorting, or transforming large lists inside the render function
  → Wrap in `useMemo` with correct dependencies
- Derived state computed from props without memoization

**List rendering**
- Long lists rendered without virtualization (hundreds of DOM nodes)
  → Suggest `react-window` or `react-virtual`
- Keys using array index when the list can be filtered/sorted/reordered

**Waterfall renders**
- Sequential data fetches (fetch A, then fetch B, then render)
  → Parallelize with `Promise.all` or React 18 Suspense + concurrent features

**Bundle size (if imports are visible)**
- Importing entire libraries when only one function is needed
  → Suggest named imports or lighter alternatives

**Do not suggest:**
- `React.memo` on every component (only where there's evidence of re-render cost)
- `useMemo` for cheap computations (the overhead can exceed the savings)
- Preemptive optimizations without a measured problem

## Steps

1. Identify the component tree structure from the code
2. Trace what causes re-renders (state changes, context, parent renders)
3. Identify expensive operations in the render path
4. Prioritize: tackle the highest-impact issues first
5. For each fix, explain WHY it helps (not just what to change)

## Output format

```
## Performance Analysis: <ComponentName>

### High impact
- [Issue]: [Why it causes a perf problem]
  Fix:
  ```jsx
  [code suggestion]
  ```

### Medium impact
- [Issue]: [Explanation]. Fix: [suggestion]

### Low impact / consider only if measured
- [suggestion]

### No issues found
- [what's already efficient]
```
