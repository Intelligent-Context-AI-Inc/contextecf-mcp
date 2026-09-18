# ContextECF MCP For Docker

## An AI Agent Gone Haywire Is Like An Octopus Loose In The Control Room

## Give Agents The Context They Need, Not Access To Everything

Enterprise AI agents become more useful when they can work with business context. But connecting an agent directly to databases, source systems, credentials, or unrestricted document stores creates a bigger question:

**How do you give the agent enough context to do the job without expanding its access to everything behind that context?**

ContextECF MCP provides a governed layer in between.

It is a read-only Model Context Protocol server that lets an AI agent request the context needed for a task and receive a governed `ContextPackage` without giving the agent direct database access.

## Give The Agent A Package, Not The Keys

Instead of letting an agent browse enterprise systems directly, ContextECF assembles a controlled context package for the task.

Each package can show:

- what context was selected
- what was excluded and why
- whether the available context is sufficient
- what gaps remain
- which metadata-only evidence references support the package
- a stable package hash
- receipt-style provenance for the run

The result is an agent context boundary that is more inspectable, repeatable, and auditable.

## Run The Synthetic Demo Locally

The Docker image defaults to synthetic demo mode over stdio for Docker MCP Toolkit compatibility:

```bash
docker build -t intelligentcontext/contextecf-mcp:local .
docker run --rm -i intelligentcontext/contextecf-mcp:local
```

For HTTP testing, run:

```bash
docker compose up --build
curl http://127.0.0.1:3001/health
```

Or without Compose:

```bash
docker run --rm \
  -e CONTEXTECF_MCP_DEMO=true \
  -e CONTEXTECF_MCP_TRANSPORT=http \
  -p 127.0.0.1:3001:3001 \
  intelligentcontext/contextecf-mcp:local
```

The HTTP endpoint is:

```text
http://127.0.0.1:3001/mcp
```

## See The Model Before Connecting Anything Real

Run ContextECF MCP locally in **Synthetic demo mode** with no secrets, login, or external systems.

Use synthetic support, sales, productivity, and netops scenarios to see how an agent requests context and how ContextECF returns an assembled package, including selected source categories, exclusion reason codes, sufficiency, gaps, evidence references, hashes, and receipts.

Nothing in the public demo needs access to your enterprise environment.

## When You Are Ready To Use Your Own Context

In **Private Fabric mode**, point the container at your own ContextECF endpoint and enterprise authentication layer.

```bash
docker run --rm -i \
  -e CONTEXTECF_MCP_DEMO=false \
  -e CONTEXTECF_ENDPOINT=https://fabric.example.com \
  -e CONTEXTECF_TENANT_ID=tenant_123 \
  -e CONTEXTECF_AUTH_MODE=oidc \
  -e CONTEXTECF_ACCESS_TOKEN="$TOKEN" \
  intelligentcontext/contextecf-mcp:local
```

For API-client credentials:

```bash
docker run --rm -i \
  -e CONTEXTECF_MCP_DEMO=false \
  -e CONTEXTECF_ENDPOINT=https://fabric.example.com \
  -e CONTEXTECF_TENANT_ID=tenant_123 \
  -e CONTEXTECF_AUTH_MODE=api_key \
  -e CONTEXTECF_CLIENT_ID="$CLIENT_ID" \
  -e CONTEXTECF_CLIENT_SECRET="$CLIENT_SECRET" \
  intelligentcontext/contextecf-mcp:local
```

ContextECF can sit between your agents and approved enterprise systems so the agent receives governed context packages rather than direct credentials or unrestricted access to underlying data.

Deploy it behind your domain and apply your own identity, permissions, and policy controls while keeping the same MCP tool contract.

## Where It Fits

ContextECF MCP is designed for teams asking questions such as:

**Support**  
What context should an agent have before drafting an incident brief?

**Sales**  
What governed account and renewal context should be assembled before a strategic customer call?

**Executive productivity**  
What context does an executive need before walking into a budget review?

**NetOps**  
What incident context should be assembled after a service degradation alert?

**Developer workflows**  
What governed repository or architecture context should an agent receive before suggesting a change?

## A Practical Path From Demo To Private Deployment

Start without connecting anything.

1. Run the Docker demo locally.
2. Test the five MCP tools against the synthetic workflows.
3. Inspect what was selected, excluded, missing, hashed, and recorded.
4. Decide whether the governance model fits your agent architecture.
5. Deploy a private ContextECF Fabric endpoint.
6. Connect only approved enterprise systems.
7. Use the same MCP interface from Claude, internal agents, n8n, Dify, or other MCP-compatible hosts.

## The Trust Boundary

The public Docker demo is synthetic and read-only. It does not connect to your enterprise systems, write to source systems, execute commands, or expose raw customer data.

In a private deployment, ContextECF is designed to preserve that boundary: **agents ask for the context required to do their work; ContextECF governs what context they receive.**

## One-Line Description

Give AI agents governed enterprise context for the task at hand without giving them direct database access.

## Tagline

**Give agents the right context, not the whole database.**
