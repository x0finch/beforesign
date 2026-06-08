import type { ClientsBundle } from "@beforesign/clients";
import type { WarningItem } from "@beforesign/core";
import {
  appendElements,
  buildCardShell,
  createFieldElements,
  resetElementIds,
  type ViewElement,
} from "@beforesign/json-render-catalog";
import type { TxViewInput, TxViewOptions, TxViewResult } from "./types.ts";
import { buildTxFields } from "./build_fields.ts";
import {
  buildUnsignedTxHash,
  normalizeTxFromJson,
  viemTxToNormalized,
} from "./normalize_tx.ts";
import { prepareSignedTx } from "./prepare_signed_tx.ts";
import {
  buildTxRiskWarnings,
  canSimulateDebank,
  missingFieldWarnings,
  missingFieldsForSimulate,
} from "./risk_warnings.ts";

function buildSummary(kind: TxViewInput["kind"], explanation?: string): string {
  if (explanation) return explanation;
  if (kind === "signedTx") {
    return "Signed transaction: verify chain and counterparties";
  }
  return "Unsigned transaction: verify chain and counterparties before signing";
}

function normalizeInput(input: TxViewInput) {
  const trimmed = input.raw.trim();
  if (trimmed.startsWith("{")) {
    const normalized = normalizeTxFromJson(trimmed);
    let tx = normalized.tx;
    if (input.kind === "unsignedTx" && !tx.hash) {
      tx = { ...tx, hash: buildUnsignedTxHash(tx) };
    }
    return {
      tx,
      missingFields: normalized.missingFields,
      decodedMethod: undefined as string | undefined,
    };
  }
  const tx = viemTxToNormalized(input.normalized, { serializedHex: trimmed });
  return { tx, missingFields: [] as string[], decodedMethod: undefined };
}

export async function buildTxSpec(
  input: TxViewInput,
  clients: ClientsBundle,
  opts?: TxViewOptions,
): Promise<TxViewResult> {
  const apiWarnings: WarningItem[] = [];
  let { tx, missingFields } = normalizeInput(input);
  let onchain = undefined;
  let indexed = undefined as "found" | "notFound" | undefined;
  let decodedMethod = undefined as string | undefined;
  let summaryOverride: string | undefined;

  if (input.kind === "signedTx") {
    try {
      const prepared = await prepareSignedTx(input.normalized, clients, tx);
      tx = prepared.tx;
      onchain = prepared.onchain;
      indexed = prepared.indexed;
    } catch (e) {
      apiWarnings.push({
        code: "apiError",
        severity: "warning",
        message: `Tx lookup: ${e instanceof Error ? e.message : "failed"}`,
      });
    }
  }

  if (input.kind === "unsignedTx") {
    const simulateMissing = missingFieldsForSimulate(tx);
    missingFields = [...new Set([...missingFields, ...simulateMissing])];
    if (!canSimulateDebank(tx)) {
      summaryOverride =
        "Unsigned transaction (insufficient fields to simulate)";
    } else if (opts?.debankEnabled !== false) {
      try {
        await clients.debank.preExecTx(tx);
        const explanation = await clients.debank.explainTx(tx);
        if (explanation) summaryOverride = explanation;
      } catch (e) {
        apiWarnings.push({
          code: "apiError",
          severity: "warning",
          message: `DeBank: ${e instanceof Error ? e.message : "failed"}`,
        });
      }
    }
  }

  const riskWarnings = buildTxRiskWarnings(tx, { selectedChainId: input.selectedChainId });
  const fieldWarnings = missingFieldWarnings(missingFields);
  const warnings = [...riskWarnings, ...fieldWarnings, ...apiWarnings];

  resetElementIds();
  const fieldEntries = createFieldElements(
    buildTxFields(input.normalized, {
      kind: input.kind,
      abi: input.abi,
      tx,
      decodedMethod,
      onchain,
      indexed,
    }),
  );

  const sections = [{ title: "Transaction", childIds: fieldEntries.map((field) => field.id) }];
  const summary = buildSummary(input.kind, summaryOverride);

  const shell = buildCardShell(
    {
      title: "Transaction",
      description: summary,
      warnings: warnings.map((w) => ({
        severity: w.severity,
        message: w.message,
        code: w.code,
      })),
      sections,
    },
    { resetIds: false },
  );

  appendElements(shell.spec.elements as Record<string, ViewElement>, fieldEntries);

  return {
    title: "Transaction",
    summary,
    spec: shell.spec as unknown as TxViewResult["spec"],
    warnings: warnings.length > 0 ? warnings : undefined,
    chainId: tx.chainId ?? onchain?.chainId,
  };
}

export { buildTxFields } from "./build_fields.ts";
