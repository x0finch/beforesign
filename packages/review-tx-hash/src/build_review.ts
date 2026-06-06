import type { ClientsBundle } from "@beforesign/clients";
import type { ReviewDocument } from "@beforesign/core";
import type { Hash } from "viem";
import { buildChecks } from "./build_checks.ts";
import { buildContext } from "./build_context.ts";
import { enrichContext } from "./prepare_tx_hash.ts";
import type { TxHashPayload } from "./types.ts";

function buildSummary(ctx: Awaited<ReturnType<typeof enrichContext>>): string {
  if (ctx.tx && ctx.onchain) {
    return "On-chain transaction: verify hash, chain, counterparties, and calldata";
  }
  if (ctx.discovery?.status === "ambiguous") {
    return "Transaction hash: multiple chains matched; select the correct chain";
  }
  if (ctx.discovery?.status === "notFound") {
    return "Transaction hash not found in Tenderly; verify before acting";
  }
  return "Transaction hash: resolve chain and fetch on-chain details before acting";
}

export async function buildReview(
  normalized: Hash,
  clients: ClientsBundle,
  payload?: TxHashPayload,
): Promise<ReviewDocument> {
  const ctx = await enrichContext(buildContext(normalized, payload), clients);
  const checks = buildChecks(ctx);

  return {
    kind: "txHash",
    title: "Transaction",
    summary: buildSummary(ctx),
    checks,
    warnings: [],
  };
}
