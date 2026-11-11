import { test, expect } from "@playwright/test";

// Smoke tests: verify the most critical user-facing paths are working.
// Keep this suite fast (< 2 minutes) — it runs on every deploy.
//
// Replace these placeholder tests with your actual critical paths.

test.describe("Smoke", () => {
  test("home page loads and returns 200", async ({ page }) => {
    const response = await page.goto("/");
    expect(response?.status()).toBe(200);
    await expect(page).toHaveTitle(/.+/); // any non-empty title
  });

  test("health check endpoint is healthy", async ({ request }) => {
    const response = await request.get("/actuator/health");
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.status).toBe("UP");
  });

  test("login page renders form elements", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /sign in|log in/i })).toBeVisible();
  });

  // TODO: Add authentication smoke test
  // test("authenticated user can reach dashboard", async ({ page }) => { ... });
});
