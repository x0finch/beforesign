import type { NormalizedTx } from "@beforesign/core";
import { parseInputObject } from "@beforesign/detect";
import {
  keccak256,
  serializeTransaction,
  type ParseTransactionReturnType,
  type TransactionSerializable,
} from "viem";

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

function bigintToString(v: bigint | undefined): string | undefined {
  return v === undefined ? undefined : v.toString();
}

function txTypeToNumber(
  txType: TransactionSerializable["type"] | number | undefined,
): number | undefined {
  if (typeof txType === "number") return txType;
  if (txType === "eip1559") return 2;
  if (txType === "eip2930") return 1;
  if (txType === "legacy") return 0;
  return undefined;
}

export type TxNormalizeResult = {
  tx: NormalizedTx;
  missingFields: string[];
  raw: string | Record<string, unknown>;
};

export function normalizeTxFromJson(raw: string): TxNormalizeResult {
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

  return { tx, missingFields, raw: obj };
}

export function viemTxToNormalized(
  tx: ParseTransactionReturnType,
  opts?: { from?: string; serializedHex?: string },
): NormalizedTx {
  const serialized = opts?.serializedHex?.trim() as `0x${string}` | undefined;
  const hash = serialized ? keccak256(serialized) : undefined;
  const signed = "v" in tx && tx.v !== undefined;

  return {
    chainId: tx.chainId,
    from: opts?.from,
    to: tx.to ?? undefined,
    value: bigintToString(tx.value),
    data: tx.data,
    nonce: tx.nonce,
    gasLimit: bigintToString("gas" in tx ? tx.gas : undefined),
    maxFeePerGas: bigintToString("maxFeePerGas" in tx ? tx.maxFeePerGas : undefined),
    maxPriorityFeePerGas: bigintToString(
      "maxPriorityFeePerGas" in tx ? tx.maxPriorityFeePerGas : undefined,
    ),
    gasPrice: bigintToString("gasPrice" in tx ? tx.gasPrice : undefined),
    type: txTypeToNumber(tx.type),
    hash,
    signedHex: signed ? serialized : undefined,
    v: signed && "v" in tx && tx.v !== undefined ? `0x${tx.v.toString(16)}` : undefined,
    r: "r" in tx && tx.r ? tx.r : undefined,
    s: "s" in tx && tx.s ? tx.s : undefined,
  };
}

export function buildUnsignedTxHash(tx: NormalizedTx): string | undefined {
  if (!tx.chainId || !tx.from || tx.nonce === undefined) return undefined;
  try {
    const serializable = {
      chainId: tx.chainId,
      to: tx.to as `0x${string}` | undefined,
      value: tx.value ? BigInt(tx.value) : undefined,
      data: tx.data as `0x${string}` | undefined,
      nonce: tx.nonce,
      gas: tx.gasLimit ? BigInt(tx.gasLimit) : undefined,
      maxFeePerGas: tx.maxFeePerGas ? BigInt(tx.maxFeePerGas) : undefined,
      maxPriorityFeePerGas: tx.maxPriorityFeePerGas
        ? BigInt(tx.maxPriorityFeePerGas)
        : undefined,
      type:
        tx.type === 2
          ? ("eip1559" as const)
          : tx.type === 1
            ? ("eip2930" as const)
            : ("legacy" as const),
    } as TransactionSerializable;
    const unsigned = serializeTransaction(serializable);
    return keccak256(unsigned);
  } catch {
    return undefined;
  }
}
