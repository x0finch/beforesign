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

export type TxHashPayload = {
  chainId?: number;
  selectedDiscoveryHit?: string;
  discovery?: DiscoveryResult;
  tx?: NormalizedTx;
  onchain?: OnchainTxMeta;
  decodedMethod?: string;
  timestamp?: string;
};

export type TxHashPrepared = {
  discovery: DiscoveryResult;
  tx?: NormalizedTx;
  onchain?: OnchainTxMeta;
  decodedMethod?: string;
  timestamp?: string;
};

function buildContext(hash: Hash, payload?: TxHashPayload) {
  return {
    hash,
    chainId: payload?.chainId,
    selectedDiscoveryHit: payload?.selectedDiscoveryHit,
    discovery: payload?.discovery,
    tx: payload?.tx,
    onchain: payload?.onchain,
    decodedMethod: payload?.decodedMethod,
    timestamp: payload?.timestamp,
  };
}

function isFullyPrepared(ctx: ReturnType<typeof buildContext>): boolean {
  return Boolean(ctx.discovery && ctx.tx && ctx.onchain);
}

export async function prepareTxHash(
  hash: Hash,
  clients: ClientsBundle,
  payload?: TxHashPayload,
): Promise<TxHashPrepared> {
  const ctx = buildContext(hash, payload);

  if (isFullyPrepared(ctx)) {
    return {
      discovery: ctx.discovery!,
      tx: ctx.tx,
      onchain: ctx.onchain,
      decodedMethod: ctx.decodedMethod,
      timestamp: ctx.timestamp,
    };
  }

  if (ctx.chainId && !ctx.discovery && !ctx.tx) {
    try {
      const detail = await clients.txLookup.getTransaction(ctx.chainId, hash.trim());
      const chain = getChainById(ctx.chainId);
      return {
        discovery: {
          status: "resolved",
          hits: [
            {
              id: `${ctx.chainId}-${hash}`,
              chainId: ctx.chainId,
              chainName: chain?.nameEn ?? `Chain ${ctx.chainId}`,
              blockNumber: detail.onchain.blockNumber
                ? Number(detail.onchain.blockNumber)
                : undefined,
              from: detail.tx.from,
              to: detail.tx.to,
              timestamp: detail.timestamp,
            },
          ],
          resolvedChainId: ctx.chainId,
        },
        tx: detail.tx,
        onchain: detail.onchain,
        decodedMethod: detail.decodedMethod,
        timestamp: detail.timestamp,
      };
    } catch {
      /* fall through */
    }
  }

  const discovery = ctx.discovery ?? (await clients.txLookup.searchQuick(hash.trim()));
  const resolvedChainId = resolveChainId(
    discovery,
    ctx.chainId,
    ctx.selectedDiscoveryHit,
  );

  if (!resolvedChainId) {
    return { discovery };
  }

  if (ctx.tx && ctx.onchain) {
    return {
      discovery,
      tx: ctx.tx,
      onchain: ctx.onchain,
      decodedMethod: ctx.decodedMethod,
      timestamp: ctx.timestamp,
    };
  }

  const detail = await clients.txLookup.getTransaction(resolvedChainId, hash.trim());
  return {
    discovery,
    tx: detail.tx,
    onchain: detail.onchain,
    decodedMethod: detail.decodedMethod,
    timestamp: detail.timestamp,
  };
}

export type TxHashViewContext = {
  hash: Hash;
  chainId?: number;
  selectedDiscoveryHit?: string;
  discovery?: DiscoveryResult;
  tx?: NormalizedTx;
  onchain?: OnchainTxMeta;
  decodedMethod?: string;
  timestamp?: string;
  activeHit?: DiscoveryHit;
  resolvedChainId?: number;
};

function activeHitFor(ctx: TxHashViewContext): DiscoveryHit | undefined {
  const { discovery } = ctx;
  if (!discovery || discovery.hits.length === 0) return undefined;
  if (ctx.selectedDiscoveryHit) {
    return discovery.hits.find((hit) => hit.id === ctx.selectedDiscoveryHit);
  }
  if (discovery.status === "resolved" && discovery.hits.length === 1) {
    return discovery.hits[0];
  }
  if (ctx.resolvedChainId !== undefined) {
    return discovery.hits.find((hit) => hit.chainId === ctx.resolvedChainId);
  }
  return undefined;
}

export async function enrichTxHashContext(
  hash: Hash,
  clients: ClientsBundle,
  payload?: TxHashPayload,
): Promise<TxHashViewContext> {
  const prepared = await prepareTxHash(hash, clients, payload);
  const resolvedChainId = resolveChainId(
    prepared.discovery,
    payload?.chainId,
    payload?.selectedDiscoveryHit,
  );
  const ctx: TxHashViewContext = {
    hash,
    chainId: payload?.chainId,
    selectedDiscoveryHit: payload?.selectedDiscoveryHit,
    discovery: prepared.discovery,
    tx: prepared.tx,
    onchain: prepared.onchain,
    decodedMethod: prepared.decodedMethod,
    timestamp: prepared.timestamp,
    resolvedChainId,
  };
  return { ...ctx, activeHit: activeHitFor(ctx) };
}
