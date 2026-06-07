import type { ParseCalldataOptions } from "@beforesign/calldata-parse";
import type { ParseOptionsInput } from "./types.ts";

type Abi = NonNullable<ParseCalldataOptions["abi"]>;
type ResolveAbi = NonNullable<ParseCalldataOptions["resolveAbi"]>;

export function buildResolveAbiFromMap(
  abiByTarget: Record<string, Abi>,
  rootTarget?: NonNullable<ParseOptionsInput["rootTarget"]>,
): ResolveAbi {
  return async ({ target }) => {
    const address = (target ?? rootTarget)?.toLowerCase();
    if (!address) return undefined;
    return abiByTarget[address];
  };
}
