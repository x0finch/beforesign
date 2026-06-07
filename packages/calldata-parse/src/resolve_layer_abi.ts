import type { Abi, Hex } from "viem";
import { multicallKnownAbi } from "./known_abis/multicall.ts";
import { safeKnownAbi } from "./known_abis/safe.ts";
import type { ParseCalldataOptions, ParseSession, ResolveAbiContext } from "./types.ts";
import {
  MULTICALL_AGGREGATE3_SELECTOR,
  MULTICALL_AGGREGATE_SELECTOR,
  MULTICALL_TRY_AGGREGATE_SELECTOR,
  SAFE_EXEC_TRANSACTION_SELECTOR,
  SAFE_MULTI_SEND_SELECTOR,
} from "./utils/selectors.ts";

const KNOWN_WRAPPER_ABIS: Array<{ selectors: readonly Hex[]; abi: Abi }> = [
  {
    selectors: [SAFE_EXEC_TRANSACTION_SELECTOR, SAFE_MULTI_SEND_SELECTOR],
    abi: safeKnownAbi,
  },
  {
    selectors: [
      MULTICALL_AGGREGATE_SELECTOR,
      MULTICALL_AGGREGATE3_SELECTOR,
      MULTICALL_TRY_AGGREGATE_SELECTOR,
    ],
    abi: multicallKnownAbi,
  },
];

export function knownWrapperAbi(selector: Hex): Abi | undefined {
  for (const entry of KNOWN_WRAPPER_ABIS) {
    if (entry.selectors.includes(selector)) return entry.abi;
  }
  return undefined;
}

function cacheKey(target: string): string {
  return target.toLowerCase();
}

export async function resolveLayerAbi(ctx: {
  selector: Hex;
  target?: string;
  depth: number;
  opts: ParseCalldataOptions;
  session: ParseSession;
}): Promise<Abi | undefined> {
  const known = knownWrapperAbi(ctx.selector);
  if (known) return known;

  if (ctx.depth === 0 && ctx.opts.abi) return ctx.opts.abi;

  if (ctx.opts.resolveAbi) {
    const key = ctx.target ? cacheKey(ctx.target) : undefined;
    if (key && ctx.session.abiCache.has(key)) {
      return ctx.session.abiCache.get(key);
    }

    const resolveCtx: ResolveAbiContext = {
      selector: ctx.selector,
      target: ctx.target as ResolveAbiContext["target"],
      depth: ctx.depth,
    };
    const abi = await ctx.opts.resolveAbi(resolveCtx);
    if (key) {
      ctx.session.abiCache.set(key, abi);
    }
    return abi;
  }

  return undefined;
}
