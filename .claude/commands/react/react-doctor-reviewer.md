---
description: Run react-doctor diagnostics on the project and apply the suggested fixes automatically.
---

# React Doctor — Diagnostic & Auto-fix

## When to use

Use when you want a full health check of a React codebase and want suggested fixes applied
automatically. `react-doctor` scans for deprecated patterns, missing best practices, and
common anti-patterns across all components. Pass an optional path in `$ARGUMENTS` to limit
the scan scope (e.g., `src/components`), or leave empty to scan the whole project.

## Instructions

Run `react-doctor` against the project, parse every finding, and apply fixes directly to
the source files where the fix is safe to automate. For findings that require human judgment,
report them clearly with a concrete recommendation.

### Step 1 — Install and run react-doctor

Check if `react-doctor` is available; install it on-the-fly via npx if not:

```bash
npx react-doctor@latest $ARGUMENTS
```

If the project uses `react-scripts`, also run with warnings included:
```bash
npx react-doctor@latest --include-warnings $ARGUMENTS
```

Capture the full output. If the command fails because no React project is detected, confirm
the current working directory is the project root and try again.

### Step 2 — Parse findings by category

Group the output into these categories:

| Category | Auto-fixable? |
|----------|--------------|
| Missing `key` prop on list elements | ✅ Yes — add stable key |
| Deprecated lifecycle methods (`componentWillMount`, `componentWillReceiveProps`, etc.) | ✅ Yes — migrate to safe alternatives |
| `findDOMNode` usage | ✅ Yes — replace with `ref` |
| Missing `displayName` on components | ✅ Yes — add from variable name |
| Direct state mutation (`this.state.x = ...`) | ✅ Yes — replace with `setState` |
| `React.PropTypes` (removed in React 15.5+) | ✅ Yes — import from `prop-types` package |
| String refs (`ref="myRef"`) | ✅ Yes — replace with `React.createRef()` or `useRef` |
| Missing dependency arrays in hooks | ⚠️ Partial — add deps but flag for human review |
| Unsafe `dangerouslySetInnerHTML` without sanitization | ❌ No — flag for human review |
| Inline function definitions in JSX causing re-renders | ❌ No — flag with `useCallback` suggestion |
| Missing error boundaries around async data | ❌ No — flag with boundary example |

### Step 3 — Apply safe auto-fixes

For each **auto-fixable** finding:
1. Read the affected file
2. Apply the minimal targeted fix — do not refactor beyond the specific issue
3. Preserve all surrounding code exactly as-is
4. Add a one-line comment only if the change is non-obvious

**Key fix rules:**
- For list `key` props: prefer `item.id`, then `item.slug`, then `item.name` — **never** use array
  index unless the list is static and never reorders
- For deprecated lifecycles: `componentWillMount` → `componentDidMount`,
  `componentWillReceiveProps` → `getDerivedStateFromProps` or `componentDidUpdate`
- For string refs: `ref="myRef"` → `this.myRef = React.createRef()` in constructor + `ref={this.myRef}`

### Step 4 — Report findings needing human review

For non-auto-fixable findings produce a clear report with: file and line, what was found,
recommended fix as a code snippet, and why it can't be auto-applied.

## Steps

1. Run `npx react-doctor@latest $ARGUMENTS` and capture output
2. If no findings: report the project is healthy and stop
3. For each finding: classify as auto-fixable or needs-review
4. Apply all auto-fixable changes (read file → targeted edit → confirm)
5. Report a final summary of what was fixed and what needs human attention

## Output format

```
## React Doctor Results

### Auto-fixed (X issues)
- ✅ **src/components/UserList.jsx:14** — Added `key={user.id}` to list element
- ✅ **src/pages/Profile.jsx:8** — Replaced `componentWillMount` with `componentDidMount`

### Needs human review (Y issues)
- ⚠️ **src/components/HtmlContent.jsx:23** — `dangerouslySetInnerHTML` used without sanitization
  Recommendation: wrap content with `DOMPurify.sanitize(content)` before rendering
  ```jsx
  <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(content) }} />
  ```

### Summary
- Files scanned: X
- Issues found: Y  |  Auto-fixed: Z  |  Needs review: W
- Project health: 🟢 Good / 🟡 Needs attention / 🔴 Critical issues found
```

## Examples

**`$ARGUMENTS`:** *(empty — scans the whole project)*

**`$ARGUMENTS`:** `src/components/legacy` — limits scan to the legacy folder

**`$ARGUMENTS`:** `src/features/checkout/CartSummary.jsx` — scans a single file
