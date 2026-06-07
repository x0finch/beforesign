import type { Abi } from "viem";
import type { ResolveAbi } from "../../src/types.ts";

export function buildResolveAbiFromSelectorMap(
  abiBySelector: Record<string, Abi>,
): ResolveAbi {
  return async ({ selector }) => abiBySelector[selector.toLowerCase()];
}
