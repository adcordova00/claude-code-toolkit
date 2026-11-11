import { client } from "@datadog/datadog-api-client";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

export function createConfiguration(): client.Configuration {
  return client.createConfiguration({
    authMethods: {
      apiKeyAuth: requireEnv("DD_API_KEY"),
      appKeyAuth: requireEnv("DD_APP_KEY"),
    },
    serverVariables: {
      site: process.env.DD_SITE ?? "datadoghq.com",
    },
  });
}
