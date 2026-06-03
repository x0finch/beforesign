import { hashTypedData } from "viem";
import type { json_value, typed_data_view } from "@beforesign/core";

export function parse_typed_data(raw: string): typed_data_view {
  const parsed = JSON.parse(raw) as {
    domain: Record<string, unknown>;
    types: Record<string, Array<{ name: string; type: string }>>;
    primaryType: string;
    message: Record<string, unknown>;
  };

  const signable_hash = hashTypedData({
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
    domain: parsed.domain as { [key: string]: json_value },
    primary_type: parsed.primaryType,
    message: parsed.message as { [key: string]: json_value },
    signable_hash,
    summary,
  };
}
