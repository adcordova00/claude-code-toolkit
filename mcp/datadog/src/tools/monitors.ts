import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { CallToolRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { v1 } from "@datadog/datadog-api-client";
import { createConfiguration } from "../client.js";

export function registerMonitorTools(server: Server): void {
  const api = new v1.MonitorsApi(createConfiguration());

  server.tool(
    "dd_list_monitors",
    "List Datadog monitors, optionally filtered by tag or name",
    {
      tag: { type: "string", description: "Filter by monitor tag (e.g. 'env:prod')", optional: true },
      name: { type: "string", description: "Filter by monitor name (substring match)", optional: true },
      page: { type: "number", description: "Page number (0-indexed)", optional: true },
    },
    async ({ tag, name, page }) => {
      const monitors = await api.listMonitors({
        tags: tag,
        name,
        page: page ?? 0,
        pageSize: 50,
      });
      return {
        content: [{ type: "text", text: JSON.stringify(monitors, null, 2) }],
      };
    }
  );

  server.tool(
    "dd_get_monitor",
    "Get details for a specific Datadog monitor by ID",
    {
      monitorId: { type: "number", description: "The monitor ID" },
    },
    async ({ monitorId }) => {
      const monitor = await api.getMonitor({ monitorId });
      return {
        content: [{ type: "text", text: JSON.stringify(monitor, null, 2) }],
      };
    }
  );

  server.tool(
    "dd_mute_monitor",
    "Mute a Datadog monitor for a specified duration",
    {
      monitorId: { type: "number", description: "The monitor ID to mute" },
      end: { type: "string", description: "ISO 8601 datetime when the mute ends (e.g. '2026-05-16T18:00:00Z')", optional: true },
    },
    async ({ monitorId, end }) => {
      await api.muteMonitor({
        monitorId,
        body: { end: end ? new Date(end) : undefined },
      });
      return {
        content: [{ type: "text", text: `Monitor ${monitorId} muted${end ? ` until ${end}` : " indefinitely"}.` }],
      };
    }
  );

  server.tool(
    "dd_unmute_monitor",
    "Unmute a Datadog monitor",
    {
      monitorId: { type: "number", description: "The monitor ID to unmute" },
    },
    async ({ monitorId }) => {
      await api.unmuteMonitor({ monitorId });
      return {
        content: [{ type: "text", text: `Monitor ${monitorId} unmuted.` }],
      };
    }
  );
}
