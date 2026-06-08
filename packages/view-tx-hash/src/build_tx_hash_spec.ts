import {
  appendElements,
  buildCardShell,
  createFieldElements,
  resetElementIds,
  type ViewElement,
} from "@beforesign/json-render-catalog";
import { buildCalldataSection } from "@beforesign/view-calldata";
import { buildTxHashFields, buildTxHashSummary } from "./build_fields.ts";
import type { TxHashViewInput, TxHashViewResult } from "./types.ts";

export function buildTxHashSpec(input: TxHashViewInput): TxHashViewResult {
  resetElementIds();

  const fieldEntries = createFieldElements(buildTxHashFields(input));
  const sections = [{ title: "Transaction", childIds: fieldEntries.map((field) => field.id) }];
  const allEntries: Array<{ id: string; element: ViewElement }> = [...fieldEntries];
  let warnings = undefined as TxHashViewResult["warnings"];

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

  const summary = buildTxHashSummary(input);
  const shell = buildCardShell(
    {
      title: "Transaction",
      description: summary,
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
    summary,
    spec: shell.spec as unknown as TxHashViewResult["spec"],
    warnings,
  };
}
