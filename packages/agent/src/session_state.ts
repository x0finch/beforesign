import type { ParseInput } from "@beforesign/core";
import type { AskSession } from "./types.ts";

export function createEmptySession(id?: string): AskSession {
  return {
    id: id ?? "",
  };
}

export function buildParseInputFromAsk(
  input: {
    raw: string;
    chainId?: number;
    abi?: string;
    signerAddress?: string;
    selectedDiscoveryHit?: string;
    locale: "zh" | "en";
  },
): ParseInput {
  return {
    raw: input.raw,
    ...(input.chainId !== undefined ? { chainId: input.chainId } : {}),
    ...(input.abi ? { abi: input.abi } : {}),
    ...(input.signerAddress ? { signerAddress: input.signerAddress } : {}),
    ...(input.selectedDiscoveryHit
      ? { selectedDiscoveryHit: input.selectedDiscoveryHit }
      : {}),
    locale: input.locale,
  };
}
