import type { ClientsBundle } from "@beforesign/clients";
import { resolveChainId } from "@beforesign/clients";
import { getChainById } from "@beforesign/core";
import type { Hash } from "viem";
import { buildContext } from "./build_context.ts";
import type { TxHashContext, TxHashPayload, TxHashPrepared } from "./types.ts";

function isFullyPrepared(ctx: TxHashContext): boolean {
  return Boolean(ctx.discovery && ctx.tx && ctx.onchain);
}

function activeHitFor(ctx: TxHashContext): TxHashContext["activeHit"] {
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
      rawInputTruncated: ctx.rawInputTruncated,
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
        rawInputTruncated: detail.rawInputTruncated,
        timestamp: detail.timestamp,
      };
    } catch {
      /* fall through to multichain / probe discovery */
    }
  }

  const discovery =
    ctx.discovery ?? (await clients.txLookup.searchQuick(hash.trim()));

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
      rawInputTruncated: ctx.rawInputTruncated,
      timestamp: ctx.timestamp,
    };
  }

  const detail = await clients.txLookup.getTransaction(resolvedChainId, hash.trim());

  return {
    discovery,
    tx: detail.tx,
    onchain: detail.onchain,
    decodedMethod: detail.decodedMethod,
    rawInputTruncated: detail.rawInputTruncated,
    timestamp: detail.timestamp,
  };
}

export async function enrichContext(
  ctx: TxHashContext,
  clients: ClientsBundle,
): Promise<TxHashContext> {
  const prepared = await prepareTxHash(ctx.hash, clients, {
    chainId: ctx.chainId,
    selectedDiscoveryHit: ctx.selectedDiscoveryHit,
    discovery: ctx.discovery,
    tx: ctx.tx,
    onchain: ctx.onchain,
    decodedMethod: ctx.decodedMethod,
    rawInputTruncated: ctx.rawInputTruncated,
    timestamp: ctx.timestamp,
  });

  const resolvedChainId = resolveChainId(
    prepared.discovery,
    ctx.chainId,
    ctx.selectedDiscoveryHit,
  );

  return {
    ...ctx,
    discovery: prepared.discovery,
    tx: prepared.tx,
    onchain: prepared.onchain,
    decodedMethod: prepared.decodedMethod,
    rawInputTruncated: prepared.rawInputTruncated,
    timestamp: prepared.timestamp ?? ctx.timestamp,
    resolvedChainId,
    activeHit: activeHitFor({
      ...ctx,
      discovery: prepared.discovery,
      resolvedChainId,
    }),
  };
}
