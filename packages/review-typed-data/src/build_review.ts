import type { JsonValue, ReviewDocument } from "@beforesign/core";
import type { ClientsBundle } from "@beforesign/clients";
import type { TypedDataDefinition } from "viem";
import { buildBaseChecks } from "./build_base_checks.ts";
import { buildContext } from "./build_context.ts";
import { defaultRegistry } from "./profiles/profile_registry.ts";
import type { TypedDataPayload } from "./profiles/context.ts";

export function buildReview(
  normalized: TypedDataDefinition,
  clients: ClientsBundle,
  payload?: TypedDataPayload,
): ReviewDocument {
  void clients;

  const ctx = buildContext(normalized, payload);
  const baseChecks = buildBaseChecks(ctx);
  const profile = defaultRegistry.resolve(ctx);
  const enriched = profile.enrich(ctx, baseChecks);

  const facts: Record<string, JsonValue> = {
    primaryType: normalized.primaryType,
    signableHash: ctx.signableHash,
    ...enriched.facts,
  };
  if (ctx.tokenHint) {
    facts.tokenSymbol = ctx.tokenHint.symbol;
    facts.tokenDecimals = ctx.tokenHint.decimals;
  }

  return {
    kind: "typedData",
    title: profile.title(ctx),
    summary: profile.summary(ctx),
    checks: enriched.checks,
    warnings: enriched.warnings,
    facts,
  };
}
