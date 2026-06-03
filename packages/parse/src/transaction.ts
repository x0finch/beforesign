import {
  keccak256,
  parseTransaction,
  serializeTransaction,
  type TransactionSerializable,
} from "viem";
import type { NormalizedTx } from "@beforesign/core";

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

export function parseTxHex(raw: string): NormalizedTx {
  const serialized = raw.trim() as `0x${string}`;
  const tx = parseTransaction(serialized);
  const hash = keccak256(serialized);
  const txRec = tx as TransactionSerializable & { from?: `0x${string}` };

  const normalized: NormalizedTx = {
    chainId: tx.chainId,
    from: txRec.from,
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
    signedHex: "v" in tx && tx.v !== undefined ? serialized : undefined,
    v: "v" in tx && tx.v !== undefined ? `0x${tx.v.toString(16)}` : undefined,
    r: "r" in tx && tx.r ? tx.r : undefined,
    s: "s" in tx && tx.s ? tx.s : undefined,
  };

  return normalized;
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
