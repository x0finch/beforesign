import type { ParseCalldataOptions } from "@beforesign/calldata-parse";
import { buildResolveAbiFromMap } from "./build_resolve_abi_from_map.ts";
import type { ParseOptionsInput } from "./types.ts";

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
