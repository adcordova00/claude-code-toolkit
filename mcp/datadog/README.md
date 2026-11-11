# Datadog MCP Server

Custom MCP server that exposes Datadog monitors, metrics, logs, and incidents to Claude Code.

## Setup

```bash
npm install
npm run build
```

Set environment variables in your `.env`:
```
DD_API_KEY=your_api_key
DD_APP_KEY=your_app_key
DD_SITE=datadoghq.com   # or datadoghq.eu, us3.datadoghq.com, etc.
```

## Available tools

### Monitors
| Tool | Description |
|------|-------------|
| `dd_list_monitors` | List monitors with optional tag/name filter |
| `dd_get_monitor` | Get monitor details by ID |
| `dd_mute_monitor` | Mute a monitor until a given datetime |
| `dd_unmute_monitor` | Unmute a monitor |

### Metrics
| Tool | Description |
|------|-------------|
| `dd_query_metrics` | Query metrics with a Datadog query expression |
| `dd_list_dashboards` | List all dashboards |
| `dd_get_dashboard` | Get full dashboard definition by ID |

### Logs
| Tool | Description |
|------|-------------|
| `dd_search_logs` | Search logs with a query and time range |
| `dd_tail_logs` | Get recent logs matching a filter |

### Incidents
| Tool | Description |
|------|-------------|
| `dd_list_incidents` | List incidents with optional state filter |
| `dd_get_incident` | Get incident details by ID |
| `dd_update_incident` | Update incident state, severity, or title |

## Adding new tools

1. Add tool function in the appropriate `src/tools/*.ts` file using `server.tool(...)`
2. Register it in the corresponding `register*Tools(server)` call (already wired in `index.ts`)
3. Run `npm run build`

Tool signature:
```typescript
server.tool(
  "tool_name",
  "Tool description for Claude",
  { param: { type: "string", description: "..." } },
  async ({ param }) => {
    // implementation
    return { content: [{ type: "text", text: result }] };
  }
);
```
