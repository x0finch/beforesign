import type { ClientsBundle } from "@beforesign/clients";
import type { JsonValue, ReviewDocument } from "@beforesign/core";
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

  const facts: Record<string, JsonValue> = {
    primaryType: normalized.primaryType,
    domainHash: preparedCtx.domainHash,
    ...(preparedCtx.structHash ? { structHash: preparedCtx.structHash } : {}),
    signableHash: preparedCtx.signableHash,
    ...enriched.facts,
  };
  if (preparedCtx.tokenHint) {
    facts.tokenSymbol = preparedCtx.tokenHint.symbol;
    facts.tokenDecimals = preparedCtx.tokenHint.decimals;
  }

  return {
    kind: "typedData",
    title: profile.title(preparedCtx),
    summary: profile.summary(preparedCtx),
    checks: enriched.checks,
    warnings: enriched.warnings,
    facts,
  };
}
