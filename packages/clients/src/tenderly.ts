import type { DiscoveryHit, DiscoveryResult } from "@beforesign/core";
import { getChainById, explorerTxUrl } from "@beforesign/core";
import type { TxLookupClient, TxLookupDetail } from "./tx_lookup.ts";

const TENDERLY_SEARCH = "https://api.tenderly.co/api/v1/search";

type TenderlyTransaction = {
  hash: string;
  block_number: number;
  from: string;
  to: string;
  input: string;
  value: string;
  nonce: number;
  gas: number;
  gas_used: number;
  gas_price: number;
  gas_fee_cap?: number;
  gas_tip_cap?: number;
  network_id: string;
  status: boolean | null;
  method?: string;
  timestamp?: string;
};

function discoveryFromHits(hits: DiscoveryHit[]): DiscoveryResult {
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
}

function hexToDecimal(value: string | undefined): string | undefined {
  if (!value || value === "0x") return "0";
  if (value.startsWith("0x")) {
    return BigInt(value).toString();
  }
  return value;
}

function validTimestamp(timestamp?: string): string | undefined {
  if (!timestamp) return undefined;
  const ms = Date.parse(timestamp);
  if (!Number.isFinite(ms) || ms <= 0) return undefined;
  return timestamp;
}

function inferOnchainStatus(body: TenderlyTransaction): "success" | "fail" | "pending" {
  if (body.status === true) return "success";
  if (body.status === false) return "fail";
  // quickSearch often omits receipt status; a block number means the tx is mined
  if (body.block_number > 0) return "success";
  return "pending";
}

function mapTenderlyTransaction(
  chainId: number,
  hash: string,
  body: TenderlyTransaction,
): TxLookupDetail {
  const rawInput = body.input ?? "0x";
  const data = rawInput === "" ? "0x" : rawInput;

  const tx = {
    chainId,
    from: body.from,
    to: body.to,
    value: hexToDecimal(body.value),
    data,
    nonce: body.nonce,
    gasLimit: String(body.gas),
    maxFeePerGas: body.gas_fee_cap !== undefined ? String(body.gas_fee_cap) : undefined,
    maxPriorityFeePerGas: body.gas_tip_cap !== undefined ? String(body.gas_tip_cap) : undefined,
    gasPrice: String(body.gas_price),
    hash: body.hash ?? hash,
  };

  const onchain = {
    chainId,
    blockNumber: String(body.block_number),
    status: inferOnchainStatus(body),
    gasUsed: body.gas_used ? String(body.gas_used) : undefined,
    explorerUrl: explorerTxUrl(chainId, hash),
  };

  return {
    tx,
    onchain,
    decodedMethod: body.method || undefined,
    timestamp: validTimestamp(body.timestamp),
  };
}

function hitFromTransaction(body: TenderlyTransaction): DiscoveryHit {
  const chainId = Number(body.network_id);
  const chain = getChainById(chainId);

  return {
    id: `${body.network_id}-${body.hash}`,
    chainId,
    chainName: chain?.nameEn ?? `Chain ${body.network_id}`,
    blockNumber: body.block_number,
    from: body.from,
    to: body.to,
    timestamp: validTimestamp(body.timestamp),
  };
}

export type TenderlyClient = TxLookupClient;

export function createTenderlyClient(opts?: {
  accessKey?: string;
  fetchFn?: typeof fetch;
}): TenderlyClient {
  const fetchFn = opts?.fetchFn ?? fetch;
  const txCache = new Map<string, TenderlyTransaction>();

  async function fetchSearch(query: string): Promise<TenderlyTransaction[]> {
    const url = new URL(TENDERLY_SEARCH);
    url.searchParams.set("query", query.trim());
    url.searchParams.set("quickSearch", "true");

    const headers: Record<string, string> = {};
    if (opts?.accessKey) {
      headers["X-Access-Key"] = opts.accessKey;
    }

    const res = await fetchFn(url.toString(), { headers });
    if (!res.ok) {
      throw new Error(`Tenderly error: ${res.status}`);
    }

    const data = (await res.json()) as { transactions?: TenderlyTransaction[] };
    const transactions = data.transactions ?? [];

    for (const tx of transactions) {
      txCache.set(`${tx.network_id}:${tx.hash.toLowerCase()}`, tx);
    }

    return transactions;
  }

  return {
    async searchQuick(query: string): Promise<DiscoveryResult> {
      const transactions = await fetchSearch(query);
      const hits = transactions.map(hitFromTransaction);
      return discoveryFromHits(hits);
    },

    async getTransaction(chainId: number, hash: string): Promise<TxLookupDetail> {
      const cacheKey = `${chainId}:${hash.toLowerCase()}`;
      let body = txCache.get(cacheKey);

      if (!body) {
        const transactions = await fetchSearch(hash);
        body = transactions.find(
          (tx) => Number(tx.network_id) === chainId && tx.hash.toLowerCase() === hash.toLowerCase(),
        );
      }

      if (!body) {
        throw new Error(`Tenderly transaction error: 404`);
      }

      return mapTenderlyTransaction(chainId, hash, body);
    },
  };
}
