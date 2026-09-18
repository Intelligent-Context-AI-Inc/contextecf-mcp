# Anthropic Connector Directory Submission Packet

This packet prepares the ContextECF Claude Connector submission for Anthropic's Connectors Directory. The actual submission must be completed by an organization Owner or delegated Directory/Libraries admin in the Claude.ai submission portal.

## Eligibility Decision

Submission type: remote MCP server.

Status: prepare-to-submit. The hosted connector is eligible for portal preparation because it is an HTTPS remote MCP server with Streamable HTTP transport, synthetic public data, clear documentation, and no raw source-system access.

Submit through:

```text
https://claude.ai/admin-settings/directory/submissions/new
```

Requirements and current status:

| Requirement                            | Status                     | Notes                                                                                                                         |
| -------------------------------------- | -------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| Team or Enterprise Claude organization | Manual                     | Requires Claude.ai org access.                                                                                                |
| Directory management access            | Manual                     | Owner, Primary owner, or delegated Enterprise role.                                                                           |
| HTTPS remote MCP URL                   | Ready                      | `https://mcp.enterprisecontextfabric.com/mcp`                                                                                 |
| Streamable HTTP or SSE transport       | Ready                      | Streamable HTTP.                                                                                                              |
| Tool annotations                       | Ready                      | Tools include `title`, `readOnlyHint`, and `destructiveHint`.                                                                 |
| OAuth for authenticated services       | Not needed for public demo | Public synthetic endpoint uses no auth. Enterprise private endpoints should use approved OAuth/OIDC or customer-managed auth. |
| Documentation URL                      | Ready                      | Use `https://mcp.enterprisecontextfabric.com/` and the MCP landing page.                                                      |
| Privacy policy URL                     | Ready                      | `https://enterprisecontextfabric.com/privacy`                                                                                 |
| Support contact                        | Confirm                    | Add the approved support mailbox before submission.                                                                           |
| Icon                                   | Ready                      | `https://mcp.enterprisecontextfabric.com/assets/contextecf-claude-icon-512-white.png`                                         |
| Test account                           | Not needed for public demo | No credentials required; use the test steps below.                                                                            |
| MCP App screenshots                    | Not applicable             | This is not an MCP App submission because the connector does not surface interactive Claude UI elements.                      |

## Portal Fields

### Connection

Server URL:

```text
https://mcp.enterprisecontextfabric.com/mcp
```

Transport:

```text
Streamable HTTP
```

URL mode:

```text
Every user connects to the same URL for the public synthetic demo.
```

Enterprise note:

```text
Private enterprise deployments can use customer-owned endpoints such as https://mcp.customer-domain.com/mcp or https://contextecf.customer.com/mcp.
```

### Listing

Name:

```text
ContextECF Claude Connector
```

Tagline:

```text
Governed enterprise memory for Claude
```

Slug:

```text
contextecf-claude-connector
```

Categories:

```text
Data & analytics
Productivity
Sales & marketing
Developer tools
```

Documentation URL:

```text
https://mcp.enterprisecontextfabric.com/
```

Secondary documentation URL:

```text
https://enterprisecontextfabric.com/contextecf-mcp
```

Privacy policy URL:

```text
https://enterprisecontextfabric.com/privacy
```

Support contact:

```text
TODO: confirm approved support mailbox before portal submission.
```

Icon URL:

```text
https://mcp.enterprisecontextfabric.com/assets/contextecf-claude-icon-512-white.png
```

Company:

```text
Intelligent Context AI
```

Company website:

```text
https://enterprisecontextfabric.com
```

Description:

```text
ContextECF Claude Connector gives Claude governed enterprise memory without giving Claude direct database access.

The connector returns metadata-only ContextPackages with selected source categories, excluded source reason codes, policy references for exclusions, sufficiency labels, evidence references, and receipt-style provenance. It is designed for support, sales, productivity, netops, and developer-context workflows where Claude needs the right enterprise context without receiving raw database rows, source credentials, private scoring formulas, or proprietary Fabric internals.

The public directory endpoint is a synthetic, no-login, rate-limited demo at https://mcp.enterprisecontextfabric.com/mcp. It demonstrates four launch scenarios: P1 customer escalation support context, strategic renewal sales context, executive budget-review productivity context, and service-degradation netops context. Enterprise customers can deploy private ContextECF endpoints with customer-owned domains and enterprise-managed authentication.

Launch posture: public demo data only, no source-system writes, no command execution, no raw customer documents, and no private enterprise data. The context_feedback tool is non-destructive metadata feedback and returns a synthetic feedback receipt; it does not write to customer source systems.
```

### Use Cases

Primary use cases:

```text
Support: Claude assembles governed escalation context across ticket, SLA, account, knowledge-base, and prior conversation metadata before an incident brief.

Sales: Claude prepares for a strategic renewal call with opportunity, account-history, stakeholder, meeting, and email-thread context.

Productivity: Claude briefs an executive for a cross-functional budget review using calendar, docs, tasks, recent decisions, and open commitments.

NetOps: Claude assembles service-degradation context across metrics, incident history, topology, runbook, and recent change metadata.

Developer context: Claude retrieves governed repository or architecture context before suggesting a change. This remains a later Claude Code-focused track.
```

What users need before connecting:

```text
Public demo: no account, no credentials, no setup beyond adding the remote MCP connector URL.

Enterprise deployment: a private ContextECF Fabric endpoint, enterprise-approved authentication, and source-system permissions configured by the customer admin.
```

Data access:

```text
Reads governed metadata and synthetic demo context packages. It does not read raw source bodies in the public demo, does not expose raw credentials, and does not write to customer source systems.
```

### Authentication

Public demo:

```text
No authentication. The endpoint is synthetic, metadata-only, and rate-limited.
```

Enterprise:

```text
Use customer-approved OAuth/OIDC, enterprise-managed auth, or an approved private connector auth pattern. Authenticated enterprise submissions should use OAuth 2.0-compatible configuration where required by Anthropic review.
```

### Data Handling

Underlying API:

```text
First-party ContextECF API operated by Intelligent Context AI for the public synthetic demo. Enterprise private deployments connect to customer-approved ContextECF endpoints.
```

Personal health data:

```text
No.
```

Sponsored content:

```text
No.
```

External link capability:

```text
The connector does not use ui/open-link for launch. Leave allowed link URIs empty unless this capability is added later.
```

### Test And Launch Instructions

Reviewer setup:

```text
No credentials are required for the public synthetic endpoint.
```

Test steps:

```bash
curl -fsS https://mcp.enterprisecontextfabric.com/health

npx @modelcontextprotocol/inspector \
  --transport streamable-http \
  https://mcp.enterprisecontextfabric.com/mcp
```

In MCP Inspector or Claude custom connector testing:

1. Run `tools/list`.
2. Confirm the five tools are visible:
   - `context_assemble`
   - `context_explain`
   - `context_evidence`
   - `context_status`
   - `context_feedback`
3. Confirm each tool has a title and read/write annotations.
4. Call `context_assemble` with this payload:

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

Expected result:

```text
A visibly synthetic ContextPackage with selected sources, excluded sources, exclusion policy refs, sufficiency, evidence refs, gap annotations, and receipt metadata.
```

Submission language should describe `packId` and `intentKind` as the package and intent handles. The raw `modeId` / `mode_id` field is an opaque assembly profile id in this versioned schema, not the public business taxonomy.

Negative test:

```text
Send a command/action-shaped payload such as commandCapsule or action. The public API should reject it.
```

## Tool Annotation Summary

| Tool               | Portal grouping        | Notes                                                                                                    |
| ------------------ | ---------------------- | -------------------------------------------------------------------------------------------------------- |
| `context_assemble` | Read-only              | Assembles metadata-only ContextPackages.                                                                 |
| `context_explain`  | Read-only              | Explains package-specific assembly metadata and exclusion policy refs.                                   |
| `context_evidence` | Read-only              | Returns evidence-reference metadata only and rejects refs outside the requested package.                 |
| `context_status`   | Read-only              | Returns connector readiness metadata.                                                                    |
| `context_feedback` | Write, non-destructive | Accepts connector usefulness feedback and returns a synthetic feedback receipt; no source-system writes. |

## Pre-Submit Checklist

- [ ] Confirm the Claude.ai submitting account is in a Team or Enterprise organization.
- [ ] Confirm the account has Owner, Primary owner, Directory, or Libraries permission.
- [ ] Confirm approved support mailbox.
- [ ] Provide or upload the approved icon URL: `https://mcp.enterprisecontextfabric.com/assets/contextecf-claude-icon-512-white.png`.
- [ ] Run MCP Inspector against `https://mcp.enterprisecontextfabric.com/mcp`.
- [ ] Test one happy path for support, sales, productivity, and netops.
- [ ] Test command/action payload rejection.
- [ ] Confirm the landing page copy matches the shipped tool schema.
- [ ] Confirm no listing text implies public access to private enterprise systems.
- [ ] Submit through the Claude.ai portal.
- [ ] Track review status in the Claude.ai submissions dashboard.

## Do Not Claim

- Do not claim Anthropic endorsement, partnership, or certification before publication.
- Do not imply the public demo connects to customer systems.
- Do not describe `context_feedback` as a source-system write tool.
- Do not submit as an MCP App unless interactive Claude UI elements are added.
- Do not include screenshots as a required asset unless the submission type changes to MCP App.
