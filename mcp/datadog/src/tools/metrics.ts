import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { v1 } from "@datadog/datadog-api-client";
import { createConfiguration } from "../client.js";

export function registerMetricTools(server: Server): void {
  const metricsApi = new v1.MetricsApi(createConfiguration());
  const dashboardsApi = new v1.DashboardsApi(createConfiguration());

  server.tool(
    "dd_query_metrics",
    "Query Datadog metrics for a time range using a metrics query expression",
    {
      query: { type: "string", description: "Datadog metrics query (e.g. 'avg:system.cpu.user{env:prod}')" },
      from: { type: "string", description: "Start time as ISO 8601 or Unix timestamp in seconds" },
      to: { type: "string", description: "End time as ISO 8601 or Unix timestamp in seconds" },
    },
    async ({ query, from, to }) => {
      const toTimestamp = (v: string) =>
        isNaN(Number(v)) ? Math.floor(new Date(v).getTime() / 1000) : Number(v);

      const result = await metricsApi.queryMetrics({
        from: toTimestamp(from),
        to: toTimestamp(to),
        query,
      });
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    }
  );

  server.tool(
    "dd_list_dashboards",
    "List all Datadog dashboards",
    {
      filterShared: { type: "boolean", description: "If true, return only shared dashboards", optional: true },
    },
    async ({ filterShared }) => {
      const dashboards = await dashboardsApi.listDashboards({
        filterShared,
      });
      const summary = dashboards.dashboards?.map((d) => ({
        id: d.id,
        title: d.title,
        url: d.url,
        author: d.authorHandle,
        modified: d.modifiedAt,
      }));
      return {
        content: [{ type: "text", text: JSON.stringify(summary, null, 2) }],
      };
    }
  );

  server.tool(
    "dd_get_dashboard",
    "Get the full definition of a Datadog dashboard by ID",
    {
      dashboardId: { type: "string", description: "The dashboard ID" },
    },
    async ({ dashboardId }) => {
      const dashboard = await dashboardsApi.getDashboard({ dashboardId });
      return {
        content: [{ type: "text", text: JSON.stringify(dashboard, null, 2) }],
      };
    }
  );
}
