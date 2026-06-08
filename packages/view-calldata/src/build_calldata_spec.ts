import type { CalldataViewInput, CalldataViewResult } from "./types.ts";
import { defaultRegistry } from "./profiles/profile_registry.ts";
import { treeToSpec } from "./tree_to_spec.ts";

export function buildCalldataSpec(input: CalldataViewInput): CalldataViewResult {
  const ctx = {
    tree: input.tree,
    contractAddress: input.contractAddress,
  };
  const profile = defaultRegistry.resolve(ctx);
  const { root, warnings } = profile.enrich(ctx);
  const spec = treeToSpec(ctx, profile, root, warnings);

  return {
    title: profile.title(ctx),
    summary: profile.summary(ctx),
    scenarioId: profile.id,
    spec: spec as unknown as CalldataViewResult["spec"],
    warnings:
      warnings.length > 0
        ? warnings
            .filter((item) => item.code !== null)
            .map((item) => ({
              code: item.code!,
              severity: item.severity,
              message: item.message,
            }))
        : undefined,
  };
}
