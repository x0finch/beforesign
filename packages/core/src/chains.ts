export type chain_info = {
  chain_id: number;
  name: string;
  name_en: string;
  explorer_tx_url: string;
};

export const CHAINS: chain_info[] = [
  {
    chain_id: 1,
    name: "Ethereum",
    name_en: "Ethereum",
    explorer_tx_url: "https://etherscan.io/tx/{hash}",
  },
  {
    chain_id: 42161,
    name: "Arbitrum",
    name_en: "Arbitrum One",
    explorer_tx_url: "https://arbiscan.io/tx/{hash}",
  },
  {
    chain_id: 10,
    name: "Optimism",
    name_en: "OP Mainnet",
    explorer_tx_url: "https://optimistic.etherscan.io/tx/{hash}",
  },
  {
    chain_id: 8453,
    name: "Base",
    name_en: "Base",
    explorer_tx_url: "https://basescan.org/tx/{hash}",
  },
  {
    chain_id: 137,
    name: "Polygon",
    name_en: "Polygon",
    explorer_tx_url: "https://polygonscan.com/tx/{hash}",
  },
  {
    chain_id: 56,
    name: "BSC",
    name_en: "BNB Smart Chain",
    explorer_tx_url: "https://bscscan.com/tx/{hash}",
  },
];

export function get_chain_by_id(chain_id: number): chain_info | undefined {
  return CHAINS.find((c) => c.chain_id === chain_id);
}

export function explorer_tx_url(chain_id: number, hash: string): string | undefined {
  const chain = get_chain_by_id(chain_id);
  if (!chain) return undefined;
  return chain.explorer_tx_url.replace("{hash}", hash);
}
