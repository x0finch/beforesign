import type { FieldDescriptorInput } from "@beforesign/json-render-catalog";
import { explorerTxUrl } from "@beforesign/core";
import { formatChainName, formatEthValue, formatTimestamp } from "./format_tx.ts";
import type { TxHashFieldContext } from "./types.ts";

function statusBadgeVariant(status: string): "success" | "error" | "info" {
  if (status === "pending") return "info";
  if (status === "fail") return "error";
  return "success";
}

export function buildTxHashFields(ctx: TxHashFieldContext): FieldDescriptorInput[] {
  const fields: FieldDescriptorInput[] = [];
  const chainId =
    ctx.tx?.chainId ?? ctx.onchain?.chainId ?? ctx.resolvedChainId ?? ctx.chainId;
  const chainName = ctx.activeHit?.chainName;
  const from = ctx.tx?.from ?? ctx.activeHit?.from;
  const to = ctx.tx?.to ?? ctx.activeHit?.to;
  const blockNumber = ctx.onchain?.blockNumber ?? ctx.activeHit?.blockNumber;
  const timestamp = ctx.timestamp ?? ctx.activeHit?.timestamp;
  const txData = ctx.tx?.data;

  if (chainId !== undefined) {
    const href = explorerTxUrl(chainId, ctx.hash);
    const status = ctx.onchain?.status;
    const badge =
      status === "pending" ? "pending" : blockNumber !== undefined ? String(blockNumber) : undefined;
    fields.push({
      label: "Chain",
      value: String(chainId),
      displayValue: formatChainName(chainId, chainName),
      kind: "chainId",
      href: href ?? null,
      badge: badge ?? null,
      badgeVariant: status && badge ? statusBadgeVariant(status) : null,
    });
  }

  if (timestamp) {
    fields.push({
      label: "Timestamp",
      value: timestamp,
      displayValue: formatTimestamp(timestamp) ?? null,
      kind: "timestamp",
    });
  }

  if (from) {
    fields.push({ label: "From", value: from, kind: "address" });
  }

  if (to) {
    fields.push({ label: "To", value: to, kind: "address" });
  }

  if (ctx.tx?.value && ctx.tx.value !== "0") {
    fields.push({
      label: "Value",
      value: ctx.tx.value,
      displayValue: formatEthValue(ctx.tx.value) ?? null,
      kind: "amount",
    });
  }

  if (txData !== undefined) {
    fields.push({
      label: "Data",
      value: txData,
      displayValue: txData === "0x" ? "0x (empty)" : null,
      kind: txData === "0x" ? "text" : "hash",
    });
  }

  if (txData && txData !== "0x" && ctx.decodedMethod) {
    fields.push({ label: "Function", value: ctx.decodedMethod, kind: "text" });
  }

  return fields;
}

export function buildTxHashSummary(ctx: TxHashFieldContext): string {
  if (ctx.tx && ctx.onchain) {
    const txData = ctx.tx.data;
    const hasContractData = Boolean(txData && txData !== "0x");
    const hasEthValue = Boolean(ctx.tx.value && ctx.tx.value !== "0");
    if (hasContractData && !hasEthValue) {
      return "On-chain contract call: verify hash, chain, and callee";
    }
    return "On-chain transaction: verify hash, chain, and counterparties";
  }
  if (ctx.discovery?.status === "ambiguous") {
    return "Transaction hash: multiple chains matched; select the correct chain";
  }
  if (ctx.discovery?.status === "notFound") {
    return "Transaction hash not found in Tenderly; verify before acting";
  }
  return "Transaction hash: resolve chain and fetch on-chain details before acting";
}
