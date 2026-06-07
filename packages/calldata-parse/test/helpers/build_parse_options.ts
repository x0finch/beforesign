import type { Abi, Address } from "viem";
import type { ParseCalldataOptions } from "../../src/types.ts";
import { buildResolveAbiFromMap } from "./build_resolve_abi_from_map.ts";

export type ParseOptionsInput = {
  abi?: Abi;
  maxDepth?: number;
  rootTarget?: Address;
  abiByTarget?: Record<string, Abi>;
};

export function buildParseOptions(fixture: {
  options?: ParseOptionsInput;
}): ParseCalldataOptions {
  const options = fixture.options;
  if (!options) return {};

  return {
    ...(options.abi ? { abi: options.abi } : {}),
    ...(options.maxDepth !== undefined ? { maxDepth: options.maxDepth } : {}),
    ...(options.abiByTarget
      ? {
          resolveAbi: buildResolveAbiFromMap(options.abiByTarget, options.rootTarget),
        }
      : {}),
  };
}
