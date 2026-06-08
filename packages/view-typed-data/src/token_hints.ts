import type { EtherscanClient } from "@beforesign/clients";
import type { TypedDataContext } from "./profiles/context.ts";

export type TokenHint = {
  symbol: string;
  decimals: number;
};

const ADDRESS_RE = /^0x[a-fA-F0-9]{40}$/;

export function domainChainId(domain: Record<string, unknown>): number | undefined {
  const raw = domain.chainId;
  if (typeof raw === "number" && Number.isFinite(raw)) return raw;
  if (typeof raw === "string" && /^\d+$/.test(raw)) return Number(raw);
  return undefined;
}

export async function fetchTokenHint(
  chainId: number | undefined,
  address: string | undefined,
  etherscan: EtherscanClient,
): Promise<TokenHint | undefined> {
  if (chainId === undefined || !address || !ADDRESS_RE.test(address)) {
    return undefined;
  }
  try {
    return await etherscan.getTokenInfo(chainId, address);
  } catch {
    return undefined;
  }
}

export function hintForField(
  ctx: TypedDataContext,
  fieldName: string,
  rawValue: unknown,
): TokenHint | undefined {
  if (fieldName === "token" && typeof rawValue === "string") {
    return ctx.tokenHintsByAddress?.[rawValue.toLowerCase()];
  }
  if (fieldName === "verifyingContract" && typeof rawValue === "string") {
    return ctx.tokenHintsByAddress?.[rawValue.toLowerCase()];
  }
  if (
    (fieldName === "value" || fieldName === "amount" || fieldName === "allowed") &&
    ctx.tokenHint
  ) {
    return ctx.tokenHint;
  }
  return undefined;
}
