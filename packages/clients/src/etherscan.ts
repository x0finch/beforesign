import { explorerTxUrl } from "@beforesign/core";
import type { NormalizedTx, OnchainTxMeta } from "@beforesign/core";

const ETHERSCAN_V2 = "https://api.etherscan.io/v2/api";

export type EtherscanClient = {
  getTransaction: (
    chainId: number,
    hash: string,
  ) => Promise<{
    tx: NormalizedTx;
    onchain: OnchainTxMeta;
  }>;
};

function hexToNum(hex?: string): number | undefined {
  if (!hex) return undefined;
  return Number.parseInt(hex, 16);
}

export function createEtherscanClient(opts: {
  apiKey: string;
  fetchFn?: typeof fetch;
}): EtherscanClient {
  const fetchFn = opts.fetchFn ?? fetch;

  async function proxyCall(
    chainId: number,
    action: string,
    params: Record<string, string>,
  ): Promise<unknown> {
    const url = new URL(ETHERSCAN_V2);
    url.searchParams.set("chainid", String(chainId));
    url.searchParams.set("module", "proxy");
    url.searchParams.set("action", action);
    url.searchParams.set("apikey", opts.apiKey);
    for (const [k, v] of Object.entries(params)) {
      url.searchParams.set(k, v);
    }
    const res = await fetchFn(url.toString());
    if (!res.ok) throw new Error(`Etherscan HTTP ${res.status}`);
    const json = (await res.json()) as { result?: unknown };
    return json.result;
  }

  return {
    async getTransaction(chainId: number, hash: string) {
      const [txRaw, receiptRaw] = await Promise.all([
        proxyCall(chainId, "eth_getTransactionByHash", { txhash: hash }),
        proxyCall(chainId, "eth_getTransactionReceipt", { txhash: hash }),
      ]);

      if (!txRaw) {
        throw new Error("Transaction not found on chain");
      }

      const txObj = txRaw as Record<string, string>;
      const receipt = receiptRaw as { status?: string; gasUsed?: string } | null;

      const tx: NormalizedTx = {
        chainId: hexToNum(txObj.chainId) ?? chainId,
        from: txObj.from,
        to: txObj.to,
        value: txObj.value ? BigInt(txObj.value).toString() : undefined,
        data: txObj.input,
        nonce: hexToNum(txObj.nonce),
        gasLimit: txObj.gas,
        maxFeePerGas: txObj.maxFeePerGas,
        maxPriorityFeePerGas: txObj.maxPriorityFeePerGas,
        gasPrice: txObj.gasPrice,
        type: hexToNum(txObj.type),
        hash: txObj.hash ?? hash,
        v: txObj.v,
        r: txObj.r,
        s: txObj.s,
      };

      const statusHex = receipt?.status;
      const onchain: OnchainTxMeta = {
        chainId,
        blockNumber: txObj.blockNumber,
        status: statusHex === "0x1" ? "success" : statusHex === "0x0" ? "fail" : "pending",
        gasUsed: receipt?.gasUsed,
        explorerUrl: explorerTxUrl(chainId, hash),
      };

      return { tx, onchain };
    },
  };
}
