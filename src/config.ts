import { z } from 'zod';

export const ConfigSchema = z
  .object({
    endpoint: z.string().url(),
    tenantId: z.string().min(1),
    authMode: z.enum(['oidc', 'api_key']),
    accessToken: z.string().min(1).optional(),
    clientId: z.string().min(1).optional(),
    clientSecret: z.string().min(1).optional(),
  })
  .strict();

export type ContextEcfMcpConfig = z.infer<typeof ConfigSchema>;

export function loadConfig(): ContextEcfMcpConfig {
  const config = ConfigSchema.parse({
    endpoint: process.env.CONTEXTECF_ENDPOINT,
    tenantId: process.env.CONTEXTECF_TENANT_ID,
    authMode: process.env.CONTEXTECF_AUTH_MODE,
    accessToken: process.env.CONTEXTECF_ACCESS_TOKEN,
    clientId: process.env.CONTEXTECF_CLIENT_ID,
    clientSecret: process.env.CONTEXTECF_CLIENT_SECRET,
  });

  if (config.authMode === 'oidc' && !config.accessToken) {
    throw new Error('CONTEXTECF_ACCESS_TOKEN is required when CONTEXTECF_AUTH_MODE=oidc');
  }
  if (config.authMode === 'api_key' && (!config.clientId || !config.clientSecret)) {
    throw new Error(
      'CONTEXTECF_CLIENT_ID and CONTEXTECF_CLIENT_SECRET are required when CONTEXTECF_AUTH_MODE=api_key'
    );
  }

  return config;
}
