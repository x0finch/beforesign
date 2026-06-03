import { hashTypedData } from "viem";
import type { JsonValue, TypedDataView } from "@beforesign/core";

export function parseTypedData(raw: string): TypedDataView {
  const parsed = JSON.parse(raw) as {
    domain: Record<string, unknown>;
    types: Record<string, Array<{ name: string; type: string }>>;
    primaryType: string;
    message: Record<string, unknown>;
  };

  const signableHash = hashTypedData({
    domain: parsed.domain as Parameters<typeof hashTypedData>[0]["domain"],
    types: parsed.types,
    primaryType: parsed.primaryType,
    message: parsed.message,
  });

  let summary = `EIP-712 签名：${parsed.primaryType}`;
  if (parsed.primaryType === "Permit") {
    summary = "授权 Permit：请核对 spender 与额度";
  }

  return {
    domain: parsed.domain as { [key: string]: JsonValue },
    primaryType: parsed.primaryType,
    message: parsed.message as { [key: string]: JsonValue },
    signableHash,
    summary,
  };
}
