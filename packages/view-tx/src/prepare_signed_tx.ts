import type { ClientsBundle } from "@beforesign/clients";
import type { NormalizedTx, OnchainTxMeta } from "@beforesign/core";
import {
  keccak256,
  recoverTransactionAddress,
  serializeTransaction,
  type Hash,
  type ParseTransactionReturnType,
} from "viem";

function bigintToString(v: bigint | undefined): string | undefined {
  return v === undefined ? undefined : v.toString();
}

export type PreparedSignedTx = {
  tx: NormalizedTx;
  onchain?: OnchainTxMeta;
  indexed: "found" | "notFound";
};

export async function prepareSignedTx(
  normalized: ParseTransactionReturnType,
  clients: ClientsBundle,
  tx?: NormalizedTx,
): Promise<PreparedSignedTx> {
  const serialized = serializeTransaction(normalized);
  const hash = keccak256(serialized) as Hash;
  const from = await recoverTransactionAddress({ serializedTransaction: serialized });
  const chainId = tx?.chainId ?? normalized.chainId;

  const merged: NormalizedTx = {
    ...tx,
    chainId,
    from,
    to: tx?.to ?? normalized.to ?? undefined,
    value: tx?.value ?? bigintToString(normalized.value),
    data: tx?.data ?? normalized.data,
    hash,
  };

  if (chainId === undefined) {
    return { tx: merged, indexed: "notFound" };
  }

  const discovery = await clients.txLookup.searchQuick(hash);
  if (discovery.status === "notFound") {
    return { tx: merged, indexed: "notFound" };
  }

  const detail = await clients.txLookup.getTransaction(chainId, hash);
  return {
    tx: { ...merged, ...detail.tx, from, hash },
    onchain: detail.onchain,
    indexed: "found",
  };
}
