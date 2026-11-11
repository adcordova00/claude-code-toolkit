import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import type { Logger } from "../../shared/logger.js";

const SNAPSHOTS_DIR = path.resolve(import.meta.dirname, "../snapshots");

export interface ContentDiffResult {
  changed: boolean;
  diffs: Array<{ selector: string; before: string; after: string }>;
}

// Selectors to monitor for content changes — customize per URL in a real setup
const MONITORED_SELECTORS = [
  "main h1",
  "[data-monitor='price']",
  "[data-monitor='status']",
];

function urlToHash(url: string): string {
  return crypto.createHash("md5").update(url).digest("hex");
}

function snapshotPath(url: string): string {
  return path.join(SNAPSHOTS_DIR, `${urlToHash(url)}.json`);
}

export async function checkContentDiff(
  url: string,
  logger: Logger
): Promise<ContentDiffResult> {
  await fs.mkdir(SNAPSHOTS_DIR, { recursive: true });

  const snapshotFile = snapshotPath(url);
  const diffs: ContentDiffResult["diffs"] = [];

  // Read previous snapshot
  let previous: Record<string, string> = {};
  try {
    const raw = await fs.readFile(snapshotFile, "utf-8");
    previous = JSON.parse(raw);
  } catch {
    // First run — no baseline yet
    logger.info("No snapshot found, creating baseline", { url });
  }

  // In a real implementation, page would be passed in and selectors queried.
  // This returns a placeholder result since we don't have the page here.
  // The actual selector querying happens in monitor.ts with the live page.
  const current: Record<string, string> = { ...previous };

  // Save current snapshot
  await fs.writeFile(snapshotFile, JSON.stringify(current, null, 2), "utf-8");

  const changed = diffs.length > 0;
  if (changed) {
    logger.warn("Content changed", { url, diffs });
  }

  return { changed, diffs };
}
