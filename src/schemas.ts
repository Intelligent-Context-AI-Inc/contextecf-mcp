import { z } from 'zod';

export const PublicMcpSourceDecisionSchema = z
  .object({
    source_ref: z.string().min(1),
    decision: z.enum(['selected', 'excluded', 'missing', 'timeout', 'insufficient']),
    reason: z.string().min(1),
    evidence_refs: z.array(z.string().min(1)).default([]),
    policy_ref: z.string().min(1).optional(),
  })
  .strict();

export const PublicMcpReceiptRefSchema = z
  .object({
    receipt_id: z.string().min(1).optional(),
    receipt_hash: z.string().min(1),
    schema_version: z.string().min(1).optional(),
    signing_key_id: z.string().min(1).optional(),
    signature_algorithm: z.string().min(1).optional(),
    signature_value: z.string().min(1).optional(),
    expires_at: z.string().min(1).optional(),
  })
  .strict();

export const PublicMcpAssembledContextSectionSchema = z
  .object({
    title: z.string().min(1),
    content: z.string().min(1),
    evidence_refs: z.array(z.string().min(1)).default([]),
  })
  .strict();

export const PublicMcpAssembledContextSchema = z
  .object({
    synthetic: z.literal(true),
    content_boundary: z.literal('synthetic_metadata_derived_preview'),
    disclaimer: z.string().min(1),
    summary: z.string().min(1),
    sections: z.array(PublicMcpAssembledContextSectionSchema).min(1),
  })
  .strict();

export const PublicMcpContextPackageSchema = z
  .object({
    schema_version: z.literal('contextecf/public-mcp-context-package/v1'),
    context_package_id: z.string().min(1),
    tenant_id: z.string().min(1),
    mode_id: z.string().min(1).optional(),
    pack_id: z.string().min(1),
    intent_kind: z.string().min(1),
    sufficiency_score: z.number().min(0).max(1),
    sufficiency_label: z.enum(['SUFFICIENT', 'PARTIAL', 'INSUFFICIENT']),
    confidence_score: z.number().min(0).max(1),
    selected_sources: z.array(PublicMcpSourceDecisionSchema),
    excluded_sources: z.array(PublicMcpSourceDecisionSchema),
    evidence_refs: z.array(z.string().min(1)),
    gap_annotations: z.array(z.string().min(1)),
    assembled_context: PublicMcpAssembledContextSchema.optional(),
    receipt_refs: z.array(PublicMcpReceiptRefSchema),
    package_hash: z.string().min(1),
    generated_at: z.string().min(1),
    synthetic: z.boolean().default(false),
    invariants: z
      .object({
        read_only: z.literal(true),
        no_raw_source_content: z.literal(true),
        no_internal_scoring_fields: z.literal(true),
        receipt_verification_required: z.literal(true),
      })
      .strict(),
  })
  .strict();

export type PublicMcpContextPackage = z.infer<typeof PublicMcpContextPackageSchema>;

export const ContextAssembleInputSchema = z
  .object({
    packId: z.string().min(1).max(128),
    intentKind: z.string().min(1).max(128),
    userRequest: z.string().min(1).max(4000),
    timeWindow: z
      .object({
        lookbackDays: z.number().int().min(0).max(365),
        lookaheadDays: z.number().int().min(0).max(30),
      })
      .strict(),
    sourceCapabilities: z.array(z.string().min(1).max(128)).min(1).max(50),
    modeId: z.string().min(1).max(128).optional(),
    responseShape: z.enum(['summary', 'panel_sections']).default('summary'),
  })
  .strict();

export type ContextAssembleInput = z.infer<typeof ContextAssembleInputSchema>;
