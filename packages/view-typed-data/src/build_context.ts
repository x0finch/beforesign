import type { TypedDataDefinition } from "viem";
import {
  getTypesForEIP712Domain,
  hashDomain,
  hashStruct,
  hashTypedData,
} from "viem";
import type { TypedDataContext, TypedDataPayload } from "./profiles/context.ts";

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

  const types = {
    EIP712Domain: getTypesForEIP712Domain({ domain: normalized.domain }),
    ...normalized.types,
  };

  const domainHash = hashDomain({ domain: normalized.domain ?? {}, types });
  const structHash =
    normalized.primaryType !== "EIP712Domain"
      ? hashStruct({
          data: normalized.message,
          primaryType: normalized.primaryType,
          types,
        })
      : undefined;

  const signableHash = hashTypedData({
    domain: normalized.domain,
    types: normalized.types,
    primaryType: normalized.primaryType,
    message: normalized.message,
  });

  return {
    normalized,
    domainHash,
    structHash,
    signableHash,
    payload,
    domain,
    message,
    primaryFieldNames: getPrimaryFieldNames(normalized),
  };
}
