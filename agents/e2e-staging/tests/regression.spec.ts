import { test, expect } from "@playwright/test";

// Regression tests: broader coverage of user flows.
// These run on schedule or before major releases (not necessarily on every commit).
//
// Replace these with actual user flows critical to your application.

test.describe("Regression", () => {
  test.describe("Navigation", () => {
    test("all main nav links resolve without errors", async ({ page }) => {
      await page.goto("/");
      // TODO: Update selectors to match your nav structure
      const navLinks = page.locator("nav a");
      const count = await navLinks.count();
      expect(count).toBeGreaterThan(0);

      for (let i = 0; i < count; i++) {
        const link = navLinks.nth(i);
        const href = await link.getAttribute("href");
        if (!href || href.startsWith("#") || href.startsWith("mailto:")) continue;

        const response = await page.goto(href);
        expect(response?.status(), `Link ${href} should return 2xx`).toBeLessThan(400);
      }
    });
  });

  test.describe("Forms", () => {
    test("contact/feedback form shows validation errors on empty submit", async ({ page }) => {
      // TODO: Update selector to match your form URL/selector
      await page.goto("/contact");
      await page.getByRole("button", { name: /submit|send/i }).click();
      await expect(page.getByRole("alert")).toBeVisible();
    });
  });

  test.describe("API availability", () => {
    test("key API endpoints return expected status codes", async ({ request }) => {
      const endpoints = [
        { path: "/api/v1/health", expected: 200 },
        // TODO: Add your project's key endpoints
      ];

      for (const { path, expected } of endpoints) {
        const response = await request.get(path);
        expect(response.status(), `${path} should return ${expected}`).toBe(expected);
      }
    });
  });
});
