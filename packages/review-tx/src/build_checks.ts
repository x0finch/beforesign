import type {
  NormalizedTx,
  OnchainTxMeta,
  ReviewCheckBadgeVariant,
  ReviewCheckItem,
} from "@beforesign/core";
import { explorerTxUrl } from "@beforesign/core";
import type { ParseTransactionReturnType } from "viem";
import type { Abi } from "viem";
import { resolveDecodedMethod } from "./decode_method.ts";
import { formatChainName, formatEthValue } from "./format_tx.ts";
import type { TxReviewKind } from "./types.ts";

function statusBadgeVariant(status: string): ReviewCheckBadgeVariant {
  if (status === "pending") return "info";
  if (status === "fail") return "error";
  return "success";
}

function check(
  id: string,
  label: string,
  value: string,
  opts?: Partial<ReviewCheckItem>,
): ReviewCheckItem {
  return { id, group: "default", label, value, kind: "text", ...opts };
}

function mergeFields(
  normalized: ParseTransactionReturnType,
  tx?: NormalizedTx,
): {
  chainId?: number;
  from?: string;
  to?: string;
  value?: string;
  data?: string;
  hash?: string;
} {
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
): { badge?: string; badgeVariant?: ReviewCheckBadgeVariant } {
  if (kind !== "signedTx") return {};

  if (indexed === "notFound") {
    return { badge: "no found", badgeVariant: "error" };
  }

  const status = onchain?.status;
  if (!status) return {};

  if (status === "pending") {
    return { badge: "pending", badgeVariant: "info" };
  }

  const block = blockNumber ?? onchain.blockNumber;
  if (block === undefined) return {};

  return {
    badge: String(block),
    badgeVariant: statusBadgeVariant(status),
  };
}

export function buildChecks(
  normalized: ParseTransactionReturnType,
  opts?: {
    kind?: TxReviewKind;
    abi?: Abi;
    tx?: NormalizedTx;
    decodedMethod?: string;
    onchain?: OnchainTxMeta;
    indexed?: "found" | "notFound";
  },
): ReviewCheckItem[] {
  const checks: ReviewCheckItem[] = [];
  const kind = opts?.kind ?? "signedTx";
  const fields = mergeFields(normalized, opts?.tx);
  const txData = fields.data;
  const blockNumber = opts?.onchain?.blockNumber;

  if (fields.chainId !== undefined) {
    const href =
      kind === "signedTx" && fields.hash
        ? explorerTxUrl(fields.chainId, fields.hash as `0x${string}`)
        : undefined;
    const { badge, badgeVariant } = chainBadge(kind, opts?.indexed, opts?.onchain, blockNumber);

    checks.push(
      check("transaction.chain", "Chain", String(fields.chainId), {
        kind: "chainId",
        displayValue: formatChainName(fields.chainId),
        ...(href ? { href } : {}),
        ...(badge && badgeVariant ? { badge, badgeVariant } : {}),
      }),
    );
  }

  if (kind === "signedTx" && fields.from) {
    checks.push(check("transaction.from", "From", fields.from, { kind: "address" }));
  }

  if (fields.to) {
    checks.push(check("transaction.to", "To", fields.to, { kind: "address" }));
  }

  if (fields.value && fields.value !== "0") {
    checks.push(
      check("transaction.value", "Value", fields.value, {
        kind: "amount",
        displayValue: formatEthValue(fields.value),
      }),
    );
  }

  if (txData !== undefined) {
    checks.push(
      check("transaction.data", "Data", txData, {
        kind: txData === "0x" ? "text" : "hash",
        displayValue: txData === "0x" ? "0x (empty)" : undefined,
      }),
    );
  }

  const functionName = resolveDecodedMethod(txData, opts?.abi, opts?.decodedMethod);
  if (txData && txData !== "0x" && functionName) {
    checks.push({
      id: "calldata.function",
      group: "default",
      label: "Function",
      value: functionName,
      kind: "text",
    });
  }

  return checks;
}
