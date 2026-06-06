import type { ReviewCheckBadgeVariant, ReviewCheckItem } from "@beforesign/core";
import { explorerTxUrl } from "@beforesign/core";
import { formatChainName, formatEthValue, formatTimestamp } from "./format_tx.ts";
import type { TxHashContext } from "./types.ts";

function statusBadgeVariant(status: string): ReviewCheckBadgeVariant {
  if (status === "pending") return "info";
  if (status === "fail") return "error";
  return "success";
}

function check(
  id: string,
  group: string,
  label: string,
  value: string,
  opts?: Partial<ReviewCheckItem>,
): ReviewCheckItem {
  return { id, group, label, value, kind: "text", ...opts };
}

export function buildChecks(ctx: TxHashContext): ReviewCheckItem[] {
  const checks: ReviewCheckItem[] = [];

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

    checks.push(
      check("transaction.chain", "default", "Chain", String(chainId), {
        kind: "chainId",
        displayValue: formatChainName(chainId, chainName),
        ...(href ? { href } : {}),
        ...(status && badge
          ? {
              badge,
              badgeVariant: statusBadgeVariant(status),
            }
          : {}),
      }),
    );
  }

  if (timestamp) {
    checks.push(
      check("transaction.timestamp", "default", "Timestamp", timestamp, {
        kind: "timestamp",
        displayValue: formatTimestamp(timestamp),
      }),
    );
  }

  if (from) {
    checks.push(
      check("transaction.from", "default", "From", from, { kind: "address" }),
    );
  }

  if (to) {
    checks.push(check("transaction.to", "default", "To", to, { kind: "address" }));
  }

  if (ctx.tx?.value && ctx.tx.value !== "0") {
    checks.push(
      check("transaction.value", "default", "Value", ctx.tx.value, {
        kind: "amount",
        displayValue: formatEthValue(ctx.tx.value),
      }),
    );
  }

  if (txData !== undefined) {
    checks.push(
      check("transaction.data", "default", "Data", txData, {
        kind: txData === "0x" ? "text" : "hash",
        displayValue: txData === "0x" ? "0x (empty)" : undefined,
      }),
    );
  }

  if (txData && txData !== "0x" && ctx.decodedMethod) {
    checks.push({
      id: "calldata.function",
      group: "default",
      label: "Function",
      value: ctx.decodedMethod,
      kind: "text",
    });
  }

  return checks;
}
