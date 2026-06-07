import type { Abi, Address } from "viem";
import type { ResolveAbi } from "../../src/types.ts";

export function buildResolveAbiFromMap(
  abiByTarget: Record<string, Abi>,
  rootTarget?: Address,
): ResolveAbi {
  return async ({ target }) => {
    const address = (target ?? rootTarget)?.toLowerCase();
    if (!address) return undefined;
    return abiByTarget[address];
  };
}
