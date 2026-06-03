import {
  keccak256,
  parseTransaction,
  serializeTransaction,
  type TransactionSerializable,
} from "viem";
import type { normalized_tx } from "@beforesign/core";

function bigint_to_string(v: bigint | undefined): string | undefined {
  return v === undefined ? undefined : v.toString();
}

function tx_type_to_number(
  tx_type: TransactionSerializable["type"] | number | undefined,
): number | undefined {
  if (typeof tx_type === "number") return tx_type;
  if (tx_type === "eip1559") return 2;
  if (tx_type === "eip2930") return 1;
  if (tx_type === "legacy") return 0;
  return undefined;
}

export function parse_tx_hex(raw: string): normalized_tx {
  const serialized = raw.trim() as `0x${string}`;
  const tx = parseTransaction(serialized);
  const hash = keccak256(serialized);
  const tx_rec = tx as TransactionSerializable & { from?: `0x${string}` };

  const normalized: normalized_tx = {
    chain_id: tx.chainId,
    from: tx_rec.from,
    to: tx.to ?? undefined,
    value: bigint_to_string(tx.value),
    data: tx.data,
    nonce: tx.nonce,
    gas_limit: bigint_to_string("gas" in tx ? tx.gas : undefined),
    max_fee_per_gas: bigint_to_string("maxFeePerGas" in tx ? tx.maxFeePerGas : undefined),
    max_priority_fee_per_gas: bigint_to_string(
      "maxPriorityFeePerGas" in tx ? tx.maxPriorityFeePerGas : undefined,
    ),
    gas_price: bigint_to_string("gasPrice" in tx ? tx.gasPrice : undefined),
    type: tx_type_to_number(tx.type),
    hash,
    signed_hex: "v" in tx && tx.v !== undefined ? serialized : undefined,
    v: "v" in tx && tx.v !== undefined ? `0x${tx.v.toString(16)}` : undefined,
    r: "r" in tx && tx.r ? tx.r : undefined,
    s: "s" in tx && tx.s ? tx.s : undefined,
  };

  return normalized;
}

export function build_unsigned_tx_hash(tx: normalized_tx): string | undefined {
  if (!tx.chain_id || !tx.from || tx.nonce === undefined) return undefined;
  try {
    const serializable = {
      chainId: tx.chain_id,
      to: tx.to as `0x${string}` | undefined,
      value: tx.value ? BigInt(tx.value) : undefined,
      data: tx.data as `0x${string}` | undefined,
      nonce: tx.nonce,
      gas: tx.gas_limit ? BigInt(tx.gas_limit) : undefined,
      maxFeePerGas: tx.max_fee_per_gas ? BigInt(tx.max_fee_per_gas) : undefined,
      maxPriorityFeePerGas: tx.max_priority_fee_per_gas
        ? BigInt(tx.max_priority_fee_per_gas)
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
