import type { Address, Hex } from "viem";
import { getAddress, isAddress } from "viem";
import type { CalldataUnwrapper } from "../types.ts";
import { SAFE_EXEC_TRANSACTION_SELECTOR } from "../utils/selectors.ts";

function asAddress(value: unknown): Address | undefined {
  if (typeof value !== "string" || !isAddress(value)) return undefined;
  return getAddress(value);
}

function asHex(value: unknown): Hex | undefined {
  if (typeof value !== "string" || !value.startsWith("0x")) return undefined;
  return value as Hex;
}

function asBigInt(value: unknown): bigint | undefined {
  if (typeof value === "bigint") return value;
  if (typeof value === "number") return BigInt(value);
  return undefined;
}

function operationFromValue(value: unknown): "call" | "delegatecall" | undefined {
  const num = asBigInt(value);
  if (num === 0n) return "call";
  if (num === 1n) return "delegatecall";
  return undefined;
}

export const safeExecTransactionUnwrapper: CalldataUnwrapper = {
  id: "safe.execTransaction",
  priority: 10,
  match(ctx) {
    return ctx.selector === SAFE_EXEC_TRANSACTION_SELECTOR;
  },
  unwrap(ctx) {
    const to = asAddress(ctx.args[0]);
    const value = asBigInt(ctx.args[1]) ?? 0n;
    const data = asHex(ctx.args[2]);
    const operation = operationFromValue(ctx.args[3]);
    if (!data || data === "0x") return [];

    return [
      {
        data,
        target: to,
        value,
        operation,
        wrapper: { kind: "safe.execTransaction", sourcePath: "2" },
      },
    ];
  },
};
