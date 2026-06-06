import { getChainById } from "@beforesign/core";

export function formatChainName(chainId: number, chainName?: string): string {
  if (chainName) return chainName;
  const chain = getChainById(chainId);
  return chain ? chain.nameEn : `Chain ${chainId}`;
}

export function formatEthValue(wei: string): string | undefined {
  if (!/^\d+$/.test(wei)) return undefined;
  const value = BigInt(wei);
  if (value === 0n) return undefined;
  const divisor = 10n ** 18n;
  const whole = value / divisor;
  const fraction = value % divisor;
  const fractionStr = fraction.toString().padStart(18, "0").replace(/0+$/, "");
  const wholeStr = whole.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return fractionStr ? `${wholeStr}.${fractionStr} ETH` : `${wholeStr} ETH`;
}
