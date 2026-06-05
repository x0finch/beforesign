export type TokenHint = {
  symbol: string;
  decimals: number;
};

const USDC_MAINNET = "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48";

const CONTRACT_HINTS: Record<string, TokenHint> = {
  [USDC_MAINNET]: { symbol: "USDC", decimals: 6 },
};

export function lookupTokenHint(
  verifyingContract: string | undefined,
  domainName: string | undefined,
): TokenHint | undefined {
  if (verifyingContract) {
    const hint = CONTRACT_HINTS[verifyingContract.toLowerCase()];
    if (hint) return hint;
  }
  if (domainName === "USD Coin") {
    return { symbol: "USDC", decimals: 6 };
  }
  return undefined;
}
