import type { Page } from "playwright";
import type { Logger } from "../../shared/logger.js";

export interface AvailabilityResult {
  ok: boolean;
  statusCode?: number;
  ttfb?: number;
  renderTime?: number;
  error?: string;
}

export async function checkAvailability(
  page: Page,
  url: string,
  logger: Logger
): Promise<AvailabilityResult> {
  const start = Date.now();

  try {
    const response = await page.goto(url, {
      waitUntil: "domcontentloaded",
      timeout: 15_000,
    });

    const ttfb = Date.now() - start;

    if (!response) {
      return { ok: false, error: "No response received" };
    }

    const statusCode = response.status();
    if (statusCode >= 400) {
      return { ok: false, statusCode, ttfb, error: `HTTP ${statusCode}` };
    }

    // Check for common error page indicators
    const bodyText = await page.textContent("body").catch(() => "");
    const errorIndicators = ["500 Internal Server Error", "502 Bad Gateway", "503 Service Unavailable"];
    const hasErrorIndicator = errorIndicators.some((e) => bodyText?.includes(e));

    if (hasErrorIndicator) {
      return { ok: false, statusCode, ttfb, error: "Error page detected in body" };
    }

    const renderTime = Date.now() - start;
    logger.debug("Availability check passed", { url, statusCode, ttfb, renderTime });
    return { ok: true, statusCode, ttfb, renderTime };
  } catch (err) {
    return { ok: false, error: String(err) };
  }
}
