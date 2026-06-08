import {
  appendElements,
  buildCardShell,
  createFieldElements,
  resetElementIds,
  type ViewElement,
} from "@beforesign/json-render-catalog";
import { buildCalldataSection } from "@beforesign/view-calldata";
import type { TxViewInput, TxViewResult } from "./types.ts";
import { buildTxFields } from "./build_fields.ts";

function buildSummary(kind: TxViewInput["kind"]): string {
  if (kind === "signedTx") {
    return "Signed transaction: verify chain, counterparties, and calldata";
  }
  return "Unsigned transaction: verify chain, counterparties, and calldata before signing";
}

export function buildTxSpec(input: TxViewInput): TxViewResult {
  resetElementIds();

  const fieldEntries = createFieldElements(
    buildTxFields(input.normalized, {
      kind: input.kind,
      abi: input.abi,
      tx: input.tx,
      decodedMethod: input.decodedMethod,
      onchain: input.onchain,
      indexed: input.indexed,
    }),
  );

  const sections = [{ title: "Transaction", childIds: fieldEntries.map((field) => field.id) }];
  const allEntries: Array<{ id: string; element: ViewElement }> = [...fieldEntries];
  let warnings = undefined as TxViewResult["warnings"];

  if (input.calldataTree) {
    const calldata = buildCalldataSection({
      tree: input.calldataTree,
      contractAddress: input.contractAddress,
    });
    sections.push({ title: "Calldata", childIds: calldata.childIds });
    allEntries.push(...calldata.entries);
    if (calldata.warnings.length > 0) {
      warnings = calldata.warnings
        .filter((item) => item.code !== null)
        .map((item) => ({
          code: item.code!,
          severity: item.severity,
          message: item.message,
        }));
    }
  }

  const shell = buildCardShell(
    {
      title: "Transaction",
      description: buildSummary(input.kind),
      warnings: warnings?.map((w) => ({
        severity: w.severity,
        message: w.message,
        code: w.code,
      })),
      sections,
    },
    { resetIds: false },
  );

  appendElements(shell.spec.elements as Record<string, ViewElement>, allEntries);

  return {
    title: "Transaction",
    summary: buildSummary(input.kind),
    spec: shell.spec as unknown as TxViewResult["spec"],
    warnings,
  };
}

export { buildTxFields } from "./build_fields.ts";
