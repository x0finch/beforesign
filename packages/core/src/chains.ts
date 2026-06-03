export type ChainInfo = {
  chainId: number;
  name: string;
  nameEn: string;
  explorerTxUrl: string;
};

export const CHAINS: ChainInfo[] = [
  {
    chainId: 1,
    name: "Ethereum",
    nameEn: "Ethereum",
    explorerTxUrl: "https://etherscan.io/tx/{hash}",
  },
  {
    chainId: 42161,
    name: "Arbitrum",
    nameEn: "Arbitrum One",
    explorerTxUrl: "https://arbiscan.io/tx/{hash}",
  },
  {
    chainId: 10,
    name: "Optimism",
    nameEn: "OP Mainnet",
    explorerTxUrl: "https://optimistic.etherscan.io/tx/{hash}",
  },
  {
    chainId: 8453,
    name: "Base",
    nameEn: "Base",
    explorerTxUrl: "https://basescan.org/tx/{hash}",
  },
  {
    chainId: 137,
    name: "Polygon",
    nameEn: "Polygon",
    explorerTxUrl: "https://polygonscan.com/tx/{hash}",
  },
  {
    chainId: 56,
    name: "BSC",
    nameEn: "BNB Smart Chain",
    explorerTxUrl: "https://bscscan.com/tx/{hash}",
  },
];

export function getChainById(chainId: number): ChainInfo | undefined {
  return CHAINS.find((c) => c.chainId === chainId);
}

export function explorerTxUrl(chainId: number, hash: string): string | undefined {
  const chain = getChainById(chainId);
  if (!chain) return undefined;
  return chain.explorerTxUrl.replace("{hash}", hash);
}
