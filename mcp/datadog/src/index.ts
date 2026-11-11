import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { registerMonitorTools } from "./tools/monitors.js";
import { registerMetricTools } from "./tools/metrics.js";
import { registerLogTools } from "./tools/logs.js";
import { registerIncidentTools } from "./tools/incidents.js";

const server = new Server(
  {
    name: "datadog-mcp-server",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

registerMonitorTools(server);
registerMetricTools(server);
registerLogTools(server);
registerIncidentTools(server);

const transport = new StdioServerTransport();
await server.connect(transport);
