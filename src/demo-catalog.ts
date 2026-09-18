import { createHash } from 'node:crypto';

import type { ContextAssembleInput, PublicMcpContextPackage } from './schemas.js';
import { PublicMcpContextPackageSchema } from './schemas.js';

export type DemoUseCaseId = 'support' | 'sales' | 'productivity' | 'netops';

type DemoSource = {
  source_ref: string;
  reason: string;
  evidence_refs: string[];
  policy_ref?: string;
};

type DemoScenario = {
  id: DemoUseCaseId;
  modeId: string;
  packId: string;
  intentKind: string;
  title: string;
  persona: string;
  userRequest: string;
  sourceCapabilities: string[];
  selectedSources: DemoSource[];
  excludedSources: DemoSource[];
  evidenceRefs: string[];
  gapAnnotations: string[];
  sufficiencyScore: number;
};

export const DEMO_SCENARIOS: DemoScenario[] = [
  {
    id: 'support',
    modeId: 'synthetic-support-sla-p1',
    packId: 'support-sla-p1',
    intentKind: 'triage_sla_breach',
    title: 'P1 Support Escalation',
    persona: 'Casey Hernandez, escalation lead',
    userRequest:
      'A P1 customer escalation just came in. Assemble ticket, SLA, customer account, knowledge-base, and prior conversation context before drafting an internal incident brief.',
    sourceCapabilities: ['ticket', 'sla', 'customer_record', 'knowledge_base', 'conversation'],
    selectedSources: [
      {
        source_ref: 'synthetic:zendesk:ticket:TKT-8821',
        reason: 'selected_for_required_evidence',
        evidence_refs: ['synthetic:evidence:support-ticket-summary'],
      },
      {
        source_ref: 'synthetic:crm:account:apex-dynamics',
        reason: 'anchors_active_account',
        evidence_refs: ['synthetic:evidence:support-account-plan'],
      },
      {
        source_ref: 'synthetic:kb:article:db-timeout-runbook',
        reason: 'matched_resolution_pattern',
        evidence_refs: ['synthetic:evidence:support-kb-match'],
      },
    ],
    excludedSources: [
      {
        source_ref: 'synthetic:pagerduty:private-note:exec-only',
        reason: 'excluded_by_source_policy',
        policy_ref: 'synthetic-policy:support-exec-private-notes',
        evidence_refs: [],
      },
    ],
    evidenceRefs: [
      'synthetic:evidence:support-ticket-summary',
      'synthetic:evidence:support-account-plan',
      'synthetic:evidence:support-kb-match',
    ],
    gapAnnotations: [],
    sufficiencyScore: 0.92,
  },
  {
    id: 'sales',
    modeId: 'synthetic-sales-renewal',
    packId: 'sales-renewal',
    intentKind: 'prepare_renewal_call',
    title: 'Strategic Renewal Call',
    persona: 'Devon Park, account executive',
    userRequest:
      'Prepare for a strategic renewal call. Assemble opportunity, account history, stakeholder, meeting, and email-thread context.',
    sourceCapabilities: [
      'opportunity',
      'account_history',
      'stakeholder',
      'calendar',
      'email_thread',
    ],
    selectedSources: [
      {
        source_ref: 'synthetic:salesforce:opportunity:Q4-renewal',
        reason: 'selected_for_required_evidence',
        evidence_refs: ['synthetic:evidence:sales-opportunity-summary'],
      },
      {
        source_ref: 'synthetic:calendar:meeting:renewal-prep',
        reason: 'anchors_upcoming_decision',
        evidence_refs: ['synthetic:evidence:sales-meeting-context'],
      },
      {
        source_ref: 'synthetic:gong:call-summary:security-review',
        reason: 'matched_recent_stakeholder_signal',
        evidence_refs: ['synthetic:evidence:sales-stakeholder-signal'],
      },
    ],
    excludedSources: [
      {
        source_ref: 'synthetic:finance:margin-model',
        reason: 'excluded_by_source_policy',
        policy_ref: 'synthetic-policy:sales-finance-margin-restricted',
        evidence_refs: [],
      },
    ],
    evidenceRefs: [
      'synthetic:evidence:sales-opportunity-summary',
      'synthetic:evidence:sales-meeting-context',
      'synthetic:evidence:sales-stakeholder-signal',
    ],
    gapAnnotations: ['synthetic:gap:legal-redlines-not-authorized'],
    sufficiencyScore: 0.84,
  },
  {
    id: 'productivity',
    modeId: 'synthetic-productivity-meeting-prep',
    packId: 'productivity-meeting-prep',
    intentKind: 'prepare_budget_review',
    title: 'Executive Budget Review',
    persona: 'Taylor Winslow, VP engineering',
    userRequest:
      'Prepare an executive for a cross-functional budget review. Assemble calendar, docs, tasks, recent decisions, and open commitments.',
    sourceCapabilities: ['calendar', 'docs', 'tasks', 'decision_log', 'open_commitments'],
    selectedSources: [
      {
        source_ref: 'synthetic:calendar:event:q3-budget-review',
        reason: 'anchors_upcoming_meeting',
        evidence_refs: ['synthetic:evidence:productivity-calendar-context'],
      },
      {
        source_ref: 'synthetic:docs:budget-brief',
        reason: 'selected_for_required_evidence',
        evidence_refs: ['synthetic:evidence:productivity-brief-summary'],
      },
      {
        source_ref: 'synthetic:tasks:open-commitments',
        reason: 'matched_open_commitments',
        evidence_refs: ['synthetic:evidence:productivity-open-items'],
      },
    ],
    excludedSources: [
      {
        source_ref: 'synthetic:hr:compensation-planning',
        reason: 'excluded_by_source_policy',
        policy_ref: 'synthetic-policy:hr-compensation-confidential',
        evidence_refs: [],
      },
    ],
    evidenceRefs: [
      'synthetic:evidence:productivity-calendar-context',
      'synthetic:evidence:productivity-brief-summary',
      'synthetic:evidence:productivity-open-items',
    ],
    gapAnnotations: [],
    sufficiencyScore: 0.88,
  },
  {
    id: 'netops',
    modeId: 'synthetic-netops-incident',
    packId: 'netops-incident-response',
    intentKind: 'triage_service_degradation',
    title: 'Service Degradation Triage',
    persona: 'Priya Nambiar, platform lead',
    userRequest:
      'A service degradation alert fired. Assemble metrics, ServiceNow incident history, topology, runbook, and recent change context.',
    sourceCapabilities: ['metrics', 'incident_history', 'topology', 'runbook', 'change_history'],
    selectedSources: [
      {
        source_ref: 'synthetic:datadog:metric:api-latency',
        reason: 'selected_for_required_evidence',
        evidence_refs: ['synthetic:evidence:netops-metric-window'],
      },
      {
        source_ref: 'synthetic:servicenow:incident:INC-4492',
        reason: 'matched_incident_history',
        evidence_refs: ['synthetic:evidence:netops-incident-history'],
      },
      {
        source_ref: 'synthetic:runbook:checkout-timeout',
        reason: 'matched_resolution_pattern',
        evidence_refs: ['synthetic:evidence:netops-runbook-match'],
      },
    ],
    excludedSources: [
      {
        source_ref: 'synthetic:security:active-investigation',
        reason: 'excluded_by_source_policy',
        policy_ref: 'synthetic-policy:security-investigation-need-to-know',
        evidence_refs: [],
      },
    ],
    evidenceRefs: [
      'synthetic:evidence:netops-metric-window',
      'synthetic:evidence:netops-incident-history',
      'synthetic:evidence:netops-runbook-match',
    ],
    gapAnnotations: ['synthetic:gap:change-owner-confirmation-needed'],
    sufficiencyScore: 0.86,
  },
];

export function buildScenarioContextPackage(
  input: Partial<ContextAssembleInput> = {}
): PublicMcpContextPackage {
  const scenario = selectScenario(input);
  if (!scenario) {
    throw new Error('Request does not match a known synthetic demo scenario');
  }
  const generatedAt = new Date().toISOString();
  const selectedSources = scenario.selectedSources.map((source) => ({
    ...source,
    decision: 'selected' as const,
  }));
  const excludedSources = scenario.excludedSources.map((source) => ({
    ...source,
    decision: 'excluded' as const,
  }));
  const packageHash = hashCanonicalPackageContent({
    schema_version: 'contextecf/public-mcp-context-package/v1',
    context_package_id: `synthetic-context-package-${scenario.id}`,
    tenant_id: 'synthetic-demo-tenant',
    mode_id: scenario.modeId,
    pack_id: scenario.packId,
    intent_kind: scenario.intentKind,
    sufficiency_score: scenario.sufficiencyScore,
    sufficiency_label: 'SUFFICIENT',
    confidence_score: scenario.sufficiencyScore,
    selected_sources: selectedSources,
    excluded_sources: excludedSources,
    evidence_refs: scenario.evidenceRefs,
    gap_annotations: scenario.gapAnnotations,
    synthetic: true,
  });
  const receiptHash = createHash('sha256')
    .update(
      JSON.stringify({
        package_hash: packageHash,
        context_package_id: `synthetic-context-package-${scenario.id}`,
        tenant_id: 'synthetic-demo-tenant',
        generated_at: generatedAt,
        signing_key_id: 'synthetic-demo-key',
      })
    )
    .digest('hex');
  const receiptId = `synthetic-receipt-${receiptHash.slice(0, 16)}`;
  const withoutHash = {
    schema_version: 'contextecf/public-mcp-context-package/v1' as const,
    context_package_id: `synthetic-context-package-${scenario.id}`,
    tenant_id: 'synthetic-demo-tenant',
    mode_id: scenario.modeId,
    pack_id: scenario.packId,
    intent_kind: scenario.intentKind,
    sufficiency_score: scenario.sufficiencyScore,
    sufficiency_label: 'SUFFICIENT' as const,
    confidence_score: scenario.sufficiencyScore,
    selected_sources: selectedSources,
    excluded_sources: excludedSources,
    evidence_refs: scenario.evidenceRefs,
    gap_annotations: scenario.gapAnnotations,
    assembled_context: buildAssembledContextPreview(scenario),
    receipt_refs: [
      {
        receipt_id: receiptId,
        receipt_hash: receiptHash,
        schema_version: 'contextecf/synthetic-demo-receipt/v1',
        signing_key_id: 'synthetic-demo-key',
        signature_algorithm: 'synthetic-sha256-demo',
        signature_value: createHash('sha256').update(receiptHash).digest('base64url'),
      },
    ],
    generated_at: generatedAt,
    synthetic: true,
    invariants: {
      read_only: true as const,
      no_raw_source_content: true as const,
      no_internal_scoring_fields: true as const,
      receipt_verification_required: true as const,
    },
  };

  return PublicMcpContextPackageSchema.parse({
    ...withoutHash,
    package_hash: packageHash,
  });
}

function buildAssembledContextPreview(scenario: DemoScenario) {
  const common = {
    synthetic: true as const,
    content_boundary: 'synthetic_metadata_derived_preview' as const,
    disclaimer:
      'Synthetic preview assembled from authorized metadata and scenario fixtures. It is not raw source text, customer content, or private scoring output.',
  };

  switch (scenario.id) {
    case 'support':
      return {
        ...common,
        summary:
          'A P1 escalation package is ready for an internal incident brief: ticket metadata, account context, SLA posture, and a matching knowledge-base runbook were admitted; an exec-only private note was withheld by policy.',
        sections: [
          {
            title: 'Situation',
            content:
              'The escalation is anchored on a synthetic support ticket for Apex Dynamics, with active-account context and SLA-sensitive triage intent.',
            evidence_refs: [
              'synthetic:evidence:support-ticket-summary',
              'synthetic:evidence:support-account-plan',
            ],
          },
          {
            title: 'Likely next step',
            content:
              'Draft an internal brief that cites the ticket, account, and runbook references, and explicitly notes that exec-only PagerDuty notes were excluded.',
            evidence_refs: ['synthetic:evidence:support-kb-match'],
          },
        ],
      };
    case 'sales':
      return {
        ...common,
        summary:
          'A renewal-prep package is assembled from opportunity, meeting, and stakeholder signals. Finance margin details were excluded, and legal redlines remain a visible gap.',
        sections: [
          {
            title: 'Renewal posture',
            content:
              'The synthetic opportunity is active for a strategic renewal conversation, with meeting context and a recent security-review stakeholder signal admitted.',
            evidence_refs: [
              'synthetic:evidence:sales-opportunity-summary',
              'synthetic:evidence:sales-meeting-context',
            ],
          },
          {
            title: 'Known gap',
            content:
              'Legal redlines are not authorized in this package, so Claude should prepare the call with an explicit caveat instead of inventing contract terms.',
            evidence_refs: ['synthetic:evidence:sales-stakeholder-signal'],
          },
        ],
      };
    case 'productivity':
      return {
        ...common,
        summary:
          'An executive budget-review package is assembled from calendar, budget-brief, and open-commitment metadata. Compensation-planning material is excluded.',
        sections: [
          {
            title: 'Meeting frame',
            content:
              'The package orients the executive around the upcoming budget review, the relevant synthetic brief, and currently open commitments.',
            evidence_refs: [
              'synthetic:evidence:productivity-calendar-context',
              'synthetic:evidence:productivity-brief-summary',
            ],
          },
          {
            title: 'Preparation cue',
            content:
              'Use the package to brief decisions and commitments while avoiding confidential HR compensation-planning material.',
            evidence_refs: ['synthetic:evidence:productivity-open-items'],
          },
        ],
      };
    case 'netops':
      return {
        ...common,
        summary:
          'A service-degradation package is assembled from metric-window, incident-history, and runbook metadata. A security investigation source is excluded and change-owner confirmation is still needed.',
        sections: [
          {
            title: 'Incident frame',
            content:
              'The package points triage toward elevated API latency, a related ServiceNow incident pattern, and a checkout-timeout runbook match.',
            evidence_refs: [
              'synthetic:evidence:netops-metric-window',
              'synthetic:evidence:netops-incident-history',
            ],
          },
          {
            title: 'Operational caveat',
            content:
              'Recent-change context is sufficient for first triage, but ownership confirmation remains a gap and active security investigation details stay excluded.',
            evidence_refs: ['synthetic:evidence:netops-runbook-match'],
          },
        ],
      };
  }
}

function selectScenario(input: Partial<ContextAssembleInput>): DemoScenario | undefined {
  if (!input.packId && !input.modeId && !input.intentKind) {
    return DEMO_SCENARIOS[0];
  }
  const normalizedPack = input.packId?.toLowerCase();
  const normalizedMode = input.modeId?.toLowerCase();
  const normalizedIntent = input.intentKind?.toLowerCase();
  return (
    DEMO_SCENARIOS.find(
      (scenario) =>
        scenario.packId === normalizedPack ||
        scenario.modeId === normalizedMode ||
        scenario.intentKind === normalizedIntent ||
        scenario.id === normalizedPack
    ) ??
    DEMO_SCENARIOS.find((scenario) =>
      [normalizedPack, normalizedMode, normalizedIntent].some((value) =>
        value?.includes(scenario.id)
      )
    )
  );
}

export function findScenarioForPackage(contextPackageId?: string, packId?: string): DemoScenario {
  const normalizedPackage = contextPackageId?.toLowerCase();
  const normalizedPack = packId?.toLowerCase();
  return (
    DEMO_SCENARIOS.find((scenario) =>
      [
        `synthetic-context-package-${scenario.id}`,
        `synthetic-context-package-${scenario.packId}`,
        scenario.packId,
        scenario.modeId,
        scenario.id,
      ].some((candidate) => candidate === normalizedPackage || candidate === normalizedPack)
    ) ?? DEMO_SCENARIOS[0]
  );
}

export function explainSyntheticContextPackage(input: {
  context_package_id?: string;
  packId?: string;
}) {
  const scenario = findScenarioForPackage(input.context_package_id, input.packId);
  return {
    context_package_id: input.context_package_id ?? `synthetic-context-package-${scenario.id}`,
    pack_id: scenario.packId,
    intent_kind: scenario.intentKind,
    sufficiency_score: scenario.sufficiencyScore,
    sufficiency_label: 'SUFFICIENT',
    selected_source_count: scenario.selectedSources.length,
    excluded_source_count: scenario.excludedSources.length,
    evidence_refs: scenario.evidenceRefs,
    gap_annotations: scenario.gapAnnotations,
    exclusions: scenario.excludedSources.map((source) => ({
      source_ref: source.source_ref,
      reason: source.reason,
      policy_ref: source.policy_ref,
    })),
    explanation: `${scenario.title} selected ${scenario.selectedSources.length} authorized source categories, excluded ${scenario.excludedSources.length} restricted source by policy reference, and returned only metadata, evidence references, sufficiency, gaps, and receipt data.`,
    synthetic: true,
  };
}

export function findSyntheticEvidence(input: {
  context_package_id?: string;
  evidence_ref?: string;
}) {
  const scenario = findScenarioForPackage(input.context_package_id);
  const evidenceRef = input.evidence_ref;
  if (!evidenceRef || !scenario.evidenceRefs.includes(evidenceRef)) {
    throw new Error(`Evidence reference is not part of ${scenario.packId}`);
  }

  return {
    context_package_id: input.context_package_id ?? `synthetic-context-package-${scenario.id}`,
    pack_id: scenario.packId,
    evidence_ref: evidenceRef,
    status: 'metadata_only',
    synthetic: true,
    source_family: scenario.id,
    summary:
      'Synthetic metadata reference only. The public demo does not return source bodies, customer content, credentials, or internal scoring fields.',
  };
}

export function buildSyntheticFeedbackReceipt(input: {
  context_package_id?: string;
  rating?: string;
  usage_context?: string;
}) {
  const scenario = findScenarioForPackage(input.context_package_id);
  const acceptedAt = new Date().toISOString();
  const feedbackId = createHash('sha256')
    .update(
      `${scenario.id}:${input.context_package_id ?? scenario.packId}:${input.rating ?? 'unspecified'}:${input.usage_context ?? 'unspecified'}:${acceptedAt}`
    )
    .digest('hex')
    .slice(0, 16);
  const receiptHash = createHash('sha256')
    .update(`${feedbackId}:${scenario.packId}:${acceptedAt}`)
    .digest('hex');

  return {
    accepted: true,
    synthetic: true,
    context_package_id: input.context_package_id ?? `synthetic-context-package-${scenario.id}`,
    feedback_id: `synthetic-feedback-${feedbackId}`,
    receipt_ref: `synthetic-feedback-receipt-${feedbackId}`,
    receipt_hash: receiptHash,
    schema_version: 'contextecf/synthetic-feedback-receipt/v1',
    accepted_at: acceptedAt,
  };
}

export function hashCanonicalPackageContent(input: {
  schema_version: string;
  context_package_id: string;
  tenant_id: string;
  mode_id?: string;
  pack_id: string;
  intent_kind: string;
  sufficiency_score: number;
  sufficiency_label: string;
  confidence_score: number;
  selected_sources: Array<{
    source_ref: string;
    decision: string;
    reason: string;
    evidence_refs?: string[];
    policy_ref?: string;
  }>;
  excluded_sources: Array<{
    source_ref: string;
    decision: string;
    reason: string;
    evidence_refs?: string[];
    policy_ref?: string;
  }>;
  evidence_refs: string[];
  gap_annotations: string[];
  synthetic: boolean;
}): string {
  return createHash('sha256')
    .update(
      JSON.stringify({
        schema_version: input.schema_version,
        context_package_id: input.context_package_id,
        tenant_id: input.tenant_id,
        mode_id: input.mode_id,
        pack_id: input.pack_id,
        intent_kind: input.intent_kind,
        sufficiency_score: input.sufficiency_score,
        sufficiency_label: input.sufficiency_label,
        confidence_score: input.confidence_score,
        selected_sources: canonicalSources(input.selected_sources),
        excluded_sources: canonicalSources(input.excluded_sources),
        evidence_refs: [...input.evidence_refs].sort(),
        gap_annotations: [...input.gap_annotations].sort(),
        synthetic: input.synthetic,
      })
    )
    .digest('hex');
}

function canonicalSources(
  sources: Array<{
    source_ref: string;
    decision: string;
    reason: string;
    evidence_refs?: string[];
    policy_ref?: string;
  }>
) {
  return sources
    .map((source) => ({
      source_ref: source.source_ref,
      decision: source.decision,
      reason: source.reason,
      policy_ref: source.policy_ref,
      evidence_refs: [...(source.evidence_refs ?? [])].sort(),
    }))
    .sort((a, b) => a.source_ref.localeCompare(b.source_ref));
}
