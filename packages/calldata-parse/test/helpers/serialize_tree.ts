import type { CalldataCall, SerializableCalldataCall } from "../../src/types.ts";
export { buildParseOptions as buildOptions } from "./build_parse_options.ts";

function serializeValue(value: unknown): unknown {
  if (typeof value === "bigint") return value.toString();
  if (Array.isArray(value)) return value.map((item) => serializeValue(item));
  if (typeof value === "object" && value !== null) {
    const record = value as Record<string, unknown>;
    const next: Record<string, unknown> = {};
    for (const [key, child] of Object.entries(record)) {
      next[key] = serializeValue(child);
    }
    return next;
  }
  return value;
}

export function serializeTree(tree: CalldataCall): SerializableCalldataCall {
  const { value, args, children, ...rest } = tree;
  return {
    ...rest,
    ...(value !== undefined ? { value: value.toString() } : {}),
    args: args.map(({ value: argValue, ...argRest }) => ({
      ...argRest,
      ...(argValue !== undefined ? { value: serializeValue(argValue) } : {}),
    })),
    children: children.map((child) => serializeTree(child)),
  };
}
