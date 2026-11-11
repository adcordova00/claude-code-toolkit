import type { Logger } from "../../shared/logger.js";

export async function sendSlackAlert(
  webhookUrl: string,
  url: string,
  result: Record<string, unknown>,
  logger: Logger
): Promise<void> {
  const message = {
    text: `🚨 Site monitor alert for ${url}`,
    blocks: [
      {
        type: "header",
        text: { type: "plain_text", text: `🚨 Monitor Alert: ${new URL(url).hostname}` },
      },
      {
        type: "section",
        fields: [
          { type: "mrkdwn", text: `*URL:*\n${url}` },
          { type: "mrkdwn", text: `*Time:*\n${new Date().toISOString()}` },
        ],
      },
      {
        type: "section",
        text: { type: "mrkdwn", text: `\`\`\`${JSON.stringify(result, null, 2)}\`\`\`` },
      },
    ],
  };

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(message),
    });

    if (!response.ok) {
      logger.warn("Slack alert failed", { status: response.status });
    } else {
      logger.info("Slack alert sent", { url });
    }
  } catch (err) {
    logger.warn("Failed to send Slack alert", { error: String(err) });
  }
}
