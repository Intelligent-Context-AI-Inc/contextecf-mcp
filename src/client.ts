import { ContextAssembleInputSchema, PublicMcpContextPackageSchema } from './schemas.js';
import type { ContextAssembleInput, PublicMcpContextPackage } from './schemas.js';
import type { ContextEcfMcpConfig } from './config.js';
import { verifyContextPackageReceipt } from './receipt.js';

type TokenCache = {
  token: string;
  expiresAt: number;
};

export class ContextEcfClient {
  private tokenCache: TokenCache | undefined;

  constructor(
    private readonly config: ContextEcfMcpConfig,
    private readonly fetchImpl: typeof fetch = fetch
  ) {}

  async assemble(input: unknown): Promise<PublicMcpContextPackage> {
    const body = ContextAssembleInputSchema.parse(input);
    const payload = await this.request('/public/v1/context/assemble', {
      method: 'POST',
      body: JSON.stringify(body),
    });
    const parsed = PublicMcpContextPackageSchema.parse(readData(payload));
    verifyContextPackageReceipt(parsed);
    return parsed;
  }

  async explain(input: unknown): Promise<unknown> {
    return readData(
      await this.request('/public/v1/context/explain', {
        method: 'POST',
        body: JSON.stringify(input ?? {}),
      })
    );
  }

  async evidence(input: unknown): Promise<unknown> {
    return readData(
      await this.request('/public/v1/context/evidence', {
        method: 'POST',
        body: JSON.stringify(input ?? {}),
      })
    );
  }

  async status(): Promise<unknown> {
    return readData(await this.request('/public/v1/context/status', { method: 'GET' }));
  }

  async feedback(input: unknown): Promise<unknown> {
    return readData(
      await this.request('/public/v1/context/feedback', {
        method: 'POST',
        body: JSON.stringify(input ?? {}),
      })
    );
  }

  private async request(path: string, init: RequestInit): Promise<unknown> {
    const response = await this.fetchImpl(`${trimEndpoint(this.config.endpoint)}${path}`, {
      ...init,
      headers: {
        authorization: `Bearer ${await this.getAccessToken()}`,
        accept: 'application/json',
        'content-type': 'application/json',
        'x-contextecf-tenant-id': this.config.tenantId,
        'user-agent': '@intelligentcontext/contextecf-mcp/0.1',
        ...init.headers,
      },
    });
    const payload = await response.json().catch(() => null);
    if (!response.ok) {
      throw new Error(
        extractErrorMessage(payload) ?? `ContextECF request failed: ${response.status}`
      );
    }
    return payload;
  }

  private async getAccessToken(): Promise<string> {
    if (this.config.authMode === 'oidc') {
      return this.config.accessToken!;
    }
    if (this.tokenCache && this.tokenCache.expiresAt > Date.now() + 30_000) {
      return this.tokenCache.token;
    }

    const response = await this.fetchImpl(
      `${trimEndpoint(this.config.endpoint)}/v1/agent-api/auth/token`,
      {
        method: 'POST',
        headers: {
          accept: 'application/json',
          'content-type': 'application/json',
          'user-agent': '@intelligentcontext/contextecf-mcp/0.1',
        },
        body: JSON.stringify({
          client_id: this.config.clientId,
          client_secret: this.config.clientSecret,
        }),
      }
    );
    const payload = await response.json().catch(() => null);
    if (!response.ok) {
      throw new Error(extractErrorMessage(payload) ?? 'Agent API credential exchange failed');
    }
    const token = tokenFromPayload(payload);
    this.tokenCache = {
      token,
      expiresAt: Date.now() + Math.max(60, expiresInFromPayload(payload)) * 1000,
    };
    return token;
  }
}

function readData(payload: unknown): unknown {
  if (!payload || typeof payload !== 'object' || !('data' in payload)) {
    throw new Error('ContextECF response did not include data');
  }
  return (payload as { data: unknown }).data;
}

function tokenFromPayload(payload: unknown): string {
  const data = readData(payload);
  if (
    !data ||
    typeof data !== 'object' ||
    typeof (data as { access_token?: unknown }).access_token !== 'string'
  ) {
    throw new Error('Agent API credential exchange did not return an access token');
  }
  return (data as { access_token: string }).access_token;
}

function expiresInFromPayload(payload: unknown): number {
  const data = readData(payload);
  const expiresIn = (data as { expires_in?: unknown }).expires_in;
  return typeof expiresIn === 'number' && Number.isFinite(expiresIn) ? expiresIn : 300;
}

function trimEndpoint(endpoint: string): string {
  return endpoint.replace(/\/+$/u, '');
}

function extractErrorMessage(payload: unknown): string | undefined {
  if (!payload || typeof payload !== 'object') return undefined;
  const error = (payload as { error?: unknown }).error;
  if (error && typeof error === 'object') {
    const message = (error as { message?: unknown }).message;
    if (typeof message === 'string') return message;
  }
  const message = (payload as { message?: unknown }).message;
  return typeof message === 'string' ? message : undefined;
}
