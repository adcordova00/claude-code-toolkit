import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { v2 } from "@datadog/datadog-api-client";
import { createConfiguration } from "../client.js";

export function registerLogTools(server: Server): void {
  const api = new v2.LogsApi(createConfiguration());

  server.tool(
    "dd_search_logs",
    "Search Datadog logs with a query string and time range",
    {
      query: { type: "string", description: "Datadog log search query (e.g. 'service:my-api status:error')" },
      from: { type: "string", description: "Start time as ISO 8601 (e.g. '2026-05-16T10:00:00Z')" },
      to: { type: "string", description: "End time as ISO 8601 (e.g. '2026-05-16T11:00:00Z')" },
      limit: { type: "number", description: "Maximum number of logs to return (default 25, max 1000)", optional: true },
    },
    async ({ query, from, to, limit }) => {
      const result = await api.listLogs({
        body: {
          filter: {
            query,
            from,
            to,
          },
          page: { limit: limit ?? 25 },
          sort: "-timestamp",
        },
      });
      return {
        content: [{ type: "text", text: JSON.stringify(result.data, null, 2) }],
      };
    }
  );

  server.tool(
    "dd_tail_logs",
    "Get the most recent logs matching a filter (last N entries)",
    {
      query: { type: "string", description: "Datadog log search query (e.g. 'service:my-api')" },
      count: { type: "number", description: "Number of recent logs to retrieve (default 20, max 100)", optional: true },
    },
    async ({ query, count }) => {
      const now = new Date();
      const from = new Date(now.getTime() - 15 * 60 * 1000); // last 15 minutes

      const result = await api.listLogs({
        body: {
          filter: {
            query,
            from: from.toISOString(),
            to: now.toISOString(),
          },
          page: { limit: Math.min(count ?? 20, 100) },
          sort: "-timestamp",
        },
      });

      const logs = result.data?.map((log) => ({
        timestamp: log.attributes?.timestamp,
        service: log.attributes?.service,
        status: log.attributes?.status,
        message: log.attributes?.message,
        host: log.attributes?.host,
      }));

      return {
        content: [{ type: "text", text: JSON.stringify(logs, null, 2) }],
      };
    }
  );
}
