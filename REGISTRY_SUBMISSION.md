# ContextECF MCP Registry Submission

Canonical description:

> Claude-ready governed context packages for AI agents, without direct database access.

Canonical URLs:

- Homepage and live demo: https://mcp.enterprisecontextfabric.com
- Hosted MCP endpoint: https://mcp.enterprisecontextfabric.com/mcp
- Synthetic public API: https://mcp.enterprisecontextfabric.com/public/v1/context/status
- SDK and docs sibling: https://sdk.enterprisecontextfabric.com
- Repository: https://github.com/Intelligent-Context-AI-Inc/ContextECF-GITHUB
- npm package: https://www.npmjs.com/package/@intelligentcontext/contextecf-mcp
- Claude connector guide: ./CLAUDE_CONNECTOR.md
- Anthropic directory submission packet: ./ANTHROPIC_CONNECTOR_SUBMISSION.md

## Official MCP Registry

Reference docs:

- https://modelcontextprotocol.io/registry/quickstart
- https://modelcontextprotocol.io/registry/server-json

1. Publish the npm package first.
2. Keep `package.json#mcpName` equal to `server.json#name`.
3. Validate `server.json` with the current official `mcp-publisher` CLI from the Model Context Protocol registry release, not the unrelated npm package named `mcp-publisher`.
4. Authenticate the `com.enterprisecontextfabric` namespace through DNS or another registry-supported ownership challenge.
5. Publish from this directory:

```bash
cd public/contextecf-mcp
npm ci
npm run build
npm publish --access public
tmpdir="$(mktemp -d)"
curl -fsSL "https://github.com/modelcontextprotocol/registry/releases/latest/download/mcp-publisher_$(uname -s | tr '[:upper:]' '[:lower:]')_$(uname -m | sed 's/x86_64/amd64/;s/aarch64/arm64/').tar.gz" \
  | tar -xz -C "$tmpdir" mcp-publisher
"$tmpdir/mcp-publisher" validate server.json
"$tmpdir/mcp-publisher" login dns
"$tmpdir/mcp-publisher" publish
curl "https://registry.modelcontextprotocol.io/v0.1/servers?search=com.enterprisecontextfabric/contextecf-mcp"
```

## Large MCP Directories

Submit or verify the same listing on:

- Smithery
- Glama
- PulseMCP
- LobeHub MCP
- MCP.so
- GitHub MCP discovery surfaces where eligible

Each directory entry should link to the canonical README, npm package, hosted demo, security boundary notes, and demo video. Use the canonical description unchanged.

## Claude Connector Distribution

Primary launch language:

> ContextECF Claude Connector gives Claude governed enterprise memory without giving Claude direct database access.

Checklist:

- Verify the public remote MCP endpoint: `https://mcp.enterprisecontextfabric.com/mcp`.
- Link to `CLAUDE_CONNECTOR.md` from every Claude-facing listing or sales handoff.
- Use `ANTHROPIC_CONNECTOR_SUBMISSION.md` as the Claude.ai portal copy source.
- Document individual Claude custom remote MCP connector setup.
- Document enterprise admin rollout through Claude organization connector settings where available.
- State that Phase 1 is read-only and that command/action payloads are rejected.
- List the five public tools: `context_assemble`, `context_explain`, `context_evidence`, `context_status`, `context_feedback`.
- Describe `context_feedback` as non-destructive metadata feedback, not a source-system write.
- Prepare Anthropic Connectors Directory submission as a remote MCP server if eligible.
- Include Claude Desktop local MCP install instructions as the private proof-of-concept path.
- Keep Claude Code plugin as a later read-only developer track for CodeLedger and repository context.

Anthropic Connectors Directory submission notes:

- Submit through the Claude.ai organization submission portal, which requires Team or Enterprise org access and Directory management permission.
- Use remote MCP server as the submission type. Do not submit as an MCP App unless the connector later surfaces interactive Claude UI elements.
- Keep allowed link URIs empty unless `ui/open-link` support is added later.
- Use `https://enterprisecontextfabric.com/privacy` as the privacy policy URL.
- Confirm the approved support contact and icon before final submission.

## Adjacent Marketplaces

- Dify: package a thin MCP or HTTP consumer after the hosted demo and npm package are stable.
- n8n: create `@intelligentcontext/n8n-nodes-contextecf` after MCP package stability, with provenance and packaging checks.
- Open WebUI: publish setup recipes first; add a filter or function only if the recipe is not enough.

## Listing Boundary

The public listing must say the launch server is synthetic, no-login, read-only, metadata-only, and rate-limited. Do not imply that the public demo connects to private enterprise systems.
