import type { ClientsBundle } from "@beforesign/clients";
import type { ReviewDocument } from "@beforesign/core";
import type { TypedDataDefinition } from "viem";
import { buildBaseChecks } from "./build_base_checks.ts";
import { buildContext } from "./build_context.ts";
import type { TypedDataPayload } from "./profiles/context.ts";
import { defaultRegistry } from "./profiles/profile_registry.ts";

export async function buildReview(
  normalized: TypedDataDefinition,
  clients: ClientsBundle,
  payload?: TypedDataPayload,
): Promise<ReviewDocument> {
  const ctx = buildContext(normalized, payload);
  const profile = defaultRegistry.resolve(ctx);
  const preparedCtx = await profile.prepareContext(ctx, clients);
  const baseChecks = buildBaseChecks(preparedCtx);
  const enriched = profile.enrich(preparedCtx, baseChecks);
  const facts = profile.buildExternalFacts(preparedCtx);

  return {
    kind: "typedData",
    scenarioId: profile.id,
    title: profile.title(preparedCtx),
    summary: profile.summary(preparedCtx),
    checks: enriched.checks,
    warnings: enriched.warnings,
    facts,
  };
}
