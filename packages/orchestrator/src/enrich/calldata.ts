import { parseCalldata, type CalldataCall } from "@beforesign/calldata-parse";
import type { CalldataDecode } from "@beforesign/core";
import type { ClientsBundle } from "@beforesign/clients";
import type { ResolveAbi } from "@beforesign/calldata-parse";
import type { Address, Hex } from "viem";
import type { Abi } from "viem";

export type CalldataPayload = {
  abi?: Abi;
  contractAddress?: Address;
  chainId?: number;
};

export type CalldataContext = {
  data: Hex;
  tree: CalldataCall;
  decode: CalldataDecode;
  payload?: CalldataPayload;
};

function buildResolveAbi(clients: ClientsBundle): ResolveAbi {
  return async (ctx) => clients.signatureLookup.resolveBySelector(ctx.selector);
}

function toCalldataDecode(node: CalldataCall): CalldataDecode {
  return {
    selector: node.selector,
    ...(node.functionName ? { functionName: node.functionName } : {}),
    args: node.args.map((arg) => ({
      name: arg.name,
      type: arg.type,
      value: arg.displayValue,
    })),
    raw: node.raw,
    summary: node.summary,
  };
}

export async function parseCalldataContext(
  data: Hex,
  clients: ClientsBundle,
  payload?: CalldataPayload,
): Promise<CalldataContext> {
  const tree = await parseCalldata(data, {
    ...(payload?.abi ? { abi: payload.abi } : {}),
    resolveAbi: buildResolveAbi(clients),
  });

  return {
    data,
    tree,
    decode: toCalldataDecode(tree),
    payload,
  };
}
