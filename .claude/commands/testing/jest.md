---
description: Generate Jest + React Testing Library tests for a React component.
---

# Generate Jest + React Testing Library Tests

## When to use

Use when writing tests for a React component or hook. Pass the component code or file path
in `$ARGUMENTS`. Generates tests following RTL best practices — tests that reflect how users
interact with the component, not implementation details.

## Instructions

Generate tests that follow the RTL testing philosophy: **test behavior, not implementation**.
Query elements the way users find them: by role, label, text — not by class names or test IDs
(test IDs only as a last resort).

**What to test**
- Renders correctly with required props (smoke test)
- User interactions: clicks, typing, form submissions
- Conditional rendering: loading state, error state, empty state, populated state
- Async behavior: data fetching, debounced inputs
- Accessibility: form labels, button text, error announcements

**Query priority (RTL official order)**
1. `getByRole` (most like a screen reader)
2. `getByLabelText` (form fields)
3. `getByPlaceholderText`
4. `getByText`
5. `getByDisplayValue`
6. `getByAltText` (images)
7. `getByTitle`
8. `getByTestId` (last resort)

**Patterns to follow**
- `userEvent` over `fireEvent` for realistic interactions (use `await userEvent.click()`)
- `waitFor` / `findBy*` for async updates — never arbitrary `setTimeout`
- Mock external dependencies (API calls) with `jest.fn()` or `msw` (Mock Service Worker)
- Each test should be independent — no shared mutable state between tests
- Descriptive test names: `"shows error message when email is invalid"`

**What NOT to test**
- Implementation details (component state, internal method calls)
- Third-party library internals
- Style/CSS (unless behavior depends on it)

## Steps

1. Read the component to understand: props, state, user interactions, async behavior
2. Identify test cases: happy path, loading, error, edge cases
3. Generate the test file with descriptive `describe` and `it` blocks

## Output format

```typescript
// === ComponentName.test.tsx ===
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ComponentName } from './ComponentName'

describe('ComponentName', () => {
  it('renders correctly with required props', () => { ... })
  it('shows loading state while fetching data', async () => { ... })
  // ...
})
```

List any setup needed (providers, mocks) after the code.
