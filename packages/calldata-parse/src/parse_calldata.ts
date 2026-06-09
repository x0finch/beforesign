import type { Address, Hex } from "viem";
import { slice } from "viem";
import { decodeLayer, selectorOnlyNode } from "./decode_layer.ts";
import { resolveLayerAbi } from "./resolve_layer_abi.ts";
import type {
  CalldataCall,
  ParseCalldataOptions,
  ParseSession,
  UnwrapPayload,
} from "./types.ts";
import { sortedUnwrappers } from "./unwrappers/registry.ts";

function mergeWrapperMeta(child: CalldataCall, payload: UnwrapPayload): CalldataCall {
  return {
    ...child,
    wrapper: payload.wrapper,
    target: payload.target ?? child.target,
    value: payload.value ?? child.value,
    operation: payload.operation ?? child.operation,
  };
}

function buildDecodedInputs(layer: CalldataCall): Array<{ name: string; type: string }> {
  return layer.args.map((arg) => ({ name: arg.name, type: arg.type }));
}

function isDecodedFunctionCall(node: CalldataCall): boolean {
  return node.functionName !== undefined && node.args.length > 0;
}

function shouldAttachUnwrapChild(payload: UnwrapPayload, child: CalldataCall): boolean {
  if (payload.wrapper.kind === "generic.bytes") {
    return isDecodedFunctionCall(child);
  }
  return true;
}

async function applyUnwrappers(
  layer: CalldataCall,
  opts: ParseCalldataOptions,
  depth: number,
  session: ParseSession,
): Promise<CalldataCall> {
  const unwrappers = sortedUnwrappers(opts.unwrappers);
  const matchCtx = { selector: layer.selector, functionName: layer.functionName };

  for (const unwrapper of unwrappers) {
    if (!unwrapper.match(matchCtx)) continue;

    const payloads = unwrapper.unwrap({
      selector: layer.selector,
      functionName: layer.functionName,
      args: layer.args.map((arg) => arg.value),
      decodedInputs: buildDecodedInputs(layer),
    });

    if (payloads.length === 0) continue;

    const children = (
      await Promise.all(
        payloads.map(async (payload) => {
          const child = await parseInternal(payload.data, opts, depth + 1, session, payload.target);
          return mergeWrapperMeta(child, payload);
        }),
      )
    ).filter((child, index) => shouldAttachUnwrapChild(payloads[index]!, child));

    if (children.length === 0) continue;

    layer.children = children;

    const label = layer.functionName ?? layer.selector;
    layer.summary = `${label} → ${layer.children.length} inner call(s)`;
    break;
  }

  return layer;
}

async function parseInternal(
  data: Hex,
  opts: ParseCalldataOptions,
  depth: number,
  session: ParseSession,
  target?: Address,
): Promise<CalldataCall> {
  const maxDepth = opts.maxDepth ?? 8;
  const raw = data.trim() as Hex;

  if (session.seen.has(raw)) {
    return selectorOnlyNode(raw, depth);
  }
  session.seen.add(raw);

  const selector = slice(raw, 0, 4);
  const abi = await resolveLayerAbi({
    selector,
    target,
    depth,
    opts,
    session,
  });

  let layer = decodeLayer(raw, abi, depth);
  if (target && !layer.target) {
    layer = { ...layer, target };
  }

  if (depth >= maxDepth) {
    return layer;
  }

  return applyUnwrappers(layer, opts, depth, session);
}

export async function parseCalldata(
  data: Hex,
  opts?: ParseCalldataOptions,
): Promise<CalldataCall> {
  return parseInternal(data, opts ?? {}, 0, {
    seen: new Set(),
    abiCache: new Map(),
  });
}

export function walkLeaves(tree: CalldataCall): CalldataCall[] {
  if (tree.children.length === 0) return [tree];
  return tree.children.flatMap((child) => walkLeaves(child));
}

export function findBySelector(tree: CalldataCall, selector: Hex): CalldataCall[] {
  const matches: CalldataCall[] = [];
  if (tree.selector === selector) matches.push(tree);
  for (const child of tree.children) {
    matches.push(...findBySelector(child, selector));
  }
  return matches;
}
