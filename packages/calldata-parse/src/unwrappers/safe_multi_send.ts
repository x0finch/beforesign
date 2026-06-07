import type { Address, Hex } from "viem";
import { getAddress, hexToBytes, isAddress, toHex } from "viem";
import type { CalldataUnwrapper, UnwrapPayload } from "../types.ts";
import { SAFE_MULTI_SEND_SELECTOR } from "../utils/selectors.ts";

/**
 * Safe `MultiSend.multiSend(bytes)` packed transaction layout.
 * @see https://github.com/safe-fndn/safe-smart-account/blob/main/contracts/libraries/MultiSend.sol
 *
 * Each entry is `abi.encodePacked`:
 *   uint8 operation (0 = CALL, 1 = DELEGATECALL) — 1 byte
 *   address to — 20 bytes
 *   uint256 value — 32 bytes
 *   uint256 data length — 32 bytes
 *   bytes data — `data length` bytes
 *
 * Next entry offset = previous offset + 85 + data length (0x55 + data length).
 */
export const MULTISEND_TX_HEADER_BYTES = 85;

function asAddress(value: unknown): Address | undefined {
  if (typeof value !== "string" || !isAddress(value)) return undefined;
  return getAddress(value);
}

function operationFromByte(byte: number): "call" | "delegatecall" | undefined {
  if (byte === 0) return "call";
  if (byte === 1) return "delegatecall";
  return undefined;
}

export type EncodeMultiSendTransactionInput = {
  to: Address;
  value?: bigint;
  data: Hex;
  operation?: 0 | 1;
};

/** Encode one Safe MultiSend packed sub-transaction (matches on-chain `abi.encodePacked`). */
export function encodeMultiSendTransaction(input: EncodeMultiSendTransactionInput): Hex {
  const operation = input.operation ?? 0;
  const op = operation.toString(16).padStart(2, "0");
  const toHex = input.to.slice(2).toLowerCase().padStart(40, "0");
  const value = input.value ?? 0n;
  const valueHex = value.toString(16).padStart(64, "0");
  const dataBytes = input.data === "0x" ? "" : input.data.slice(2);
  const dataLenHex = (dataBytes.length / 2).toString(16).padStart(64, "0");
  return `0x${op}${toHex}${valueHex}${dataLenHex}${dataBytes}` as Hex;
}

/** Concatenate multiple packed sub-transactions for `multiSend(bytes)`. */
export function encodeMultiSendTransactions(entries: EncodeMultiSendTransactionInput[]): Hex {
  const packed = entries.map((entry) => encodeMultiSendTransaction(entry).slice(2)).join("");
  return `0x${packed}` as Hex;
}

export function parseMultiSendTransactions(transactions: Hex): UnwrapPayload[] {
  const bytes = hexToBytes(transactions);
  const payloads: UnwrapPayload[] = [];
  let offset = 0;
  let index = 0;

  while (offset < bytes.length) {
    const operation = operationFromByte(bytes[offset] ?? 0);
    offset += 1;

    if (offset + 20 > bytes.length) break;
    const to = asAddress(toHex(bytes.subarray(offset, offset + 20)));
    offset += 20;
    if (!to) break;

    if (offset + 32 > bytes.length) break;
    const value = BigInt(toHex(bytes.subarray(offset, offset + 32)));
    offset += 32;

    if (offset + 32 > bytes.length) break;
    const dataLength = Number(BigInt(toHex(bytes.subarray(offset, offset + 32))));
    offset += 32;

    if (offset + dataLength > bytes.length) break;
    const data =
      dataLength === 0
        ? ("0x" as Hex)
        : (toHex(bytes.subarray(offset, offset + dataLength)) as Hex);
    offset += dataLength;

    if (isCalldataLikeForUnwrap(data)) {
      payloads.push({
        data,
        target: to,
        value,
        operation,
        wrapper: { kind: "safe.multiSend", index, sourcePath: "0" },
      });
    }

    index += 1;
  }

  return payloads;
}

function isCalldataLikeForUnwrap(data: Hex): boolean {
  return data !== "0x" && data.length >= 10;
}

export const safeMultiSendUnwrapper: CalldataUnwrapper = {
  id: "safe.multiSend",
  priority: 20,
  match(ctx) {
    return ctx.selector === SAFE_MULTI_SEND_SELECTOR;
  },
  unwrap(ctx) {
    const transactions = ctx.args[0];
    if (typeof transactions !== "string" || !transactions.startsWith("0x")) return [];
    return parseMultiSendTransactions(transactions as Hex);
  },
};
