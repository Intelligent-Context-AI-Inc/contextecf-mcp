# ContextECF Claude Connector

ContextECF Claude Connector is the Claude-facing distribution of `contextecfMCP`: a remote MCP connector that gives Claude governed enterprise memory without giving Claude direct database access.

Primary launch endpoint:

```text
https://mcp.enterprisecontextfabric.com/mcp
```

The public endpoint is synthetic, no-login, read-only, metadata-only, and rate-limited. Enterprise deployments should use private customer endpoints, for example:

```text
https://mcp.customer-domain.com/mcp
https://contextecf.customer.com/mcp
```

## What Claude Gets

Claude receives schema-valid `ContextPackage` responses with:

- selected source metadata
- excluded source reason codes
- evidence references
- sufficiency score and label
- receipt-style proof artifacts

Claude does not receive:

- raw database rows
- raw customer documents
- connector credentials
- private scoring formulas
- proprietary Fabric internals
- command execution capability

## Individual User Setup

Use this path when a user wants to try the public synthetic connector or connect to an approved private customer endpoint.

1. In Claude, open connector settings and choose the custom remote MCP connector flow.
2. Add the connector name:

```text
ContextECF Claude Connector
```

3. Add the remote MCP URL:

```text
https://mcp.enterprisecontextfabric.com/mcp
```

4. Enable the read-only tools:

```text
context_assemble
context_explain
context_evidence
context_status
context_feedback
```

5. Ask Claude one of the launch prompts below.

## Enterprise Admin Rollout

Use this path when an enterprise deploys a private ContextECF Fabric and wants Claude to access governed context through MCP.

1. Deploy private ContextECF Fabric inside the customer environment.
2. Expose a private or customer-owned MCP endpoint, such as `https://mcp.customer-domain.com/mcp`.
3. Configure enterprise auth through approved OIDC, API-client, or enterprise-managed connector auth.
4. Add ContextECF Claude Connector in Claude organization connector settings where available.
5. Set the connector to read-only for Phase 1.
6. Confirm source-system permissions still apply.
7. Validate that Claude can call `context_assemble` and receives metadata-only ContextPackages.
8. Review receipts, exclusions, and sufficiency labels with security or compliance stakeholders.

## Example Claude Prompts

Support:

```text
Claude, assemble context for this P1 escalation before I draft the incident brief.
```

Sales:

```text
Claude, prepare me for this strategic renewal call.
```

Productivity:

```text
Claude, brief me for the cross-functional budget review.
```

NetOps:

```text
Claude, assemble service degradation context before I start triage.
```

Developer context, later Claude Code track:

```text
Claude, retrieve governed repository context before suggesting a code change.
```

## Actual Tool Arguments

The connector uses the same shipped `context_assemble` schema as the public demo:

```json
{
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
```

Use `packId` and `intentKind` when explaining what Claude requested and why the package was assembled. `modeId` is an optional opaque assembly profile id kept for compatibility with the current public contract; do not position it as a customer-facing workflow taxonomy.

## Claude Desktop Local MCP

Use local MCP for private proof-of-concept, appliance-style trials, or teams not ready for remote connector authorization.

Install through npm:

```bash
npm install -g @intelligentcontext/contextecf-mcp
```

Demo mode is zero-network and synthetic:

```bash
contextecf-mcp --demo
```

Claude Desktop configuration:

```json
{
  "mcpServers": {
    "contextecf": {
      "command": "npx",
      "args": ["@intelligentcontext/contextecf-mcp", "--demo"]
    }
  }
}
```

For live private Fabric mode, provide endpoint, tenant, and auth environment variables through the customer's approved deployment mechanism.

## Security FAQ

### What does Claude see?

Claude sees governed metadata: source decisions, evidence references, sufficiency, gaps, and receipt references.

### What does Claude never see?

Claude never sees raw source bodies, raw database credentials, embeddings, private scoring recipes, proprietary retrieval internals, or private Fabric runtime details.

### How do exclusions work?

ContextECF records denied, irrelevant, or unavailable sources as reason-coded exclusions before the model can use them.

### How does tenant isolation work?

The public demo uses a synthetic tenant only. Enterprise deployments bind requests to the customer tenant, source-system permissions, and approved enterprise auth.

### How do admins disable or restrict the connector?

Admins can remove the connector from Claude organization settings, restrict it to read-only tools, block action-bearing tools, revoke enterprise auth, or disable the private MCP endpoint.

## Claude Code Plugin Track

Do not include the Claude Code plugin in the initial launch dependency chain. Treat it as a follow-on package focused on developer workflows:

- CodeLedger context
- architecture decision lookup
- incident and postmortem context
- repository memory

The Claude Code track remains read-only unless a later governed command-capsule launch is explicitly approved.

## Anthropic Directory Submission

Prepare the public Claude directory listing from [`ANTHROPIC_CONNECTOR_SUBMISSION.md`](./ANTHROPIC_CONNECTOR_SUBMISSION.md). Submit it as a remote MCP server through the Claude.ai organization submission portal after confirming the approved support mailbox and icon.

Do not submit the launch connector as an MCP App unless interactive Claude UI elements are added later. The hosted connector currently exposes tools only.
