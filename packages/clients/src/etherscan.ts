import type { NormalizedTx, OnchainTxMeta } from "@beforesign/core";
import { explorerTxUrl } from "@beforesign/core";
import {
  decodeFunctionResult,
  encodeFunctionData,
  erc20Abi,
  getAddress,
  isAddress,
} from "viem";

const ETHERSCAN_V2 = "https://api.etherscan.io/v2/api";

export type TokenInfo = {
  symbol: string;
  decimals: number;
};

export type EtherscanClient = {
  getTransaction: (
    chainId: number,
    hash: string,
  ) => Promise<{
    tx: NormalizedTx;
    onchain: OnchainTxMeta;
  }>;
  getTokenInfo: (chainId: number, address: string) => Promise<TokenInfo>;
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

  async function ethCall(chainId: number, to: string, data: `0x${string}`): Promise<`0x${string}`> {
    const result = await proxyCall(chainId, "eth_call", { to, data, tag: "latest" });
    if (typeof result !== "string" || !result.startsWith("0x")) {
      throw new Error("Invalid eth_call response");
    }
    return result as `0x${string}`;
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

    async getTokenInfo(chainId: number, address: string) {
      if (!isAddress(address)) {
        throw new Error("Invalid token address");
      }
      const to = getAddress(address);
      const symbolData = encodeFunctionData({ abi: erc20Abi, functionName: "symbol" });
      const decimalsData = encodeFunctionData({ abi: erc20Abi, functionName: "decimals" });

      const [symbolHex, decimalsHex] = await Promise.all([
        ethCall(chainId, to, symbolData),
        ethCall(chainId, to, decimalsData),
      ]);

      const symbol = decodeFunctionResult({
        abi: erc20Abi,
        functionName: "symbol",
        data: symbolHex,
      });
      const decimals = decodeFunctionResult({
        abi: erc20Abi,
        functionName: "decimals",
        data: decimalsHex,
      });

      return { symbol, decimals: Number(decimals) };
    },
  };
}
