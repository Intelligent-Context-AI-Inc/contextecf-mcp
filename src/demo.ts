import type { ContextAssembleInput, PublicMcpContextPackage } from './schemas.js';
import { buildScenarioContextPackage } from './demo-catalog.js';
import { ContextAssembleInputSchema } from './schemas.js';

export function buildSyntheticContextPackage(
  input: Partial<ContextAssembleInput> = {}
): PublicMcpContextPackage {
  if (Object.keys(input).length === 0) return buildScenarioContextPackage(input);
  return buildScenarioContextPackage(ContextAssembleInputSchema.parse(input));
}
