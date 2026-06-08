import type { ViewResult } from "@beforesign/core";
import type { CalldataCall } from "@beforesign/calldata-parse";
import type {
  DiscoveryHit,
  DiscoveryResult,
  NormalizedTx,
  OnchainTxMeta,
} from "@beforesign/core";
import type { Hash } from "viem";

export type TxHashViewInput = {
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
  calldataTree?: CalldataCall;
  contractAddress?: string;
};

export type TxHashViewResult = ViewResult;
