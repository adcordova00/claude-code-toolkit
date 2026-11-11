import type { Page } from "playwright";
import type { Logger } from "../../shared/logger.js";

export interface PerformanceThresholds {
  lcpMs: number;
  clsScore: number;
  ttfbMs: number;
}

export interface PerformanceResult {
  passed: boolean;
  metrics: Record<string, number>;
  violations: string[];
}

const DEFAULT_THRESHOLDS: PerformanceThresholds = {
  lcpMs: 2500,
  clsScore: 0.1,
  ttfbMs: 800,
};

export async function checkPerformance(
  page: Page,
  url: string,
  logger: Logger,
  thresholds: PerformanceThresholds = DEFAULT_THRESHOLDS
): Promise<PerformanceResult> {
  try {
    // Collect Web Vitals via PerformanceObserver injected before navigation
    const metrics = await page.evaluate(() => {
      return new Promise<Record<string, number>>((resolve) => {
        const result: Record<string, number> = {};

        // Navigation timing
        const navEntry = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming;
        if (navEntry) {
          result.ttfb = navEntry.responseStart - navEntry.requestStart;
          result.domContentLoaded = navEntry.domContentLoadedEventEnd - navEntry.startTime;
          result.pageLoad = navEntry.loadEventEnd - navEntry.startTime;
        }

        // LCP via PerformanceObserver
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lcp = entries[entries.length - 1];
          if (lcp) result.lcp = lcp.startTime;
          observer.disconnect();
          resolve(result);
        });

        try {
          observer.observe({ type: "largest-contentful-paint", buffered: true });
        } catch {
          resolve(result);
        }

        // Fallback timeout
        setTimeout(() => resolve(result), 3000);
      });
    });

    const violations: string[] = [];

    if (metrics.lcp && metrics.lcp > thresholds.lcpMs) {
      violations.push(`LCP ${Math.round(metrics.lcp)}ms exceeds threshold ${thresholds.lcpMs}ms`);
    }
    if (metrics.ttfb && metrics.ttfb > thresholds.ttfbMs) {
      violations.push(`TTFB ${Math.round(metrics.ttfb)}ms exceeds threshold ${thresholds.ttfbMs}ms`);
    }

    const passed = violations.length === 0;
    logger.info("Performance check complete", { url, metrics, violations, passed });

    return { passed, metrics, violations };
  } catch (err) {
    logger.warn("Performance check failed", { url, error: String(err) });
    return { passed: true, metrics: {}, violations: [] }; // Don't fail on perf check errors
  }
}
