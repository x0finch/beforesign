import { buildFieldDescriptor } from "./format_field.ts";
import type { ViewFieldDescriptor } from "./field_descriptor.ts";
import type { TypedDataContext } from "./profiles/context.ts";
import { hintForField } from "./token_hints.ts";

const NESTED_EXPAND_FIELDS = new Set([
  "offer",
  "consideration",
  "counter",
  "zone",
  "details",
]);

type FlattenOpts = {
  ctx: TypedDataContext;
  maxDepth?: number;
};

export function flattenMessageValue(
  prefix: string,
  value: unknown,
  opts: FlattenOpts,
  depth = 0,
): ViewFieldDescriptor[] {
  const maxDepth = opts.maxDepth ?? 2;
  if (depth >= maxDepth) return [];
  if (value === null || value === undefined) return [];

  if (Array.isArray(value)) {
    const fields: ViewFieldDescriptor[] = [];
    for (let i = 0; i < value.length; i++) {
      fields.push(...flattenMessageValue(`${prefix}.${i}`, value[i], opts, depth + 1));
    }
    return fields;
  }

  if (typeof value === "object") {
    const fields: ViewFieldDescriptor[] = [];
    for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
      const childId = `${prefix}.${key}`;
      if (
        typeof child === "object" &&
        child !== null &&
        !Array.isArray(child) &&
        depth + 1 < maxDepth
      ) {
        fields.push(...flattenMessageValue(childId, child, opts, depth + 1));
      } else if (Array.isArray(child) && depth + 1 < maxDepth) {
        fields.push(...flattenMessageValue(childId, child, opts, depth + 1));
      } else {
        fields.push(
          buildFieldDescriptor({
            id: childId,
            group: "message",
            fieldName: key,
            fieldType: inferSimpleType(child),
            rawValue: child,
            tokenHint: hintForField(opts.ctx, key, child),
            pathLabel: formatPathLabel(childId),
          }),
        );
      }
    }
    return fields;
  }

  const fieldName = prefix.split(".").pop() ?? prefix;
  return [
    buildFieldDescriptor({
      id: prefix,
      group: "message",
      fieldName,
      fieldType: inferSimpleType(value),
      rawValue: value,
      tokenHint: hintForField(opts.ctx, fieldName, value),
      pathLabel: formatPathLabel(prefix),
    }),
  ];
}

export function shouldFlattenField(fieldName: string): boolean {
  return NESTED_EXPAND_FIELDS.has(fieldName);
}

function inferSimpleType(value: unknown): string {
  if (typeof value === "boolean") return "bool";
  if (typeof value === "number" || typeof value === "bigint") return "uint256";
  if (typeof value === "string" && value.startsWith("0x") && value.length === 42) return "address";
  if (typeof value === "string" && /^\d+$/.test(value)) return "uint256";
  return "string";
}

function formatPathLabel(path: string): string {
  return path
    .replace(/^message\./, "")
    .split(".")
    .map((part) => capitalize(part))
    .join(" ");
}

function capitalize(value: string): string {
  if (!value) return value;
  return value.charAt(0).toUpperCase() + value.slice(1);
}
