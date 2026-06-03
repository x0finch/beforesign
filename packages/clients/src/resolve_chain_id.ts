import type { discovery_result } from "@beforesign/core";

export function resolve_chain_id(
  discovery: discovery_result,
  user_chain_id?: number,
  selected_hit_id?: string,
): number | undefined {
  if (user_chain_id) return user_chain_id;

  if (discovery.status === "resolved" && discovery.resolved_chain_id) {
    return discovery.resolved_chain_id;
  }

  if (selected_hit_id) {
    const hit = discovery.hits.find((h) => h.id === selected_hit_id);
    if (hit) return hit.chain_id;
  }

  if (discovery.hits.length === 1) {
    return discovery.hits[0]?.chain_id;
  }

  return undefined;
}
