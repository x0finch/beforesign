import type { debank_simulation, normalized_tx } from "@beforesign/core";

const DEBANK_BASE = "https://pro-openapi.debank.com/v1/wallet";

export type debank_client = {
  pre_exec_tx: (tx: normalized_tx) => Promise<debank_simulation>;
  explain_tx: (tx: normalized_tx) => Promise<string>;
};

function to_debank_tx(tx: normalized_tx) {
  return {
    chainId: tx.chain_id,
    from: tx.from,
    to: tx.to,
    value: tx.value ? `0x${BigInt(tx.value).toString(16)}` : "0x0",
    data: tx.data ?? "0x",
    gas: tx.gas_limit,
    maxFeePerGas: tx.max_fee_per_gas,
    maxPriorityFeePerGas: tx.max_priority_fee_per_gas,
    nonce: tx.nonce !== undefined ? `0x${tx.nonce.toString(16)}` : undefined,
  };
}

export function create_debank_client(opts: {
  access_key: string;
  fetch_fn?: typeof fetch;
}): debank_client {
  const fetch_fn = opts.fetch_fn ?? fetch;

  async function post(path: string, body: unknown) {
    const res = await fetch_fn(`${DEBANK_BASE}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        AccessKey: opts.access_key,
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      throw new Error(`DeBank error: ${res.status}`);
    }
    return res.json();
  }

  return {
    async pre_exec_tx(tx: normalized_tx) {
      const data = (await post("/pre_exec_tx", { tx: to_debank_tx(tx) })) as {
        pre_exec?: { success?: boolean; error?: string };
        gas?: { gas_used?: number; success?: boolean };
        balance_change?: unknown[];
      };
      return {
        success: data.pre_exec?.success ?? false,
        error: data.pre_exec?.error,
        gas_used: data.gas?.gas_used?.toString(),
        balance_changes: data.balance_change,
      };
    },
    async explain_tx(tx: normalized_tx) {
      const data = (await post("/explain_tx", { tx: to_debank_tx(tx) })) as {
        desc?: string;
        description?: string;
        text?: string;
      };
      return data.desc ?? data.description ?? data.text ?? "";
    },
  };
}
