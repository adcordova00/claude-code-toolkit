import { chromium } from "playwright";
import fs from "fs/promises";
import path from "path";
import yaml from "js-yaml";
import { z } from "zod";
import { requireConfig, commonEnvSchema } from "../shared/config.js";
import { Logger } from "../shared/logger.js";

const config = requireConfig(commonEnvSchema);
const logger = new Logger("workflow-automator", config.LOG_LEVEL);

// Workflow definition schema
const StepSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("navigate"), path: z.string() }),
  z.object({ type: z.literal("wait-for"), selector: z.string(), timeout: z.number().optional() }),
  z.object({
    type: z.literal("fill-form"),
    fields: z.array(z.object({ selector: z.string(), value: z.string() })),
  }),
  z.object({ type: z.literal("click"), selector: z.string(), force: z.boolean().optional() }),
  z.object({ type: z.literal("assert"), selector: z.string(), contains: z.string() }),
  z.object({
    type: z.literal("extract"),
    name: z.string(),
    selector: z.string(),
    attribute: z.string().optional(),
  }),
]);

const WorkflowSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  baseUrl: z.string(),
  steps: z.array(StepSchema),
  output: z
    .object({
      format: z.enum(["json", "screenshot", "both"]).default("json"),
      path: z.string(),
    })
    .optional(),
});

type Workflow = z.infer<typeof WorkflowSchema>;
type Step = z.infer<typeof StepSchema>;

function resolveEnvVars(value: string): string {
  return value.replace(/\$\{([^}]+)\}/g, (_, key) => {
    const val = process.env[key];
    if (!val) logger.warn(`Env var not set: ${key}`);
    return val ?? "";
  });
}

function resolveWorkflowEnvVars(workflow: Workflow): Workflow {
  return JSON.parse(resolveEnvVars(JSON.stringify(workflow)));
}

async function runStep(
  page: Parameters<typeof page["goto"]>[0] extends never ? never : Awaited<ReturnType<import("playwright").Browser["newPage"]>>,
  step: Step,
  context: Record<string, string>,
  baseUrl: string
): Promise<void> {
  switch (step.type) {
    case "navigate": {
      const url = step.path.startsWith("http") ? step.path : `${baseUrl}${step.path}`;
      await (page as any).goto(url, { waitUntil: "domcontentloaded" });
      logger.info("Navigated", { url });
      break;
    }
    case "wait-for":
      await (page as any).waitForSelector(step.selector, { timeout: step.timeout ?? 10_000 });
      logger.info("Element found", { selector: step.selector });
      break;
    case "fill-form":
      for (const field of step.fields) {
        const value = resolveEnvVars(field.value.replace(/\$\{ctx\.([^}]+)\}/g, (_, k) => context[k] ?? ""));
        await (page as any).fill(field.selector, value);
        logger.debug("Filled field", { selector: field.selector });
      }
      break;
    case "click":
      await (page as any).click(step.selector, { force: step.force });
      logger.info("Clicked", { selector: step.selector });
      break;
    case "assert": {
      const text = await (page as any).textContent(step.selector);
      if (!text?.includes(step.contains)) {
        throw new Error(`Assertion failed: "${step.selector}" does not contain "${step.contains}"`);
      }
      logger.info("Assertion passed", { selector: step.selector });
      break;
    }
    case "extract": {
      let value: string | null;
      if (step.attribute) {
        value = await (page as any).getAttribute(step.selector, step.attribute);
      } else {
        value = await (page as any).textContent(step.selector);
      }
      context[step.name] = value ?? "";
      logger.info("Extracted", { name: step.name, value });
      break;
    }
  }
}

async function main(): Promise<void> {
  const workflowArg = process.argv.find((a) => a.startsWith("--workflow="))?.split("=")[1];
  if (!workflowArg) {
    console.error("Usage: node automator.js --workflow=./workflows/my-flow.yaml");
    process.exit(1);
  }

  const rawYaml = await fs.readFile(path.resolve(workflowArg), "utf-8");
  const parsed = WorkflowSchema.parse(yaml.load(rawYaml));
  const workflow = resolveWorkflowEnvVars(parsed);

  logger.info("Starting workflow", { name: workflow.name });

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const context: Record<string, string> = {};
  const errors: string[] = [];

  try {
    for (const step of workflow.steps) {
      try {
        await runStep(page as any, step, context, workflow.baseUrl);
      } catch (err) {
        const msg = String(err);
        errors.push(msg);
        logger.error("Step failed", { step: step.type, error: msg });
        if (process.argv.includes("--fail-fast")) break;
      }
    }
  } finally {
    await browser.close();
  }

  const result = {
    workflow: workflow.name,
    timestamp: new Date().toISOString(),
    success: errors.length === 0,
    errors,
    extracted: context,
  };

  if (workflow.output) {
    const outputPath = path.resolve(workflow.output.path.replace("${timestamp}", Date.now().toString()));
    await fs.mkdir(path.dirname(outputPath), { recursive: true });
    await fs.writeFile(outputPath, JSON.stringify(result, null, 2), "utf-8");
    logger.info("Output saved", { path: outputPath });
  }

  logger.info("Workflow complete", result);
  process.exit(errors.length > 0 ? 1 : 0);
}

main();
