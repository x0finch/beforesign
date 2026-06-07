import type { ParseCalldataOptions } from "@beforesign/calldata-parse";
import type { Abi } from "./types.ts";

type ResolveAbi = NonNullable<ParseCalldataOptions["resolveAbi"]>;

export function buildResolveAbiFromSelectorMap(
  abiBySelector: Record<string, Abi>,
): ResolveAbi {
  return async ({ selector }) => abiBySelector[selector.toLowerCase()];
}
