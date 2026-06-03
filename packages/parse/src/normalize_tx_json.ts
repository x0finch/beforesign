import type { normalized_tx } from "@beforesign/core";

function hex_to_string(value: unknown): string | undefined {
  if (value === undefined || value === null) return undefined;
  if (typeof value === "bigint") return value.toString();
  if (typeof value === "number") return value.toString();
  return String(value);
}

function parse_chain_id(value: unknown): number | undefined {
  if (value === undefined || value === null) return undefined;
  if (typeof value === "number") return value;
  const s = String(value);
  if (s.startsWith("0x")) return Number.parseInt(s, 16);
  return Number.parseInt(s, 10);
}

export type normalize_result = {
  tx: normalized_tx;
  missing_fields: string[];
};

export function normalize_tx_json(raw: string): normalize_result {
  const obj = JSON.parse(raw) as Record<string, unknown>;
  const missing_fields: string[] = [];

  const chain_id = parse_chain_id(obj.chainId ?? obj.chain_id);
  if (chain_id === undefined) missing_fields.push("chain_id");

  const from = typeof obj.from === "string" ? obj.from : undefined;
  if (!from) missing_fields.push("from");

  const tx: normalized_tx = {
    chain_id,
    from,
    to: typeof obj.to === "string" ? obj.to : undefined,
    data: typeof obj.data === "string" ? obj.data : undefined,
    value: hex_to_string(obj.value),
    nonce:
      obj.nonce !== undefined && obj.nonce !== null
        ? Number.parseInt(
            String(obj.nonce).replace(/^0x/, ""),
            String(obj.nonce).startsWith("0x") ? 16 : 10,
          )
        : undefined,
    gas_limit: hex_to_string(obj.gas ?? obj.gasLimit),
    max_fee_per_gas: hex_to_string(obj.maxFeePerGas),
    max_priority_fee_per_gas: hex_to_string(obj.maxPriorityFeePerGas),
    gas_price: hex_to_string(obj.gasPrice),
    type:
      obj.type !== undefined
        ? Number.parseInt(String(obj.type).replace(/^0x/, ""), 16)
        : undefined,
    v: hex_to_string(obj.v),
    r: hex_to_string(obj.r),
    s: hex_to_string(obj.s),
  };

  if (!tx.to && !tx.data) missing_fields.push("to_or_data");
  if (tx.nonce === undefined) missing_fields.push("nonce");

  return { tx, missing_fields };
}
