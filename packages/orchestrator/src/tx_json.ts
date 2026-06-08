import type { NormalizedTx } from "@beforesign/core";
import { parseInputObject } from "@beforesign/detect";

function hexToString(value: unknown): string | undefined {
  if (value === undefined || value === null) return undefined;
  if (typeof value === "bigint") return value.toString();
  if (typeof value === "number") return value.toString();
  return String(value);
}

function parseChainId(value: unknown): number | undefined {
  if (value === undefined || value === null) return undefined;
  if (typeof value === "number") return value;
  const s = String(value);
  if (s.startsWith("0x")) return Number.parseInt(s, 16);
  return Number.parseInt(s, 10);
}

export type TxJsonNormalizeResult = {
  tx: NormalizedTx;
  missingFields: string[];
};

export function normalizeTxJson(raw: string): TxJsonNormalizeResult {
  const obj = parseInputObject(raw);
  const missingFields: string[] = [];

  const chainId = parseChainId(obj.chainId ?? obj.chain_id);
  if (chainId === undefined) missingFields.push("chainId");

  const from = typeof obj.from === "string" ? obj.from : undefined;
  if (!from) missingFields.push("from");

  const tx: NormalizedTx = {
    chainId,
    from,
    to: typeof obj.to === "string" ? obj.to : undefined,
    data: typeof obj.data === "string" ? obj.data : undefined,
    value: hexToString(obj.value),
    nonce:
      obj.nonce !== undefined && obj.nonce !== null
        ? Number.parseInt(
            String(obj.nonce).replace(/^0x/, ""),
            String(obj.nonce).startsWith("0x") ? 16 : 10,
          )
        : undefined,
    gasLimit: hexToString(obj.gas ?? obj.gasLimit),
    maxFeePerGas: hexToString(obj.maxFeePerGas),
    maxPriorityFeePerGas: hexToString(obj.maxPriorityFeePerGas),
    gasPrice: hexToString(obj.gasPrice),
    type:
      obj.type !== undefined
        ? Number.parseInt(String(obj.type).replace(/^0x/, ""), 16)
        : undefined,
    v: hexToString(obj.v),
    r: hexToString(obj.r),
    s: hexToString(obj.s),
  };

  if (!tx.to && !tx.data) missingFields.push("toOrData");
  if (tx.nonce === undefined) missingFields.push("nonce");

  return { tx, missingFields };
}
