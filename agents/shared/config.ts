import { z } from "zod";
import { config } from "dotenv";
import path from "path";

// Load .env from repo root (two levels up from agents/shared/)
config({ path: path.resolve(import.meta.dirname, "../../.env") });

export function requireConfig<T extends z.ZodTypeAny>(schema: T): z.infer<T> {
  const result = schema.safeParse(process.env);
  if (!result.success) {
    const missing = result.error.issues
      .map((i) => `  ${i.path.join(".")}: ${i.message}`)
      .join("\n");
    throw new Error(`Missing or invalid environment variables:\n${missing}`);
  }
  return result.data;
}

// Common env schemas — compose these in each agent's config
export const commonEnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("info"),
});

export const stagingEnvSchema = commonEnvSchema.extend({
  STAGING_URL: z.string().url("STAGING_URL must be a valid URL"),
});

export const monitorEnvSchema = commonEnvSchema.extend({
  MONITORED_URLS: z.string().min(1, "MONITORED_URLS must contain at least one URL"),
  SLACK_WEBHOOK_URL: z.string().url().optional(),
  DD_API_KEY: z.string().optional(),
  DD_APP_KEY: z.string().optional(),
});
