import { explorer_tx_url } from "@beforesign/core";
import type { normalized_tx, onchain_tx_meta } from "@beforesign/core";

const ETHERSCAN_V2 = "https://api.etherscan.io/v2/api";

export type etherscan_client = {
  get_transaction: (chain_id: number, hash: string) => Promise<{
    tx: normalized_tx;
    onchain: onchain_tx_meta;
  }>;
};

function hex_to_num(hex?: string): number | undefined {
  if (!hex) return undefined;
  return Number.parseInt(hex, 16);
}

export function create_etherscan_client(opts: {
  api_key: string;
  fetch_fn?: typeof fetch;
}): etherscan_client {
  const fetch_fn = opts.fetch_fn ?? fetch;

  async function proxy_call(
    chain_id: number,
    action: string,
    params: Record<string, string>,
  ): Promise<unknown> {
    const url = new URL(ETHERSCAN_V2);
    url.searchParams.set("chainid", String(chain_id));
    url.searchParams.set("module", "proxy");
    url.searchParams.set("action", action);
    url.searchParams.set("apikey", opts.api_key);
    for (const [k, v] of Object.entries(params)) {
      url.searchParams.set(k, v);
    }
    const res = await fetch_fn(url.toString());
    if (!res.ok) throw new Error(`Etherscan HTTP ${res.status}`);
    const json = (await res.json()) as { result?: unknown };
    return json.result;
  }

  return {
    async get_transaction(chain_id: number, hash: string) {
      const [tx_raw, receipt_raw] = await Promise.all([
        proxy_call(chain_id, "eth_getTransactionByHash", { txhash: hash }),
        proxy_call(chain_id, "eth_getTransactionReceipt", { txhash: hash }),
      ]);

      if (!tx_raw) {
        throw new Error("Transaction not found on chain");
      }

      const tx_obj = tx_raw as Record<string, string>;
      const receipt = receipt_raw as { status?: string; gasUsed?: string } | null;

      const tx: normalized_tx = {
        chain_id: hex_to_num(tx_obj.chainId) ?? chain_id,
        from: tx_obj.from,
        to: tx_obj.to,
        value: tx_obj.value ? BigInt(tx_obj.value).toString() : undefined,
        data: tx_obj.input,
        nonce: hex_to_num(tx_obj.nonce),
        gas_limit: tx_obj.gas,
        max_fee_per_gas: tx_obj.maxFeePerGas,
        max_priority_fee_per_gas: tx_obj.maxPriorityFeePerGas,
        gas_price: tx_obj.gasPrice,
        type: hex_to_num(tx_obj.type),
        hash: tx_obj.hash ?? hash,
        v: tx_obj.v,
        r: tx_obj.r,
        s: tx_obj.s,
      };

      const status_hex = receipt?.status;
      const onchain: onchain_tx_meta = {
        chain_id,
        block_number: tx_obj.blockNumber,
        status: status_hex === "0x1" ? "success" : status_hex === "0x0" ? "fail" : "pending",
        gas_used: receipt?.gasUsed,
        explorer_url: explorer_tx_url(chain_id, hash),
      };

      return { tx, onchain };
    },
  };
}
