import type { DebankSimulation, NormalizedTx } from "@beforesign/core";

const DEBANK_BASE = "https://pro-openapi.debank.com/v1/wallet";

export type DebankClient = {
  preExecTx: (tx: NormalizedTx) => Promise<DebankSimulation>;
  explainTx: (tx: NormalizedTx) => Promise<string>;
};

function toDebankTx(tx: NormalizedTx) {
  return {
    chainId: tx.chainId,
    from: tx.from,
    to: tx.to,
    value: tx.value ? `0x${BigInt(tx.value).toString(16)}` : "0x0",
    data: tx.data ?? "0x",
    gas: tx.gasLimit,
    maxFeePerGas: tx.maxFeePerGas,
    maxPriorityFeePerGas: tx.maxPriorityFeePerGas,
    nonce: tx.nonce !== undefined ? `0x${tx.nonce.toString(16)}` : undefined,
  };
}

export function createDebankClient(opts: {
  accessKey: string;
  fetchFn?: typeof fetch;
}): DebankClient {
  const fetchFn = opts.fetchFn ?? fetch;

  async function post(path: string, body: unknown) {
    const res = await fetchFn(`${DEBANK_BASE}${path}`, {
      method: "POST",
      headers: {
        ["Content-Type"]: "application/json",
        ["AccessKey"]: opts.accessKey,
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      throw new Error(`DeBank error: ${res.status}`);
    }
    return res.json();
  }

  return {
    async preExecTx(tx: NormalizedTx) {
      const data = (await post("/pre_exec_tx", { tx: toDebankTx(tx) })) as Record<
        string,
        unknown
      >;
      const preExec = data["pre_exec"] as { success?: boolean; error?: string } | undefined;
      const gas = data.gas as Record<string, unknown> | undefined;
      return {
        success: preExec?.success ?? false,
        error: preExec?.error,
        gasUsed:
          gas?.["gas_used"] !== undefined ? String(gas["gas_used"] as number) : undefined,
        balanceChanges: data["balance_change"] as unknown[] | undefined,
      };
    },
    async explainTx(tx: NormalizedTx) {
      const data = (await post("/explain_tx", { tx: toDebankTx(tx) })) as {
        desc?: string;
        description?: string;
        text?: string;
      };
      return data.desc ?? data.description ?? data.text ?? "";
    },
  };
}
