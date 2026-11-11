import { chromium, type Browser, type BrowserContext, type LaunchOptions } from "@playwright/test";
import path from "path";

export interface BrowserOptions {
  headless?: boolean;
  slowMo?: number;
  storageStatePath?: string;
  viewport?: { width: number; height: number };
  recordVideo?: boolean;
  outputDir?: string;
}

export async function createBrowser(options: BrowserOptions = {}): Promise<Browser> {
  const launchOptions: LaunchOptions = {
    headless: options.headless ?? true,
    slowMo: options.slowMo,
  };
  return chromium.launch(launchOptions);
}

export async function createContext(
  browser: Browser,
  options: BrowserOptions = {}
): Promise<BrowserContext> {
  const contextOptions: Parameters<Browser["newContext"]>[0] = {
    viewport: options.viewport ?? { width: 1280, height: 720 },
    ignoreHTTPSErrors: false,
  };

  if (options.storageStatePath) {
    contextOptions.storageState = options.storageStatePath;
  }

  if (options.recordVideo && options.outputDir) {
    contextOptions.recordVideo = {
      dir: path.join(options.outputDir, "videos"),
    };
  }

  return browser.newContext(contextOptions);
}
