import type {
  DiscoveryHit,
  DiscoveryResult,
  NormalizedTx,
  OnchainTxMeta,
  ViewResult,
} from "@beforesign/core";
import type { Hash } from "viem";

export type TxHashViewInput = {
  hash: Hash;
  chainId?: number;
  selectedDiscoveryHit?: string;
};

export type TxHashFieldContext = TxHashViewInput & {
  discovery?: DiscoveryResult;
  tx?: NormalizedTx;
  onchain?: OnchainTxMeta;
  decodedMethod?: string;
  timestamp?: string;
  activeHit?: DiscoveryHit;
  resolvedChainId?: number;
};

export type TxHashViewResult = ViewResult;
