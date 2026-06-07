import type { Address, Hex } from "viem";
import { getAddress, isAddress } from "viem";
import type { CalldataUnwrapper, UnwrapPayload } from "../types.ts";
import { sourcePathFromSegments } from "../source_path.ts";
import {
  MULTICALL_AGGREGATE3_SELECTOR,
  MULTICALL_AGGREGATE_SELECTOR,
  MULTICALL_TRY_AGGREGATE_SELECTOR,
} from "../utils/selectors.ts";
import { isCalldataLike } from "../is_calldata_like.ts";

function asAddress(value: unknown): Address | undefined {
  if (typeof value !== "string" || !isAddress(value)) return undefined;
  return getAddress(value);
}

function asHex(value: unknown): Hex | undefined {
  if (typeof value !== "string" || !isCalldataLike(value)) return undefined;
  return value;
}

function payloadsFromTargetCallData(
  entries: readonly { target: unknown; callData: unknown }[],
  kind: string,
  argIndex: number,
  callDataFieldIndex = 2,
): UnwrapPayload[] {
  const payloads: UnwrapPayload[] = [];
  for (let index = 0; index < entries.length; index++) {
    const entry = entries[index];
    if (!entry) continue;
    const data = asHex(entry.callData);
    if (!data || data === "0x") continue;
    payloads.push({
      data,
      target: asAddress(entry.target),
      wrapper: {
        kind,
        index,
        sourcePath: sourcePathFromSegments(argIndex, index, callDataFieldIndex),
      },
    });
  }
  return payloads;
}

export const multicallAggregateUnwrapper: CalldataUnwrapper = {
  id: "multicall.aggregate",
  priority: 30,
  match(ctx) {
    return ctx.selector === MULTICALL_AGGREGATE_SELECTOR;
  },
  unwrap(ctx) {
    const calls = ctx.args[0];
    if (!Array.isArray(calls)) return [];
    return payloadsFromTargetCallData(
      calls as Array<{ target: unknown; callData: unknown }>,
      "multicall.aggregate",
      0,
    );
  },
};

export const multicallAggregate3Unwrapper: CalldataUnwrapper = {
  id: "multicall.aggregate3",
  priority: 31,
  match(ctx) {
    return ctx.selector === MULTICALL_AGGREGATE3_SELECTOR;
  },
  unwrap(ctx) {
    const calls = ctx.args[0];
    if (!Array.isArray(calls)) return [];
    return payloadsFromTargetCallData(
      calls as Array<{ target: unknown; callData: unknown }>,
      "multicall.aggregate3",
      0,
    );
  },
};

export const multicallTryAggregateUnwrapper: CalldataUnwrapper = {
  id: "multicall.tryAggregate",
  priority: 32,
  match(ctx) {
    return ctx.selector === MULTICALL_TRY_AGGREGATE_SELECTOR;
  },
  unwrap(ctx) {
    const calls = ctx.args[1];
    if (!Array.isArray(calls)) return [];
    return payloadsFromTargetCallData(
      calls as Array<{ target: unknown; callData: unknown }>,
      "multicall.tryAggregate",
      1,
    );
  },
};

export const genericBytesUnwrapper: CalldataUnwrapper = {
  id: "generic.bytes",
  priority: 1000,
  match() {
    return true;
  },
  unwrap(ctx) {
    const payloads: UnwrapPayload[] = [];
    const inputs = ctx.decodedInputs ?? [];

    for (let index = 0; index < ctx.args.length; index++) {
      const value = ctx.args[index];
      const input = inputs[index];
      const inputType = input?.type ?? "";

      if (inputType === "bytes" && isCalldataLike(value)) {
        payloads.push({
          data: value,
          wrapper: { kind: "generic.bytes", sourcePath: sourcePathFromSegments(index) },
        });
        continue;
      }

      if (inputType === "bytes[]" && Array.isArray(value)) {
        for (let byteIndex = 0; byteIndex < value.length; byteIndex++) {
          const nested = value[byteIndex];
          if (!isCalldataLike(nested)) continue;
          payloads.push({
            data: nested,
            wrapper: {
              kind: "generic.bytes",
              index: byteIndex,
              sourcePath: sourcePathFromSegments(index, byteIndex),
            },
          });
        }
      }
    }

    return payloads;
  },
};
