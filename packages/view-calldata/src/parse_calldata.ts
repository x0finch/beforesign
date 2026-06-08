import { parseCalldata, type CalldataCall } from "@beforesign/calldata-parse";
import type { ResolveAbi } from "@beforesign/calldata-parse";
import type { ClientsBundle } from "@beforesign/clients";
import type { Abi, Hex } from "viem";

export type ParseCalldataInput = {
  raw: Hex;
  abi?: Abi;
};

function buildResolveAbi(clients: ClientsBundle): ResolveAbi {
  return async (ctx) => clients.signatureLookup.resolveBySelector(ctx.selector);
}

export async function parseCalldataTree(
  input: ParseCalldataInput,
  clients: ClientsBundle,
): Promise<CalldataCall> {
  return parseCalldata(input.raw, {
    ...(input.abi ? { abi: input.abi } : {}),
    resolveAbi: buildResolveAbi(clients),
  });
}
