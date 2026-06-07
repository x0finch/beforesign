import type { ParseCalldataOptions } from "@beforesign/calldata-parse";
import { buildParseOptions } from "./build_parse_options.ts";
import { buildResolveAbiFromSelectorMap } from "./build_resolve_abi_from_selector_map.ts";
import { DEMO_SELECTOR_ABI_MAP } from "./selector_abi_map.ts";
import type { DemoParseCase } from "./types.ts";

export function buildDemoParseOptions(fixture: DemoParseCase): ParseCalldataOptions {
  const base = buildParseOptions(fixture);
  const fromSelector = buildResolveAbiFromSelectorMap(DEMO_SELECTOR_ABI_MAP);

  if (!base.resolveAbi) {
    return { ...base, resolveAbi: fromSelector };
  }

  const existing = base.resolveAbi;
  return {
    ...base,
    resolveAbi: async (ctx) => (await fromSelector(ctx)) ?? (await existing(ctx)),
  };
}
