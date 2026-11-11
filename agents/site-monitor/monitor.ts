import { chromium } from "playwright";
import { requireConfig, monitorEnvSchema } from "../shared/config.js";
import { Logger } from "../shared/logger.js";
import { checkAvailability } from "./checks/availability.js";
import { checkContentDiff } from "./checks/content-diff.js";
import { checkPerformance } from "./checks/performance.js";
import { sendSlackAlert } from "./alerts/slack.js";
import { sendDatadogEvent } from "./alerts/datadog.js";

const config = requireConfig(monitorEnvSchema);
const logger = new Logger("site-monitor", config.LOG_LEVEL);

const urls = config.MONITORED_URLS.split(",").map((u) => u.trim()).filter(Boolean);

interface CheckResult {
  url: string;
  availability: Awaited<ReturnType<typeof checkAvailability>>;
  contentDiff?: Awaited<ReturnType<typeof checkContentDiff>>;
  performance?: Awaited<ReturnType<typeof checkPerformance>>;
}

async function runChecks(url: string): Promise<CheckResult> {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    const availability = await checkAvailability(page, url, logger);
    const contentDiff = await checkContentDiff(url, logger);
    const performance = availability.ok
      ? await checkPerformance(page, url, logger)
      : undefined;

    return { url, availability, contentDiff, performance };
  } finally {
    await browser.close();
  }
}

async function main(): Promise<void> {
  logger.info("Starting site monitor", { urls, count: urls.length });

  let anyFailed = false;

  for (const url of urls) {
    logger.info("Checking URL", { url });

    try {
      const result = await runChecks(url);
      const failed =
        !result.availability.ok ||
        result.contentDiff?.changed ||
        result.performance?.violations?.length;

      if (failed) {
        anyFailed = true;
        logger.warn("Check failed", { url, result });

        if (config.SLACK_WEBHOOK_URL) {
          await sendSlackAlert(config.SLACK_WEBHOOK_URL, url, result, logger);
        }
        if (config.DD_API_KEY && config.DD_APP_KEY) {
          await sendDatadogEvent(url, result, logger);
        }
      } else {
        logger.info("All checks passed", { url });
      }
    } catch (err) {
      anyFailed = true;
      logger.error("Unexpected error checking URL", { url, error: String(err) });
    }
  }

  process.exit(anyFailed ? 1 : 0);
}

main();
