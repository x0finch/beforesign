import type { Hash } from "viem";
import type { TxHashContext, TxHashPayload } from "./types.ts";

export function buildContext(hash: Hash, payload?: TxHashPayload): TxHashContext {
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
