import type {
  DiscoveryHit,
  DiscoveryResult,
  NormalizedTx,
  OnchainTxMeta,
} from "@beforesign/core";
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

export type TxHashContext = {
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

export type TxHashPrepared = {
  discovery: DiscoveryResult;
  tx?: NormalizedTx;
  onchain?: OnchainTxMeta;
  decodedMethod?: string;
  timestamp?: string;
};
