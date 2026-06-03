import type { discovery_hit, discovery_result } from "@beforesign/core";

const MULTICHAIN_BASE =
  "https://api.blockscout.com/multichain/api/v1/clusters/multichain";

export type blockscout_client = {
  search_quick: (query: string) => Promise<discovery_result>;
};

export function create_blockscout_client(opts: {
  api_key: string;
  fetch_fn?: typeof fetch;
}): blockscout_client {
  const fetch_fn = opts.fetch_fn ?? fetch;

  return {
    async search_quick(query: string): Promise<discovery_result> {
      const url = new URL(`${MULTICHAIN_BASE}/search:quick`);
      url.searchParams.set("q", query.trim());
      url.searchParams.set("apikey", opts.api_key);

      const res = await fetch_fn(url.toString());
      if (!res.ok) {
        throw new Error(`Blockscout error: ${res.status}`);
      }

      const data = (await res.json()) as {
        transactions?: Array<{
          chain_id?: number;
          chain_name?: string;
          hash?: string;
          from?: string;
          to?: string;
          block_number?: number;
          timestamp?: string;
        }>;
      };

      const hits: discovery_hit[] = (data.transactions ?? []).map((t, i) => ({
        id: `${t.chain_id ?? "unknown"}-${t.hash ?? i}`,
        chain_id: Number(t.chain_id ?? 0),
        chain_name: t.chain_name ?? `Chain ${t.chain_id}`,
        block_number: t.block_number,
        from: t.from,
        to: t.to,
        timestamp: t.timestamp,
      }));

      if (hits.length === 0) {
        return { status: "not_found", hits: [] };
      }

      if (hits.length === 1) {
        return {
          status: "resolved",
          hits,
          resolved_chain_id: hits[0]?.chain_id,
        };
      }

      return { status: "ambiguous", hits };
    },
  };
}
