import type { Hex, Signature, TransactionSerializable } from "viem";
import { parseInputObject } from "./parse_input_object.ts";
import {
  hexToBigInt,
  hexToNumber,
  isHex,
  parseTransaction,
  serializeTransaction,
  type ParseTransactionReturnType,
} from "viem";

function parseHexOrNumber(value: unknown): number {
  if (typeof value === "number") return value;
  if (typeof value === "string" && isHex(value)) return hexToNumber(value);
  return Number(value);
}

function parseHexOrBigInt(value: unknown): bigint {
  if (typeof value === "bigint") return value;
  if (typeof value === "number") return BigInt(value);
  if (typeof value === "string" && isHex(value)) return hexToBigInt(value);
  return BigInt(value as string);
}

function txTypeFromInput(typeValue: unknown): TransactionSerializable["type"] | undefined {
  if (typeValue === undefined || typeValue === null) return undefined;
  const typeNum =
    typeof typeValue === "string" && isHex(typeValue)
      ? hexToNumber(typeValue)
      : Number(typeValue);
  if (typeNum === 2) return "eip1559";
  if (typeNum === 1) return "eip2930";
  if (typeNum === 0) return "legacy";
  if (typeValue === "eip1559" || typeValue === "eip2930" || typeValue === "legacy") {
    return typeValue;
  }
  return undefined;
}

export function walletJsonToSerializable(
  record: Record<string, unknown>,
): TransactionSerializable {
  const data = (record.data ?? record.input ?? "0x") as Hex;
  return {
    chainId: record.chainId != null ? parseHexOrNumber(record.chainId) : undefined,
    to: record.to as `0x${string}` | undefined,
    data: data === "0x" ? undefined : data,
    nonce: record.nonce != null ? parseHexOrNumber(record.nonce) : undefined,
    gas: record.gas != null ? parseHexOrBigInt(record.gas) : undefined,
    value: record.value != null ? parseHexOrBigInt(record.value) : undefined,
    maxFeePerGas:
      record.maxFeePerGas != null ? parseHexOrBigInt(record.maxFeePerGas) : undefined,
    maxPriorityFeePerGas:
      record.maxPriorityFeePerGas != null
        ? parseHexOrBigInt(record.maxPriorityFeePerGas)
        : undefined,
    gasPrice: record.gasPrice != null ? parseHexOrBigInt(record.gasPrice) : undefined,
    type: txTypeFromInput(record.type),
  } as TransactionSerializable;
}

export function walletJsonToSignature(
  record: Record<string, unknown>,
): Signature | undefined {
  const r = record.r as Hex | undefined;
  const s = record.s as Hex | undefined;
  if (!r || !s) return undefined;

  if (record.yParity != null) {
    const yParity = parseHexOrNumber(record.yParity);
    return { r, s, yParity };
  }

  if (record.v != null) {
    const v = parseHexOrBigInt(record.v);
    return { r, s, v };
  }

  return undefined;
}

export function transactionHasSignature(tx: ParseTransactionReturnType): boolean {
  return "v" in tx && tx.v !== undefined;
}

export function normalizeTxFromHex(raw: string): ParseTransactionReturnType {
  return parseTransaction(raw.trim().toLowerCase() as Hex) as ParseTransactionReturnType;
}

export function walletJsonToPartialNormalized(
  record: Record<string, unknown>,
): ParseTransactionReturnType {
  const data = (record.data ?? record.input ?? "0x") as Hex;
  const type = txTypeFromInput(record.type);
  const tx: Record<string, unknown> = {};

  if (record.chainId != null) tx.chainId = parseHexOrNumber(record.chainId);
  if (record.to != null) tx.to = record.to;
  tx.data = data === "0x" ? undefined : data;
  if (record.nonce != null) tx.nonce = parseHexOrNumber(record.nonce);
  if (record.gas != null) tx.gas = parseHexOrBigInt(record.gas);
  if (record.value != null) tx.value = parseHexOrBigInt(record.value);
  if (record.maxFeePerGas != null) tx.maxFeePerGas = parseHexOrBigInt(record.maxFeePerGas);
  if (record.maxPriorityFeePerGas != null) {
    tx.maxPriorityFeePerGas = parseHexOrBigInt(record.maxPriorityFeePerGas);
  }
  if (record.gasPrice != null) tx.gasPrice = parseHexOrBigInt(record.gasPrice);
  if (type !== undefined) tx.type = type;

  const signature = walletJsonToSignature(record);
  if (signature) {
    if ("v" in signature && signature.v !== undefined) tx.v = signature.v;
    if ("yParity" in signature && signature.yParity !== undefined) {
      tx.yParity = signature.yParity;
    }
    tx.r = signature.r;
    tx.s = signature.s;
  }

  return tx as ParseTransactionReturnType;
}

export function normalizeTxFromJson(raw: string): ParseTransactionReturnType {
  const record = parseInputObject(raw);
  try {
    const serializable = walletJsonToSerializable(record);
    const signature = walletJsonToSignature(record);
    const serialized = serializeTransaction(serializable, signature);
    return parseTransaction(serialized) as ParseTransactionReturnType;
  } catch {
    return walletJsonToPartialNormalized(record);
  }
}

export function tryNormalizeTxFromHex(raw: string): ParseTransactionReturnType | null {
  if (!raw.startsWith("0x")) return null;
  try {
    return normalizeTxFromHex(raw);
  } catch {
    return null;
  }
}

export function tryNormalizeTxFromJson(raw: string): ParseTransactionReturnType | null {
  if (!raw.startsWith("{") && !raw.startsWith("[")) return null;
  try {
    const record = parseInputObject(raw);
    const keys = ["from", "to", "data", "chainId", "nonce", "gas", "value"];
    if (!keys.some((k) => k in record)) return null;
    return normalizeTxFromJson(raw);
  } catch {
    return null;
  }
}
