import type { CalldataArg, CalldataArgComponent, CalldataCall } from "./types.ts";

export type ResolvedSourcePath = {
  arg: CalldataArg;
  value: unknown;
  pathSegments: number[];
};

export function parseSourcePath(sourcePath: string): number[] | undefined {
  if (!sourcePath) return undefined;
  const segments = sourcePath.split("/").map((part) => Number(part));
  if (segments.some((segment) => !Number.isInteger(segment) || segment < 0)) {
    return undefined;
  }
  return segments;
}

function walkValue(
  value: unknown,
  segment: number,
  components: CalldataArgComponent[] | undefined,
): { value: unknown; components: CalldataArgComponent[] | undefined } | undefined {
  if (Array.isArray(value)) {
    const next = value[segment];
    if (next === undefined) return undefined;
    return { value: next, components };
  }

  if (value && typeof value === "object") {
    const field = components?.[segment];
    if (!field) return undefined;
    const next = (value as Record<string, unknown>)[field.name];
    if (next === undefined) return undefined;
    return { value: next, components: field.components };
  }

  return undefined;
}

/** Walk an index sourcePath such as "0/0/2" against parent.args. */
export function resolveSourcePath(
  parent: CalldataCall,
  sourcePath: string,
): ResolvedSourcePath | undefined {
  const segments = parseSourcePath(sourcePath);
  if (!segments || segments.length === 0) return undefined;

  const arg = parent.args[segments[0] ?? -1];
  if (!arg) return undefined;

  let current: unknown = arg.value;
  let components = arg.components;

  for (let index = 1; index < segments.length; index++) {
    const walked = walkValue(current, segments[index] ?? -1, components);
    if (!walked) return undefined;
    current = walked.value;
    components = walked.components;
  }

  return { arg, value: current, pathSegments: segments };
}

/** Link key for a child under its parent arg tree. */
export function childLinkKey(sourcePath: string, wrapper?: CalldataCall["wrapper"]): string {
  if (wrapper?.kind === "safe.multiSend" && wrapper.index !== undefined) {
    return `${sourcePath}#${wrapper.index}`;
  }
  return sourcePath;
}

/** Map arg-tree path keys to parsed child nodes. */
export function buildArgChildLinks(parent: CalldataCall): Map<string, CalldataCall> {
  const links = new Map<string, CalldataCall>();
  for (const child of parent.children) {
    const sourcePath = child.wrapper?.sourcePath;
    if (!sourcePath) continue;
    links.set(childLinkKey(sourcePath, child.wrapper), child);
  }
  return links;
}

function labelFromComponents(
  components: CalldataArgComponent[] | undefined,
  segment: number,
): string | undefined {
  return components?.[segment]?.name;
}

/** Format an index path as a human-readable label, e.g. "calls[0].callData". */
export function formatSourcePathLabel(parent: CalldataCall, sourcePath: string): string {
  const segments = parseSourcePath(sourcePath);
  if (!segments || segments.length === 0) return sourcePath;

  const arg = parent.args[segments[0] ?? -1];
  if (!arg) return sourcePath;

  const parts: string[] = [arg.name || `arg${segments[0]}`];
  let components: CalldataArgComponent[] | undefined = arg.components;
  let current: unknown = arg.value;

  for (let index = 1; index < segments.length; index++) {
    const segment = segments[index] ?? -1;

    if (Array.isArray(current)) {
      parts.push(`[${segment}]`);
      current = current[segment];
      continue;
    }

    const fieldName = labelFromComponents(components, segment);
    if (fieldName) {
      parts.push(index === 1 ? `[${segment}].${fieldName}` : `.${fieldName}`);
    } else {
      parts.push(`[${segment}]`);
    }

    if (current && typeof current === "object" && !Array.isArray(current)) {
      const field = components?.[segment];
      current = field ? (current as Record<string, unknown>)[field.name] : undefined;
      components = field?.components;
    }
  }

  const [head, ...tail] = parts;
  if (!head) return sourcePath;
  return `${head}${tail.join("")}`;
}

export function normalizeHex(value: unknown): string | undefined {
  if (typeof value !== "string" || !value.startsWith("0x")) return undefined;
  return value.toLowerCase();
}
