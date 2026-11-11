import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { v2 } from "@datadog/datadog-api-client";
import { createConfiguration } from "../client.js";

export function registerIncidentTools(server: Server): void {
  const api = new v2.IncidentsApi(createConfiguration());

  server.tool(
    "dd_list_incidents",
    "List Datadog incidents, optionally filtered by state",
    {
      state: {
        type: "string",
        description: "Filter by state: 'active', 'stable', 'resolved', or omit for all",
        optional: true,
      },
      pageSize: { type: "number", description: "Number of incidents to return (default 25)", optional: true },
    },
    async ({ state, pageSize }) => {
      const params: v2.IncidentsApiListIncidentsRequest = {
        pageSize: pageSize ?? 25,
      };

      const result = await api.listIncidents(params);

      const incidents = result.data
        ?.filter((i) => !state || i.attributes?.state === state)
        .map((i) => ({
          id: i.id,
          title: i.attributes?.title,
          state: i.attributes?.state,
          severity: i.attributes?.severity,
          created: i.attributes?.created,
          resolved: i.attributes?.resolved,
          commanderHandle: i.attributes?.commanderUser?.data?.attributes?.handle,
        }));

      return {
        content: [{ type: "text", text: JSON.stringify(incidents, null, 2) }],
      };
    }
  );

  server.tool(
    "dd_get_incident",
    "Get details for a specific Datadog incident",
    {
      incidentId: { type: "string", description: "The incident ID" },
    },
    async ({ incidentId }) => {
      const result = await api.getIncident({ incidentId });
      return {
        content: [{ type: "text", text: JSON.stringify(result.data, null, 2) }],
      };
    }
  );

  server.tool(
    "dd_update_incident",
    "Update the state or severity of a Datadog incident",
    {
      incidentId: { type: "string", description: "The incident ID" },
      state: {
        type: "string",
        description: "New state: 'active', 'stable', or 'resolved'",
        optional: true,
      },
      severity: {
        type: "string",
        description: "New severity: 'SEV-1', 'SEV-2', 'SEV-3', 'SEV-4', 'SEV-5', or 'UNKNOWN'",
        optional: true,
      },
      title: { type: "string", description: "Updated incident title", optional: true },
    },
    async ({ incidentId, state, severity, title }) => {
      const result = await api.updateIncident({
        incidentId,
        body: {
          data: {
            id: incidentId,
            type: "incidents",
            attributes: {
              ...(state && { state: state as v2.IncidentFieldAttributesSingleValue }),
              ...(severity && { severity: severity as v2.IncidentSeverity }),
              ...(title && { title }),
            },
          },
        },
      });
      return {
        content: [{ type: "text", text: JSON.stringify(result.data?.attributes, null, 2) }],
      };
    }
  );
}
