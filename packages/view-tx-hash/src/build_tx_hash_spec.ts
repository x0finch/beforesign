import type { ClientsBundle } from "@beforesign/clients";
import type { WarningItem } from "@beforesign/core";
import {
  buildCardShell,
  createFieldElements,
  resetElementIds,
  type ViewElement,
} from "@beforesign/json-render-catalog";
import { buildTxHashFields, buildTxHashSummary } from "./build_fields.ts";
import { prepareTxHash } from "./prepare_tx_hash.ts";
import type { TxHashViewInput, TxHashViewResult } from "./types.ts";

function buildDiscoveryWarnings(
  status: string | undefined,
): WarningItem[] {
  const warnings: WarningItem[] = [];
  if (status === "notFound") {
    warnings.push({
      code: "txNotIndexed",
      severity: "info",
      message: "Transaction hash not found in Tenderly index",
    });
  }
  if (status === "ambiguous") {
    warnings.push({
      code: "ambiguousChain",
      severity: "info",
      message: "Multiple chains matched; select the correct one",
    });
  }
  return warnings;
}

function buildPlaceholderSpec(
  summary: string,
  warnings: WarningItem[],
): TxHashViewResult["spec"] {
  resetElementIds();
  const shell = buildCardShell({
    title: "Transaction",
    description: summary,
    warnings: warnings.map((w) => ({
      code: w.code,
      severity: w.severity,
      message: w.message,
    })),
    sections: [],
  });
  return shell.spec as unknown as TxHashViewResult["spec"];
}

export async function buildTxHashSpec(
  input: TxHashViewInput,
  clients: ClientsBundle,
): Promise<TxHashViewResult> {
  try {
    const prepared = await prepareTxHash(input, clients);
    const viewCtx = {
      hash: input.hash,
      chainId: input.chainId,
      selectedDiscoveryHit: input.selectedDiscoveryHit,
      discovery: prepared.discovery,
      tx: prepared.tx,
      onchain: prepared.onchain,
      decodedMethod: prepared.decodedMethod,
      timestamp: prepared.timestamp,
      activeHit: prepared.activeHit,
      resolvedChainId: prepared.resolvedChainId,
    };

    const discoveryWarnings = buildDiscoveryWarnings(prepared.discovery.status);

    if (prepared.discovery.status === "ambiguous" || !prepared.tx) {
      const summary = buildTxHashSummary(viewCtx);
      return {
        title: "Transaction",
        summary,
        discovery: prepared.discovery,
        chainId: prepared.resolvedChainId ?? input.chainId,
        spec: buildPlaceholderSpec(summary, discoveryWarnings),
        warnings: discoveryWarnings.length > 0 ? discoveryWarnings : undefined,
      };
    }

    resetElementIds();
    const fieldEntries = createFieldElements(buildTxHashFields(viewCtx));
    const sections = [{ title: "Transaction", childIds: fieldEntries.map((field) => field.id) }];
    const summary = buildTxHashSummary(viewCtx);

    const shell = buildCardShell(
      {
        title: "Transaction",
        description: summary,
        warnings: discoveryWarnings.map((w) => ({
          severity: w.severity,
          message: w.message,
          code: w.code,
        })),
        sections,
      },
      { resetIds: false },
    );

    const elements = shell.spec.elements as Record<string, ViewElement>;
    for (const entry of fieldEntries) {
      elements[entry.id] = entry.element;
    }

    const chainId =
      prepared.tx.chainId ??
      prepared.onchain?.chainId ??
      prepared.resolvedChainId ??
      input.chainId;

    return {
      title: "Transaction",
      summary,
      spec: shell.spec as unknown as TxHashViewResult["spec"],
      warnings: discoveryWarnings.length > 0 ? discoveryWarnings : undefined,
      discovery: prepared.discovery,
      chainId,
    };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Tenderly lookup failed";
    const warnings: WarningItem[] = [
      { code: "apiError", severity: "warning", message: `Tenderly: ${message}` },
    ];
    return {
      title: "Transaction",
      summary: "Transaction hash lookup failed",
      spec: buildPlaceholderSpec("Transaction hash lookup failed", warnings),
      warnings,
    };
  }
}
