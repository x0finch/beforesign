import type { InputKind, ParseInput, ParseResult } from "@beforesign/core";
import { serializeParseResult } from "@beforesign/core";
import type { ClientsBundle } from "@beforesign/clients";
import { detectInputType } from "@beforesign/detect";
import { mergeWarnings } from "./merge_warnings.ts";
import {
  placeholderSummary,
  placeholderSummaryEn,
  rawForKind,
} from "./placeholder_summary.ts";
import { buildViewForKind } from "./view_registry.ts";

export type ParseInputDeps = ClientsBundle & {
  txLookupEnabled?: boolean;
  etherscanEnabled?: boolean;
  debankEnabled?: boolean;
};

function resolveKind(detected: ReturnType<typeof detectInputType>): InputKind {
  return detected.kind === "unknown" ? "unknown" : detected.kind;
}

export async function parseInput(input: ParseInput, deps: ParseInputDeps): Promise<ParseResult> {
  const detected = detectInputType(input.raw);
  const kind = resolveKind(detected);

  const result: ParseResult = {
    kind,
    summary: placeholderSummary(kind),
    summaryEn: placeholderSummaryEn(kind),
    warnings: [],
    raw: rawForKind(kind, input.raw),
  };

  const view = await buildViewForKind(detected, deps, input, {
    debankEnabled: deps.debankEnabled,
    txLookupEnabled: deps.txLookupEnabled,
  });

  if (view) {
    result.view = view;
    if (view.summary) {
      result.summary = view.summary;
      result.summaryEn = view.summaryEn ?? view.summary;
    }
    result.warnings = mergeWarnings(result.warnings, view.warnings ?? []);
  }

  return serializeParseResult(result);
}
