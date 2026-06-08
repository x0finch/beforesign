import type { DiscoveryResult, NormalizedTx, OnchainTxMeta } from "@beforesign/core";

export type TxLookupDetail = {
  tx: NormalizedTx;
  onchain: OnchainTxMeta;
  decodedMethod?: string;
  timestamp?: string;
};

export type TxLookupClient = {
  searchQuick: (query: string) => Promise<DiscoveryResult>;
  getTransaction: (chainId: number, hash: string) => Promise<TxLookupDetail>;
};
