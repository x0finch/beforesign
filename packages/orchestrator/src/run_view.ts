import type { ParseInput, ParseResult, ViewResult } from "@beforesign/core";
import type { ClientsBundle } from "@beforesign/clients";
import type { DetectResult } from "@beforesign/detect";
import { buildContext, defaultRegistry } from "@beforesign/view-typed-data";
import type { Abi, Address, Hash, Hex } from "viem";
import type { CalldataContext } from "./enrich/calldata.ts";
import type { PreparedSignedTx } from "./enrich/signed_tx.ts";
import { viewBuilders } from "./view_registry.ts";

function parseAbi(raw?: string): Abi | undefined {
  if (!raw?.trim()) return undefined;
  try {
    return JSON.parse(raw) as Abi;
  } catch {
    return undefined;
  }
}

export type RunViewOptions = {
  calldataCtx?: CalldataContext;
  signedTx?: PreparedSignedTx;
  typedDataNowSeconds?: number;
};

export async function runView(
  detected: DetectResult,
  clients: ClientsBundle,
  input: ParseInput,
  enriched?: ParseResult,
  options?: RunViewOptions,
): Promise<ViewResult | undefined> {
  if (!(detected.kind in viewBuilders)) return undefined;

  const abi = parseAbi(input.abi);

  switch (detected.kind) {
    case "typedData": {
      const ctx = buildContext(detected.normalized, {
        signerAddress: input.signerAddress as `0x${string}` | undefined,
      });
      const profile = defaultRegistry.resolve(ctx);
      const preparedCtx = await profile.prepareContext(ctx, clients);
      return viewBuilders.typedData(preparedCtx);
    }
    case "txHash": {
      const hash = detected.normalized as Hash;
      const resolvedChainId =
        enriched?.discovery?.resolvedChainId ??
        enriched?.tx?.chainId ??
        enriched?.onchain?.chainId ??
        input.chainId;
      const activeHit = enriched?.discovery?.hits.find(
        (hit) =>
          hit.id === input.selectedDiscoveryHit ||
          (enriched?.discovery?.status === "resolved" &&
            enriched.discovery.hits.length === 1 &&
            hit.id === enriched.discovery.hits[0]?.id) ||
          (resolvedChainId !== undefined && hit.chainId === resolvedChainId),
      );
      return viewBuilders.txHash({
        hash,
        chainId: input.chainId,
        selectedDiscoveryHit: input.selectedDiscoveryHit,
        discovery: enriched?.discovery,
        tx: enriched?.tx,
        onchain: enriched?.onchain,
        decodedMethod: enriched?.txHashEnrichment?.decodedMethod,
        timestamp: enriched?.txHashEnrichment?.timestamp,
        activeHit,
        resolvedChainId,
        calldataTree: options?.calldataCtx?.tree,
        contractAddress: enriched?.tx?.to,
      });
    }
    case "signedTx": {
      const prepared = options?.signedTx;
      return viewBuilders.signedTx({
        kind: "signedTx",
        normalized: detected.normalized,
        abi,
        tx: prepared?.tx ?? enriched?.tx,
        onchain: prepared?.onchain ?? enriched?.onchain,
        indexed: prepared?.indexed,
        decodedMethod: enriched?.calldata?.functionName,
        calldataTree: options?.calldataCtx?.tree,
        contractAddress: enriched?.tx?.to,
      });
    }
    case "unsignedTx":
      return viewBuilders.unsignedTx({
        kind: "unsignedTx",
        normalized: detected.normalized,
        abi,
        tx: enriched?.tx,
        decodedMethod: enriched?.calldata?.functionName,
        calldataTree: options?.calldataCtx?.tree,
        contractAddress: enriched?.tx?.to,
      });
    case "calldata": {
      const ctx = options?.calldataCtx;
      if (!ctx) return undefined;
      return viewBuilders.calldata({
        tree: ctx.tree,
        contractAddress: ctx.payload?.contractAddress ?? input.signerAddress,
      });
    }
    default:
      return undefined;
  }
}
