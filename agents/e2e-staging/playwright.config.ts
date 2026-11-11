import { defineConfig, devices } from "@playwright/test";
import { config } from "dotenv";
import path from "path";

config({ path: path.resolve(import.meta.dirname, "../../.env") });

const STAGING_URL = process.env.STAGING_URL ?? "http://localhost:3000";

export default defineConfig({
  testDir: "./tests",
  fullyParallel: false,
  retries: 2,
  workers: 3,
  timeout: 30_000,
  expect: { timeout: 10_000 },

  reporter: [
    ["html", { outputFolder: "playwright-report", open: "never" }],
    ["json", { outputFile: "report.json" }],
    ["github"],
  ],

  use: {
    baseURL: STAGING_URL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "on-first-retry",
  },

  projects: [
    {
      name: "smoke",
      testMatch: "**/smoke.spec.ts",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "regression",
      testMatch: "**/regression.spec.ts",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
