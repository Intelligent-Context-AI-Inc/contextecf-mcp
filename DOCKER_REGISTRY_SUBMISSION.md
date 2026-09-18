# Docker MCP Registry Submission Packet

Docker MCP Registry:

```text
https://github.com/docker/mcp-registry
```

Catalog surfaces:

- Docker Hub MCP catalog: `https://hub.docker.com/mcp`
- Docker Desktop MCP Toolkit
- Docker Hub `mcp` namespace for Docker-built images

## Recommendation

Submit **both** surfaces if Docker accepts them:

1. **Local containerized server:** best for Docker Desktop users who want to run the synthetic demo locally and inspect the MCP boundary before connecting anything real.
2. **Remote hosted server:** best for users who want to try the already-live no-login endpoint at `https://mcp.enterprisecontextfabric.com/mcp`.

If only one is practical, submit the **local containerized server** first. It is a better fit for Docker discovery because Docker users expect something runnable and isolated.

## Directory Copy

Title:

```text
ContextECF MCP
```

One-line description:

```text
Give AI agents governed enterprise context for the task at hand without giving them direct database access.
```

Short description:

```text
Read-only MCP server that returns governed ContextPackages with synthetic assembled-context previews, selected source categories, exclusions, sufficiency, gaps, metadata-only evidence refs, stable package hashes, and receipt-style provenance.
```

Tags:

```text
ai
mcp
enterprise
governance
context
security
productivity
sales
support
netops
```

Category:

```text
ai
```

Icon:

```text
https://mcp.enterprisecontextfabric.com/assets/intelligent-context-ai-icon.png
```

If Docker requires a simpler favicon:

```text
https://www.google.com/s2/favicons?domain=enterprisecontextfabric.com&sz=64
```

Documentation:

```text
https://mcp.enterprisecontextfabric.com/
```

Docker landing page:

```text
https://enterprisecontextfabric.com/dockermcp
```

## Local Containerized Server Entry

Create this structure in a fork of `docker/mcp-registry`:

```text
servers/contextecf-mcp/
  server.yaml
  readme.md
  tools.json
```

`server.yaml`:

```yaml
name: contextecf-mcp
image: mcp/contextecf-mcp
type: server
meta:
  category: ai
  tags:
    - ai
    - mcp
    - enterprise
    - governance
    - context
    - security
    - productivity
    - sales
    - support
    - netops
about:
  title: ContextECF MCP
  description: Give AI agents governed enterprise context for the task at hand without giving them direct database access.
  icon: https://www.google.com/s2/favicons?domain=enterprisecontextfabric.com&sz=64
source:
  project: https://github.com/Intelligent-Context-AI-Inc/ContextECF-GITHUB
  commit: UPDATE_AFTER_DOCKER_PACKAGING_COMMIT
  dockerfile: public/contextecf-mcp/Dockerfile
  directory: public/contextecf-mcp
run:
  env:
    CONTEXTECF_MCP_DEMO: 'true'
```

Notes:

- This entry asks Docker to build and host the image as `mcp/contextecf-mcp`.
- Docker-built images can receive Docker's enhanced security features: signatures, provenance, SBOMs, and automatic security updates.
- The image defaults to synthetic demo mode over stdio, so it can list tools without real credentials.

## Remote Hosted Server Entry

Create this structure in a fork of `docker/mcp-registry`:

```text
servers/contextecf-mcp-remote/
  server.yaml
  readme.md
  tools.json
```

`server.yaml`:

```yaml
name: contextecf-mcp-remote
type: remote
meta:
  category: ai
  tags:
    - ai
    - mcp
    - enterprise
    - governance
    - context
    - remote
    - productivity
    - sales
    - support
    - netops
about:
  title: ContextECF MCP
  description: Hosted synthetic demo endpoint for governed enterprise context packages without direct database access.
  icon: https://www.google.com/s2/favicons?domain=enterprisecontextfabric.com&sz=64
remote:
  transport_type: streamable-http
  url: https://mcp.enterprisecontextfabric.com/mcp
source:
  project: https://github.com/Intelligent-Context-AI-Inc/ContextECF-GITHUB
```

Remote `tools.json` can be `[]` if Docker treats the server as dynamic. If Docker reviewers want explicit tools, use the tools list below.

## `readme.md`

Use this for either local or remote submission:

```markdown
Docs: https://mcp.enterprisecontextfabric.com/

Docker guide: https://github.com/Intelligent-Context-AI-Inc/ContextECF-GITHUB/blob/main/public/contextecf-mcp/DOCKER.md

Landing page: https://enterprisecontextfabric.com/dockermcp
```

## `tools.json`

```json
[
  {
    "name": "context_assemble",
    "description": "Assemble a read-only governed ContextECF context package with a synthetic assembled-context preview, selected sources, exclusions, evidence references, sufficiency, gaps, package hash, and receipt metadata.",
    "arguments": [
      {
        "name": "packId",
        "type": "string",
        "desc": "Public package id, such as support-sla-p1 or sales-renewal.",
        "required": true
      },
      {
        "name": "intentKind",
        "type": "string",
        "desc": "Public intent handle for the context request.",
        "required": true
      },
      {
        "name": "userRequest",
        "type": "string",
        "desc": "Natural language request describing the context needed.",
        "required": true
      },
      {
        "name": "timeWindow",
        "type": "object",
        "desc": "Lookback and lookahead window for the request.",
        "required": true
      },
      {
        "name": "sourceCapabilities",
        "type": "array",
        "desc": "Allowed source capability categories for the request.",
        "required": true
      }
    ]
  },
  {
    "name": "context_explain",
    "description": "Explain public context package assembly metadata, including selected sources, exclusions, gaps, sufficiency, and policy references.",
    "arguments": [
      {
        "name": "context_package_id",
        "type": "string",
        "desc": "Context package id to explain.",
        "required": false
      },
      {
        "name": "packId",
        "type": "string",
        "desc": "Public package id to explain.",
        "required": false
      }
    ]
  },
  {
    "name": "context_evidence",
    "description": "Return metadata for a public evidence reference without exposing source bodies.",
    "arguments": [
      {
        "name": "context_package_id",
        "type": "string",
        "desc": "Context package id that owns the evidence reference.",
        "required": true
      },
      {
        "name": "evidence_ref",
        "type": "string",
        "desc": "Evidence reference to inspect.",
        "required": true
      }
    ]
  },
  {
    "name": "context_status",
    "description": "Check ContextECF MCP readiness.",
    "arguments": []
  },
  {
    "name": "context_feedback",
    "description": "Submit non-destructive metadata-only feedback about context package usefulness.",
    "arguments": [
      {
        "name": "context_package_id",
        "type": "string",
        "desc": "Context package id receiving feedback.",
        "required": false
      },
      {
        "name": "package_hash",
        "type": "string",
        "desc": "Package hash receiving feedback.",
        "required": false
      }
    ]
  }
]
```

## Validation Commands

In Docker's `mcp-registry` fork:

```bash
task validate -- --name contextecf-mcp
task build -- --tools contextecf-mcp
task catalog -- contextecf-mcp
docker mcp catalog import "$PWD/catalogs/contextecf-mcp/catalog.yaml"
docker mcp server enable contextecf-mcp
```

Reset when done:

```bash
docker mcp catalog reset
```

## PR Note

Suggested PR title:

```text
Add ContextECF MCP server
```

Suggested PR summary:

```text
Adds ContextECF MCP, a read-only MCP server for governed enterprise context packages. The default Docker entry runs in synthetic demo mode with no secrets, login, source-system writes, command execution, or external enterprise data access. It exposes five tools for assembling, explaining, inspecting evidence metadata, checking status, and submitting non-destructive package feedback.
```
