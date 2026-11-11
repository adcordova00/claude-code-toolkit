import type { Logger } from "../../shared/logger.js";

export async function sendDatadogEvent(
  url: string,
  result: Record<string, unknown>,
  logger: Logger
): Promise<void> {
  const ddApiKey = process.env.DD_API_KEY;
  const ddSite = process.env.DD_SITE ?? "datadoghq.com";

  if (!ddApiKey) {
    logger.warn("DD_API_KEY not set, skipping Datadog event");
    return;
  }

  const hostname = new URL(url).hostname;
  const event = {
    title: `Site monitor alert: ${hostname}`,
    text: `%%% \n${JSON.stringify(result, null, 2)}\n %%%`,
    tags: [`url:${hostname}`, "source:site-monitor", `env:${process.env.NODE_ENV ?? "production"}`],
    alert_type: "error",
    source_type_name: "my apps",
    aggregation_key: `site-monitor-${hostname}`,
  };

  try {
    const response = await fetch(`https://api.${ddSite}/api/v1/events`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "DD-API-KEY": ddApiKey,
      },
      body: JSON.stringify(event),
    });

    if (!response.ok) {
      logger.warn("Datadog event failed", { status: response.status });
    } else {
      logger.info("Datadog event sent", { url });
    }
  } catch (err) {
    logger.warn("Failed to send Datadog event", { error: String(err) });
  }
}
