---
description: Generate a Playwright E2E test using page objects for a described user flow.
---

# Generate Playwright E2E Test

## When to use

Use when writing an E2E test for a user journey. Pass the flow description or feature name
in `$ARGUMENTS` (e.g., "user registration and email verification flow"). Generates tests using
the Page Object Model and Playwright best practices.

## Instructions

Generate a Playwright test suite following these conventions:

**Page Object Model**
- Each page or major UI section gets its own Page Object class
- Page Objects expose user-intent methods (`login()`, `submitOrder()`) not technical ones (`clickButton()`)
- Page Objects return `this` or the next page for chaining
- Locators defined as class properties using `page.getByRole`, `page.getByLabel`, `page.getByTestId`
- No assertions inside Page Objects — keep them in tests

**Test structure**
- `test.describe` groups related scenarios
- Each `test` is a complete, independent scenario (no shared state that mutates)
- Use `test.beforeEach` for navigation and setup, not for state that carries over
- Use `page.goto()` at the start of each test or `beforeEach`

**Locator strategy (in priority order)**
1. `getByRole('button', { name: 'Submit' })` — role + accessible name
2. `getByLabel('Email address')` — for form fields
3. `getByText('Submit order')` — for text content
4. `getByTestId('submit-btn')` — only when no semantic query works

**Assertions**
- Use `expect(locator).toBeVisible()` not `expect(await locator.count()).toBe(1)`
- `toHaveURL`, `toHaveTitle` for navigation assertions
- `toContainText` for flexible text matching
- Always await assertions — they auto-retry until timeout

**Async / dynamic content**
- `page.waitForURL()` after navigation actions
- `page.waitForLoadState('networkidle')` for SPA route changes (use sparingly)
- `expect(locator).toBeVisible()` auto-retries — prefer this over explicit waits

**Authentication**
- Use `storageState` to pre-authenticate and skip login in most tests
- Only the auth test itself should go through the login UI

## Steps

1. Parse `$ARGUMENTS` to understand the user flow
2. Identify pages/components involved → design Page Object classes
3. Write the happy path test + at least 2 edge cases or error scenarios

## Output format

```typescript
// === pages/LoginPage.ts ===
// === pages/DashboardPage.ts ===
// === tests/user-login.spec.ts ===
```

Each file as a labeled TypeScript block.
