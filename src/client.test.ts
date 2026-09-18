import { createHash } from 'node:crypto';

import { describe, expect, it } from 'vitest';

import { ContextEcfClient } from './client.js';
import { hashCanonicalPackageContent } from './demo-catalog.js';
import { buildSyntheticContextPackage } from './demo.js';
import { verifyContextPackageReceipt } from './receipt.js';

describe('ContextEcfClient', () => {
  it('calls the public context endpoint and verifies the package', async () => {
    const packageData = livePackage();
    const calls: string[] = [];
    const client = new ContextEcfClient(
      {
        endpoint: 'https://fabric.example.test',
        tenantId: 'tenant-a',
        authMode: 'oidc',
        accessToken: 'token',
      },
      async (url) => {
        calls.push(String(url));
        return jsonResponse({ ok: true, data: packageData });
      }
    );

    const result = await client.assemble({
      packId: 'support-sla-p1',
      intentKind: 'triage_sla_breach',
      userRequest: 'Summarize governed context.',
      timeWindow: { lookbackDays: 7, lookaheadDays: 0 },
      sourceCapabilities: ['ticket'],
    });

    expect(calls).toEqual(['https://fabric.example.test/public/v1/context/assemble']);
    expect(result.context_package_id).toBe('ctx-1');
  });

  it('exchanges existing Agent API credentials in api_key mode', async () => {
    const client = new ContextEcfClient(
      {
        endpoint: 'https://fabric.example.test',
        tenantId: 'tenant-a',
        authMode: 'api_key',
        clientId: 'client',
        clientSecret: 'secret',
      },
      async (url) => {
        if (String(url).endsWith('/v1/agent-api/auth/token')) {
          return jsonResponse({ ok: true, data: { access_token: 'agent-token', expires_in: 300 } });
        }
        return jsonResponse({ ok: true, data: livePackage() });
      }
    );

    await expect(
      client.assemble({
        packId: 'support-sla-p1',
        intentKind: 'triage_sla_breach',
        userRequest: 'Summarize governed context.',
        timeWindow: { lookbackDays: 7, lookaheadDays: 0 },
        sourceCapabilities: ['ticket'],
      })
    ).resolves.toMatchObject({ context_package_id: 'ctx-1' });
  });

  it('rejects tampered package hashes', () => {
    const tampered = { ...livePackage(), sufficiency_score: 0.1 };
    expect(() => verifyContextPackageReceipt(tampered)).toThrow(/hash verification failed/u);
  });

  it('allows synthetic demo output with no network receipt', () => {
    const synthetic = buildSyntheticContextPackage();
    expect(() => verifyContextPackageReceipt(synthetic)).not.toThrow();
    expect(synthetic.synthetic).toBe(true);
  });

  it('keeps synthetic package hash stable while receipt changes per run', async () => {
    const input = {
      packId: 'support-sla-p1',
      intentKind: 'triage_sla_breach',
      userRequest: 'Summarize governed context.',
      timeWindow: { lookbackDays: 7, lookaheadDays: 0 },
      sourceCapabilities: ['ticket'],
      modeId: 'synthetic-support-sla-p1',
    };

    const first = buildSyntheticContextPackage(input);
    await new Promise((resolve) => setTimeout(resolve, 5));
    const second = buildSyntheticContextPackage(input);

    expect(first.package_hash).toBe(second.package_hash);
    expect(first.generated_at).not.toBe(second.generated_at);
    expect(first.receipt_refs[0]?.receipt_hash).not.toBe(second.receipt_refs[0]?.receipt_hash);
    expect(first.receipt_refs[0]?.receipt_id).not.toBe(second.receipt_refs[0]?.receipt_id);
    expect(() => verifyContextPackageReceipt(first)).not.toThrow();
    expect(() => verifyContextPackageReceipt(second)).not.toThrow();
  });

  it('hashes canonical selection content while ignoring source order', () => {
    const canonical = syntheticHashInput();
    const reordered = {
      ...canonical,
      selected_sources: [...canonical.selected_sources].reverse(),
      excluded_sources: [...canonical.excluded_sources].reverse(),
      evidence_refs: [...canonical.evidence_refs].reverse(),
      gap_annotations: [...canonical.gap_annotations].reverse(),
    };
    const sourceRefChanged = {
      ...canonical,
      selected_sources: canonical.selected_sources.map((source, index) =>
        index === 0 ? { ...source, source_ref: 'synthetic:zendesk:ticket:TKT-9999' } : source
      ),
    };
    const policyRefChanged = {
      ...canonical,
      excluded_sources: canonical.excluded_sources.map((source, index) =>
        index === 0
          ? { ...source, policy_ref: 'synthetic-policy:support-customer-private-notes' }
          : source
      ),
    };

    expect(hashCanonicalPackageContent(reordered)).toBe(hashCanonicalPackageContent(canonical));
    expect(hashCanonicalPackageContent(sourceRefChanged)).not.toBe(
      hashCanonicalPackageContent(canonical)
    );
    expect(hashCanonicalPackageContent(policyRefChanged)).not.toBe(
      hashCanonicalPackageContent(canonical)
    );
  });

  it('rejects action-shaped synthetic demo assemble input', () => {
    expect(() =>
      buildSyntheticContextPackage({
        packId: 'support-sla-p1',
        intentKind: 'triage_sla_breach',
        userRequest: 'Summarize governed context.',
        timeWindow: { lookbackDays: 7, lookaheadDays: 0 },
        sourceCapabilities: ['ticket'],
        commandCapsule: { operation: 'delete' },
      } as unknown as Parameters<typeof buildSyntheticContextPackage>[0])
    ).toThrow(/Unrecognized key/u);
  });
});

function livePackage() {
  const withoutHash = {
    schema_version: 'contextecf/public-mcp-context-package/v1' as const,
    context_package_id: 'ctx-1',
    tenant_id: 'tenant-a',
    pack_id: 'support-sla-p1',
    intent_kind: 'triage_sla_breach',
    sufficiency_score: 0.9,
    sufficiency_label: 'SUFFICIENT' as const,
    confidence_score: 0.9,
    selected_sources: [],
    excluded_sources: [],
    evidence_refs: ['evidence:1'],
    gap_annotations: [],
    receipt_refs: [
      {
        receipt_hash: 'a'.repeat(64),
        signature_algorithm: 'Ed25519',
        signature_value: 'signature',
      },
    ],
    generated_at: '2026-08-22T00:00:00.000Z',
    synthetic: false,
    invariants: {
      read_only: true as const,
      no_raw_source_content: true as const,
      no_internal_scoring_fields: true as const,
      receipt_verification_required: true as const,
    },
  };
  return {
    ...withoutHash,
    package_hash: createHash('sha256').update(JSON.stringify(withoutHash)).digest('hex'),
  };
}

function syntheticHashInput(): Parameters<typeof hashCanonicalPackageContent>[0] {
  return {
    schema_version: 'contextecf/public-mcp-context-package/v1',
    context_package_id: 'synthetic-context-package-support',
    tenant_id: 'synthetic-demo-tenant',
    mode_id: 'synthetic-support-sla-p1',
    pack_id: 'support-sla-p1',
    intent_kind: 'triage_sla_breach',
    sufficiency_score: 0.92,
    sufficiency_label: 'SUFFICIENT',
    confidence_score: 0.92,
    selected_sources: [
      {
        source_ref: 'synthetic:zendesk:ticket:TKT-8821',
        decision: 'selected',
        reason: 'selected_for_required_evidence',
        evidence_refs: ['synthetic:evidence:support-ticket-summary'],
      },
      {
        source_ref: 'synthetic:crm:account:apex-dynamics',
        decision: 'selected',
        reason: 'anchors_active_account',
        evidence_refs: ['synthetic:evidence:support-account-plan'],
      },
    ],
    excluded_sources: [
      {
        source_ref: 'synthetic:pagerduty:private-note:exec-only',
        decision: 'excluded',
        reason: 'excluded_by_source_policy',
        policy_ref: 'synthetic-policy:support-exec-private-notes',
        evidence_refs: [],
      },
    ],
    evidence_refs: [
      'synthetic:evidence:support-account-plan',
      'synthetic:evidence:support-ticket-summary',
    ],
    gap_annotations: ['synthetic:gap:review-required'],
    synthetic: true,
  };
}

function jsonResponse(payload: unknown, status = 200): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}
