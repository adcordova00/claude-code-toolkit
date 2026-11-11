---
description: Refactor a React component to modern patterns without changing behavior.
---

# Refactor React Component

## When to use

Use when a component works but needs modernization: class → function, prop drilling → composition,
complex state → `useReducer`, render props → custom hooks, etc. Pass the code or describe the
target refactor in `$ARGUMENTS`.

## Instructions

Refactor the component while preserving its external behavior (same props API, same rendered output,
same side effects). Apply the most impactful improvement for the component's current state:

**Class → Function component**
- Convert lifecycle methods: `componentDidMount`→`useEffect(fn,[])`, `componentWillUnmount`→cleanup,
  `componentDidUpdate`→`useEffect(fn,[deps])`
- Convert `this.state` to `useState` or `useReducer` for complex state
- Convert `this.props` to destructured function params
- Handle `shouldComponentUpdate`/`PureComponent` with `React.memo`

**Eliminate prop drilling**
- If props pass through 2+ intermediate components without being used: extract a context or
  restructure using component composition (render children, pass components as props)
- Prefer composition over context when the intermediate components can be flattened

**Complex state → useReducer**
- When: 3+ related state variables that update together, or state that transitions through defined states
- Extract the reducer to a separate file with typed actions

**Extract business logic to custom hooks**
- Any `useEffect` that fetches data → `useQuery` pattern hook (or use React Query/TanStack Query)
- Any form state management → `useForm` hook
- Any event subscription → dedicated hook with proper cleanup

**Memoization (only when there's evidence of a problem)**
- Don't add `React.memo`/`useMemo`/`useCallback` preemptively
- Add them only if the component appears in a list, receives object/array props that re-create,
  or is provably expensive to render

## Steps

1. Identify the primary refactor opportunity
2. Produce the refactored code with inline comments explaining key changes
3. List any props API changes (there should be none, or flag them explicitly)
4. Note any follow-up refactors that are out of scope but worth tracking

## Output format

Produce the complete refactored component, followed by:

```
## Changes made
- [change 1]
- [change 2]

## API changes
- None (behavior preserved) OR [list any changes]

## Follow-up suggestions
- [out-of-scope improvements worth tracking]
```
