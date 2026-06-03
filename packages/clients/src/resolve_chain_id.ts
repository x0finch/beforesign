import type { DiscoveryResult } from "@beforesign/core";

export function resolveChainId(
  discovery: DiscoveryResult,
  userChainId?: number,
  selectedHitId?: string,
): number | undefined {
  if (userChainId) return userChainId;

  if (discovery.status === "resolved" && discovery.resolvedChainId) {
    return discovery.resolvedChainId;
  }

  if (selectedHitId) {
    const hit = discovery.hits.find((h) => h.id === selectedHitId);
    if (hit) return hit.chainId;
  }

  if (discovery.hits.length === 1) {
    return discovery.hits[0]?.chainId;
  }

  return undefined;
}
