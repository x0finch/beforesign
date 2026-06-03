import type { DiscoveryHit, DiscoveryResult } from "@beforesign/core";

const MULTICHAIN_BASE =
  "https://api.blockscout.com/multichain/api/v1/clusters/multichain";

export type BlockscoutClient = {
  searchQuick: (query: string) => Promise<DiscoveryResult>;
};

export function createBlockscoutClient(opts: {
  apiKey: string;
  fetchFn?: typeof fetch;
}): BlockscoutClient {
  const fetchFn = opts.fetchFn ?? fetch;

  return {
    async searchQuick(query: string): Promise<DiscoveryResult> {
      const url = new URL(`${MULTICHAIN_BASE}/search:quick`);
      url.searchParams.set("q", query.trim());
      url.searchParams.set("apikey", opts.apiKey);

      const res = await fetchFn(url.toString());
      if (!res.ok) {
        throw new Error(`Blockscout error: ${res.status}`);
      }

      const data = (await res.json()) as {
        transactions?: Array<Record<string, unknown>>;
      };

      const hits: DiscoveryHit[] = (data.transactions ?? []).map((t, i) => {
        const chainId = Number(t.chain_id ?? 0);
        return {
          id: `${String(t.chain_id ?? "unknown")}-${String(t.hash ?? i)}`,
          chainId,
          chainName: String(t.chain_name ?? `Chain ${t.chain_id}`),
          blockNumber: t.block_number as number | undefined,
          from: t.from as string | undefined,
          to: t.to as string | undefined,
          timestamp: t.timestamp as string | undefined,
        };
      });

      if (hits.length === 0) {
        return { status: "notFound", hits: [] };
      }

      if (hits.length === 1) {
        return {
          status: "resolved",
          hits,
          resolvedChainId: hits[0]?.chainId,
        };
      }

      return { status: "ambiguous", hits };
    },
  };
}
