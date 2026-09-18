# ContextECF MCP

`@intelligentcontext/contextecf-mcp` is a secure gateway for AI memory. It lets external agent hosts request verifiable, policy-governed ContextPackages without direct database access, raw credentials, Fabric internals, or customer content.

Canonical public demo: `https://mcp.enterprisecontextfabric.com`

Hosted MCP endpoint: `https://mcp.enterprisecontextfabric.com/mcp`

Claude connector guide: [`CLAUDE_CONNECTOR.md`](./CLAUDE_CONNECTOR.md)

Docker guide: [`DOCKER.md`](./DOCKER.md)

## Tools

- `context_assemble`: Assemble a schema-valid, governed ContextPackage from the Fabric public API.
- `context_explain`: Explain why a ContextPackage was assembled.
- `context_evidence`: Return metadata for an evidence reference without exposing source bodies.
- `context_status`: Check facade readiness.
- `context_feedback`: Submit metadata-only usefulness feedback.

## MCP Request Shape

MCP hosts call tools through standard JSON-RPC. The outer request shape is standardized by MCP; the `arguments` object is the ContextECF tool contract:

```json
{
  "jsonrpc": "2.0",
  "id": "req-8921a-mcp",
  "method": "tools/call",
  "params": {
    "name": "context_assemble",
    "arguments": {
      "packId": "support-sla-p1",
      "intentKind": "triage_sla_breach",
      "userRequest": "A P1 customer escalation just came in. Assemble ticket, SLA, customer account, knowledge-base, and prior conversation context before drafting an internal incident brief.",
      "timeWindow": {
        "lookbackDays": 30,
        "lookaheadDays": 7
      },
      "sourceCapabilities": ["ticket", "sla", "customer_record", "knowledge_base", "conversation"],
      "modeId": "synthetic-support-sla-p1",
      "responseShape": "panel_sections"
    }
  }
}
```

The facade validates those arguments and, in live mode, forwards the same governed public contract to `POST /public/v1/context/assemble` with the configured tenant/auth headers. The public launch demo runs the same tool contract against visibly synthetic data only.

`packId` and `intentKind` are the public explanation handles for the package. `modeId` is accepted for compatibility as an opaque assembly profile id; callers should not treat it as a business taxonomy, UI mode, or stable customer workflow name.

## Use ContextECF With Claude

ContextECF Claude Connector is the Claude-facing distribution of `contextecfMCP`. It lets Claude call a remote MCP connector and receive governed ContextPackages, not raw database access.

Default positioning:

```text
Give Claude governed enterprise memory without giving it direct database access.
```

Launch tiers:

- Remote MCP connector: primary path for Claude web, mobile, Desktop, Cowork, and Claude Code where custom remote MCP connectors are available.
- Claude Desktop local MCP: private proof-of-concept, local demo, appliance-style trial, or teams not ready for remote connector authorization.
- Claude Code plugin: later developer-focused package for CodeLedger, architecture decisions, incident context, and repository memory.

Claude prompts:

- Support: `Claude, assemble context for this P1 escalation before I draft the incident brief.`
- Sales: `Claude, prepare me for this strategic renewal call.`
- Productivity: `Claude, brief me for the cross-functional budget review.`
- NetOps: `Claude, assemble service degradation context before I start triage.`
- Developer later track: `Claude, retrieve governed repository context before suggesting a code change.`

See [`CLAUDE_CONNECTOR.md`](./CLAUDE_CONNECTOR.md) for individual setup, enterprise admin rollout, local Claude Desktop configuration, and the security FAQ.

## Configuration

Live mode uses environment variables only:

```bash
CONTEXTECF_ENDPOINT=https://fabric.example.com \
CONTEXTECF_TENANT_ID=tenant_123 \
CONTEXTECF_AUTH_MODE=oidc \
CONTEXTECF_ACCESS_TOKEN="$TOKEN" \
npx @intelligentcontext/contextecf-mcp
```

API-client mode exchanges existing Agent API credentials:

```bash
CONTEXTECF_ENDPOINT=https://fabric.example.com \
CONTEXTECF_TENANT_ID=tenant_123 \
CONTEXTECF_AUTH_MODE=api_key \
CONTEXTECF_CLIENT_ID="$CLIENT_ID" \
CONTEXTECF_CLIENT_SECRET="$CLIENT_SECRET" \
npx @intelligentcontext/contextecf-mcp
```

Demo mode uses bundled synthetic data and makes no network calls:

```bash
npx @intelligentcontext/contextecf-mcp --demo
```

Hosted Streamable HTTP mode serves `/mcp` plus `/health`:

```bash
CONTEXTECF_MCP_TRANSPORT=http \
CONTEXTECF_MCP_PORT=3001 \
CONTEXTECF_MCP_PATH=/mcp \
npx @intelligentcontext/contextecf-mcp --demo --http
```

## Docker

The Docker image defaults to synthetic demo mode over stdio for Docker MCP Toolkit compatibility:

```bash
docker build -t intelligentcontext/contextecf-mcp:local .
docker run --rm -i intelligentcontext/contextecf-mcp:local
```

For local HTTP testing:

```bash
docker compose up --build
curl http://127.0.0.1:3001/health
```

The Docker-facing positioning is:

```text
Give AI agents governed enterprise context for the task at hand without giving them direct database access.
```

See [`DOCKER.md`](./DOCKER.md) for Docker Hub copy, Docker MCP Toolkit positioning, local demo commands, private Fabric mode, and the demo-to-private-deployment path.

## Synthetic Live Demo

The public demo is no-login, synthetic, read-only, and metadata-only at the evidence layer. It demonstrates the same promise as the product landing page: AI agents get a governed assembled-context preview and the evidence references they are authorized to see, while excluded sources and receipt provenance stay visible.

It ships four first-path scenarios:

- Support: P1 customer escalation context across ticket, SLA, account, knowledge-base, and prior conversation metadata.
- Sales: strategic renewal call context across opportunity, account history, stakeholders, meetings, and email-thread metadata.
- Productivity: executive budget review context across calendar, docs, tasks, decisions, and open commitments.
- NetOps: service degradation context across metrics, ServiceNow incident history, topology, runbook, and recent change metadata.

Each scenario returns a synthetic assembled-context preview, selected sources, excluded source reason codes, sufficiency, metadata-only evidence references, gap annotations, and receipt-style proof artifacts.

## How Context Assembly Works

This is the public, non-IP description of the assembly path. It explains step and outcome without exposing proprietary algorithms, ranking weights, connector internals, scoring formulas, or private Fabric runtime details.

| Stage                     | Outcome                                                                                             |
| ------------------------- | --------------------------------------------------------------------------------------------------- |
| Request intake            | The MCP `context_assemble` call becomes a bounded context intent for the selected use case.         |
| Identity and policy check | The package is scoped to the persona, assembly profile, request window, and allowed source classes. |
| Source selection          | Only relevant enterprise source categories are selected before assembly begins.                     |
| Evidence assembly         | Authorized signals become evidence references instead of raw database or document dumps.            |
| Sufficiency evaluation    | The response declares whether the context is sufficient, partial, or insufficient for the request.  |
| Exclusion annotation      | Denied or irrelevant sources are listed with reason codes before the model can use them.            |
| Receipt generation        | The package carries a receipt-style proof artifact for provenance and tamper checks.                |
| MCP delivery              | The agent receives a schema-valid ContextPackage through the standardized MCP response.             |

## Boundary

This package is intentionally a thin translation layer. It does not import ContextECF private engine, boundary, scoring, learning, or retrieval internals. All live behavior comes from `/public/v1/context/*` over HTTPS.

Returned evidence references are metadata-only. Demo packages can include a synthetic assembled-context preview, but they do not return raw prompts, responses, customer documents, credentials, embeddings, private scoring recipes, or proprietary context-engineering internals. The public endpoint stops at recommend and structurally rejects command-capsule-shaped requests.
