import type { FieldDescriptorInput } from "@beforesign/json-render-catalog";
import type { NormalizedTx, OnchainTxMeta } from "@beforesign/core";
import { explorerTxUrl } from "@beforesign/core";
import type { ParseTransactionReturnType } from "viem";
import type { Abi } from "viem";
import { resolveDecodedMethod } from "./decode_method.ts";
import { formatChainName, formatEthValue } from "./format_tx.ts";
import type { TxReviewKind } from "./types.ts";

function statusBadgeVariant(status: string): "success" | "error" | "info" {
  if (status === "pending") return "info";
  if (status === "fail") return "error";
  return "success";
}

function mergeFields(
  normalized: ParseTransactionReturnType,
  tx?: NormalizedTx,
) {
  return {
    chainId: tx?.chainId ?? normalized.chainId,
    from: tx?.from,
    to: tx?.to ?? normalized.to ?? undefined,
    value:
      tx?.value ??
      (normalized.value !== undefined ? normalized.value.toString() : undefined),
    data: tx?.data ?? normalized.data,
    hash: tx?.hash,
  };
}

function chainBadge(
  kind: TxReviewKind,
  indexed: "found" | "notFound" | undefined,
  onchain: OnchainTxMeta | undefined,
  blockNumber: string | undefined,
): { badge?: string; badgeVariant?: FieldDescriptorInput["badgeVariant"] } {
  if (kind !== "signedTx") return {};
  if (indexed === "notFound") return { badge: "no found", badgeVariant: "error" };
  const status = onchain?.status;
  if (!status) return {};
  if (status === "pending") return { badge: "pending", badgeVariant: "info" };
  const block = blockNumber ?? onchain.blockNumber;
  if (block === undefined) return {};
  return { badge: String(block), badgeVariant: statusBadgeVariant(status) };
}

export function buildTxFields(
  normalized: ParseTransactionReturnType,
  opts?: {
    kind?: TxReviewKind;
    abi?: Abi;
    tx?: NormalizedTx;
    decodedMethod?: string;
    onchain?: OnchainTxMeta;
    indexed?: "found" | "notFound";
  },
): FieldDescriptorInput[] {
  const fields: FieldDescriptorInput[] = [];
  const kind = opts?.kind ?? "signedTx";
  const merged = mergeFields(normalized, opts?.tx);
  const txData = merged.data;
  const blockNumber = opts?.onchain?.blockNumber;

  if (merged.chainId !== undefined) {
    const href =
      kind === "signedTx" && merged.hash
        ? explorerTxUrl(merged.chainId, merged.hash as `0x${string}`)
        : undefined;
    const { badge, badgeVariant } = chainBadge(kind, opts?.indexed, opts?.onchain, blockNumber);
    fields.push({
      label: "Chain",
      value: String(merged.chainId),
      displayValue: formatChainName(merged.chainId),
      kind: "chainId",
      href: href ?? null,
      badge: badge ?? null,
      badgeVariant: badgeVariant ?? null,
    });
  }

  if (kind === "signedTx" && merged.from) {
    fields.push({ label: "From", value: merged.from, kind: "address" });
  }

  if (merged.to) {
    fields.push({ label: "To", value: merged.to, kind: "address" });
  }

  if (merged.value && merged.value !== "0") {
    fields.push({
      label: "Value",
      value: merged.value,
      displayValue: formatEthValue(merged.value) ?? null,
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

  const functionName = resolveDecodedMethod(txData, opts?.abi, opts?.decodedMethod);
  if (txData && txData !== "0x" && functionName) {
    fields.push({ label: "Function", value: functionName, kind: "text" });
  }

  return fields;
}
