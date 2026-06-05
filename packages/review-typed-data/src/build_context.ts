import type { TypedDataDefinition } from "viem";
import { hashTypedData } from "viem";
import type { TypedDataContext, TypedDataPayload } from "./profiles/context.ts";
import { lookupTokenHint } from "./token_hints.ts";

function getPrimaryFieldNames(normalized: TypedDataDefinition): string[] {
  const fields = normalized.types[normalized.primaryType as keyof typeof normalized.types];
  if (!fields || !Array.isArray(fields)) return [];
  return fields.map((f) => f.name);
}

export function buildContext(
  normalized: TypedDataDefinition,
  payload?: TypedDataPayload,
): TypedDataContext {
  const domain = normalized.domain as Record<string, unknown>;
  const message = normalized.message as Record<string, unknown>;
  const verifyingContract =
    typeof domain.verifyingContract === "string" ? domain.verifyingContract : undefined;
  const domainName = typeof domain.name === "string" ? domain.name : undefined;

  const signableHash = hashTypedData({
    domain: normalized.domain,
    types: normalized.types,
    primaryType: normalized.primaryType,
    message: normalized.message,
  });

  return {
    normalized,
    signableHash,
    payload,
    domain,
    message,
    primaryFieldNames: getPrimaryFieldNames(normalized),
    tokenHint: lookupTokenHint(verifyingContract, domainName),
  };
}
