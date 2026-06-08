import type { ClientsBundle } from "@beforesign/clients";
import { resolveChainId } from "@beforesign/clients";
import type {
  DiscoveryHit,
  DiscoveryResult,
  NormalizedTx,
  OnchainTxMeta,
} from "@beforesign/core";
import { getChainById } from "@beforesign/core";
import type { Hash } from "viem";

export type TxHashPrepareInput = {
  hash: Hash;
  chainId?: number;
  selectedDiscoveryHit?: string;
};

export type TxHashPrepared = {
  discovery: DiscoveryResult;
  tx?: NormalizedTx;
  onchain?: OnchainTxMeta;
  decodedMethod?: string;
  timestamp?: string;
  activeHit?: DiscoveryHit;
  resolvedChainId?: number;
};

function activeHitFor(
  discovery: DiscoveryResult,
  opts: { selectedDiscoveryHit?: string; resolvedChainId?: number },
): DiscoveryHit | undefined {
  if (!discovery.hits.length) return undefined;
  if (opts.selectedDiscoveryHit) {
    return discovery.hits.find((hit) => hit.id === opts.selectedDiscoveryHit);
  }
  if (discovery.status === "resolved" && discovery.hits.length === 1) {
    return discovery.hits[0];
  }
  if (opts.resolvedChainId !== undefined) {
    return discovery.hits.find((hit) => hit.chainId === opts.resolvedChainId);
  }
  return undefined;
}

export async function prepareTxHash(
  input: TxHashPrepareInput,
  clients: ClientsBundle,
): Promise<TxHashPrepared> {
  const { hash, chainId, selectedDiscoveryHit } = input;

  if (chainId) {
    try {
      const detail = await clients.txLookup.getTransaction(chainId, hash.trim());
      const chain = getChainById(chainId);
      const discovery: DiscoveryResult = {
        status: "resolved",
        hits: [
          {
            id: `${chainId}-${hash}`,
            chainId,
            chainName: chain?.nameEn ?? `Chain ${chainId}`,
            blockNumber: detail.onchain.blockNumber
              ? Number(detail.onchain.blockNumber)
              : undefined,
            from: detail.tx.from,
            to: detail.tx.to,
            timestamp: detail.timestamp,
          },
        ],
        resolvedChainId: chainId,
      };
      return {
        discovery,
        tx: detail.tx,
        onchain: detail.onchain,
        decodedMethod: detail.decodedMethod,
        timestamp: detail.timestamp,
        resolvedChainId: chainId,
        activeHit: discovery.hits[0],
      };
    } catch {
      /* fall through */
    }
  }

  const discovery = await clients.txLookup.searchQuick(hash.trim());
  const resolvedChainId = resolveChainId(discovery, chainId, selectedDiscoveryHit);

  if (!resolvedChainId) {
    return {
      discovery,
      resolvedChainId,
      activeHit: activeHitFor(discovery, { selectedDiscoveryHit, resolvedChainId }),
    };
  }

  const detail = await clients.txLookup.getTransaction(resolvedChainId, hash.trim());
  return {
    discovery,
    tx: detail.tx,
    onchain: detail.onchain,
    decodedMethod: detail.decodedMethod,
    timestamp: detail.timestamp,
    resolvedChainId,
    activeHit: activeHitFor(discovery, { selectedDiscoveryHit, resolvedChainId }),
  };
}
