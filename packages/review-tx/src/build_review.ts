import type { ClientsBundle } from "@beforesign/clients";
import type { ReviewDocument } from "@beforesign/core";
import type { ParseTransactionReturnType } from "viem";
import { buildChecks } from "./build_checks.ts";
import { prepareSignedTx } from "./prepare_signed.ts";
import type { TxPayload, TxReviewKind } from "./types.ts";

function buildSummary(kind: TxReviewKind): string {
  if (kind === "signedTx") {
    return "Signed transaction: verify chain, counterparties, and calldata";
  }
  return "Unsigned transaction: verify chain, counterparties, and calldata before signing";
}

export async function buildReview(
  normalized: ParseTransactionReturnType,
  clients: ClientsBundle,
  payload?: TxPayload,
): Promise<ReviewDocument> {
  const kind = payload?.kind ?? "signedTx";
  let ctx: TxPayload = { ...payload, kind };

  if (kind === "signedTx" && payload?.indexed === undefined) {
    const prepared = await prepareSignedTx(normalized, clients, payload?.tx);
    ctx = {
      ...ctx,
      tx: prepared.tx,
      onchain: prepared.onchain,
      indexed: prepared.indexed,
    };
  }

  const checks = buildChecks(normalized, {
    kind: ctx.kind,
    abi: ctx.abi,
    tx: ctx.tx,
    decodedMethod: ctx.decodedMethod,
    onchain: ctx.onchain,
    indexed: ctx.indexed,
  });

  return {
    kind,
    title: "Transaction",
    summary: buildSummary(kind),
    checks,
    warnings: [],
  };
}
