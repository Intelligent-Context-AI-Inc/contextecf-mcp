#!/usr/bin/env node
import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';

import { ContextEcfClient } from './client.js';
import { loadConfig } from './config.js';
import { buildSyntheticContextPackage } from './demo.js';
import {
  buildSyntheticFeedbackReceipt,
  explainSyntheticContextPackage,
  findSyntheticEvidence,
} from './demo-catalog.js';

const demoMode =
  process.argv.includes('--demo') ||
  process.env.CONTEXTECF_MCP_DEMO === 'true' ||
  process.env.CONTEXTECF_MCP_MODE === 'demo';
const httpMode = process.argv.includes('--http') || process.env.CONTEXTECF_MCP_TRANSPORT === 'http';
const httpPort = Number.parseInt(process.env.PORT ?? process.env.CONTEXTECF_MCP_PORT ?? '3001', 10);
const mcpPath = process.env.CONTEXTECF_MCP_PATH ?? '/mcp';
const client = demoMode ? undefined : new ContextEcfClient(loadConfig());

async function main(): Promise<void> {
  if (httpMode) {
    await startHttpServer();
    return;
  }

  console.error(
    `ContextECF MCP facade starting in ${demoMode ? 'synthetic demo' : 'live'} stdio mode`
  );
  await createContextEcfServer().connect(new StdioServerTransport());
}

async function startHttpServer(): Promise<void> {
  const httpServer = createServer((request, response) => {
    void handleHttpRequest(request, response);
  });

  await new Promise<void>((resolve, reject) => {
    httpServer.once('error', reject);
    httpServer.listen(httpPort, '0.0.0.0', () => resolve());
  });

  console.error(
    `ContextECF MCP facade listening on ${mcpPath} in ${demoMode ? 'synthetic demo' : 'live'} HTTP mode on port ${httpPort}`
  );
}

async function handleHttpRequest(
  request: IncomingMessage,
  response: ServerResponse
): Promise<void> {
  const url = new URL(request.url ?? '/', `http://${request.headers.host ?? 'localhost'}`);
  if (url.pathname === '/health') {
    sendJson(response, 200, {
      status: 'ok',
      service: 'contextecf-mcp',
      synthetic: demoMode,
      read_only: true,
    });
    return;
  }

  if (url.pathname !== mcpPath) {
    sendJson(response, 404, { error: 'not_found' });
    return;
  }

  if (request.method !== 'POST') {
    sendJson(response, 405, {
      jsonrpc: '2.0',
      error: { code: -32000, message: 'Method not allowed.' },
      id: null,
    });
    return;
  }

  const server = createContextEcfServer();
  const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });
  try {
    await server.connect(transport);
    await transport.handleRequest(request, response);
  } catch (error) {
    console.error('Error handling MCP HTTP request:', error);
    if (!response.headersSent) {
      sendJson(response, 500, {
        jsonrpc: '2.0',
        error: { code: -32603, message: 'Internal server error' },
        id: null,
      });
    }
  } finally {
    await transport.close().catch(() => undefined);
    await server.close().catch(() => undefined);
  }
}

function createContextEcfServer(): Server {
  const server = new Server(
    { name: 'contextecf-mcp', version: '0.1.0' },
    { capabilities: { tools: {} } }
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: [
      {
        name: 'context_assemble',
        description:
          'Assemble a read-only governed ContextECF context package with a synthetic assembled-context preview, selected sources, exclusions, metadata-only evidence references, sufficiency, gaps, and receipt metadata.',
        annotations: toolAnnotations('Assemble governed context package', true),
        inputSchema: {
          type: 'object',
          required: ['packId', 'intentKind', 'userRequest', 'timeWindow', 'sourceCapabilities'],
          additionalProperties: false,
          properties: {
            packId: { type: 'string' },
            intentKind: { type: 'string' },
            userRequest: { type: 'string' },
            timeWindow: {
              type: 'object',
              required: ['lookbackDays', 'lookaheadDays'],
              additionalProperties: false,
              properties: {
                lookbackDays: { type: 'integer', minimum: 0, maximum: 365 },
                lookaheadDays: { type: 'integer', minimum: 0, maximum: 30 },
              },
            },
            sourceCapabilities: { type: 'array', minItems: 1, items: { type: 'string' } },
            modeId: {
              type: 'string',
              description:
                'Optional opaque assembly profile id. The public explanation surface is packId plus intentKind.',
            },
            responseShape: { type: 'string', enum: ['summary', 'panel_sections'] },
          },
        },
      },
      jsonTool(
        'context_explain',
        'Explain public context package assembly metadata.',
        'Explain context package assembly',
        true
      ),
      jsonTool(
        'context_evidence',
        'Return metadata for a public evidence reference.',
        'Return evidence metadata',
        true
      ),
      jsonTool(
        'context_status',
        'Check ContextECF MCP facade readiness.',
        'Check connector status',
        true
      ),
      jsonTool(
        'context_feedback',
        'Submit metadata-only feedback about context package usefulness.',
        'Submit context package feedback',
        false
      ),
    ],
  }));

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const args = request.params.arguments ?? {};
    try {
      switch (request.params.name) {
        case 'context_assemble':
          return textResult(
            demoMode ? buildSyntheticContextPackage(args) : await client!.assemble(args)
          );
        case 'context_explain':
          return textResult(demoMode ? demoExplain(args) : await client!.explain(args));
        case 'context_evidence':
          return textResult(demoMode ? demoEvidence(args) : await client!.evidence(args));
        case 'context_status':
          return textResult(
            demoMode
              ? { status: 'ready', synthetic: true, read_only: true }
              : await client!.status()
          );
        case 'context_feedback':
          return textResult(
            demoMode ? buildSyntheticFeedbackReceipt(args) : await client!.feedback(args)
          );
        default:
          throw new Error(`Unknown tool: ${request.params.name}`);
      }
    } catch (error) {
      return {
        content: [{ type: 'text', text: error instanceof Error ? error.message : 'Unknown error' }],
        isError: true,
      };
    }
  });

  return server;
}

function jsonTool(name: string, description: string, title: string, readOnlyHint: boolean) {
  return {
    name,
    description,
    annotations: toolAnnotations(title, readOnlyHint),
    inputSchema: {
      type: 'object',
      additionalProperties: true,
      properties: {},
    },
  };
}

function toolAnnotations(title: string, readOnlyHint: boolean) {
  return {
    title,
    readOnlyHint,
    destructiveHint: false,
  };
}

function textResult(value: unknown) {
  return {
    content: [{ type: 'text', text: JSON.stringify(value, null, 2) }],
  };
}

function demoExplain(input: unknown) {
  return explainSyntheticContextPackage({
    context_package_id: objectValue(input, 'context_package_id'),
    packId: objectValue(input, 'packId'),
  });
}

function demoEvidence(input: unknown) {
  return findSyntheticEvidence({
    context_package_id: objectValue(input, 'context_package_id'),
    evidence_ref: objectValue(input, 'evidence_ref'),
  });
}

function objectValue(value: unknown, key: string): string | undefined {
  if (!value || typeof value !== 'object') return undefined;
  const item = (value as Record<string, unknown>)[key];
  return typeof item === 'string' ? item : undefined;
}

function sendJson(response: ServerResponse, status: number, payload: unknown): void {
  response.writeHead(status, {
    'content-type': 'application/json',
    'cache-control': 'no-store',
  });
  response.end(JSON.stringify(payload));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
