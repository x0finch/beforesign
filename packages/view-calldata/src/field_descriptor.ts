import type { CalldataArg, CalldataCall } from "@beforesign/calldata-parse";
import type { FieldProps } from "@beforesign/json-render-catalog";

type FieldKind = NonNullable<FieldProps["kind"]>;
type FieldRisk = NonNullable<FieldProps["risk"]>;
import { kindForArgType } from "./format_field.ts";

export type ViewFieldDescriptor = {
  id: string;
  label: string;
  value: string;
  displayValue: string | null;
  kind: FieldKind | null;
  highlight: boolean | null;
  risk: FieldRisk | null;
};

export type ViewCallNode = {
  call: CalldataCall;
  path: string | undefined;
  fields: ViewFieldDescriptor[];
  children: ViewCallNode[];
};

export function formatArgValue(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "bigint") return value.toString();
  if (typeof value === "boolean") return String(value);
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  if (Array.isArray(value)) {
    return `[${value.map((item) => formatArgValue(item)).join(", ")}]`;
  }
  if (typeof value === "object") {
    const record = value as Record<string, unknown>;
    const parts = Object.entries(record).map(
      ([key, child]) => `${key}=${formatArgValue(child)}`,
    );
    return `(${parts.join(", ")})`;
  }
  return String(value);
}

function fieldDescriptor(
  id: string,
  label: string,
  value: string,
  opts?: Partial<Pick<ViewFieldDescriptor, "displayValue" | "kind" | "highlight" | "risk">>,
): ViewFieldDescriptor {
  return {
    id,
    label,
    value,
    displayValue: opts?.displayValue ?? null,
    kind: opts?.kind ?? null,
    highlight: opts?.highlight ?? null,
    risk: opts?.risk ?? null,
  };
}

function argToField(id: string, arg: CalldataArg): ViewFieldDescriptor {
  const rawValue = formatArgValue(arg.value);
  const displayValue = arg.displayValue !== rawValue ? arg.displayValue : null;
  return fieldDescriptor(id, arg.name || "arg", rawValue || arg.displayValue, {
    displayValue,
    kind: kindForArgType(arg.type),
  });
}

export function idPrefix(path: string | undefined): string {
  return path ? `calldata.inner.${path}` : "calldata";
}

function fieldsForNode(node: CalldataCall, path: string | undefined): ViewFieldDescriptor[] {
  const prefix = idPrefix(path);
  return node.args.map((arg) => argToField(`${prefix}.args.${arg.name || "arg"}`, arg));
}

function collectCallNode(node: CalldataCall, path: string | undefined): ViewCallNode {
  const children: ViewCallNode[] = [];

  for (let i = 0; i < node.children.length; i += 1) {
    const child = node.children[i]!;
    const childPath =
      child.wrapper?.sourcePath ?? (path !== undefined ? `${path}/${i}` : String(i));
    children.push(collectCallNode(child, childPath));
  }

  return {
    call: node,
    path,
    fields: fieldsForNode(node, path),
    children,
  };
}

export function collectCallTree(tree: CalldataCall): ViewCallNode {
  return collectCallNode(tree, undefined);
}

export function flattenFieldDescriptors(node: ViewCallNode): ViewFieldDescriptor[] {
  const fields = [...node.fields];
  for (const child of node.children) {
    fields.push(...flattenFieldDescriptors(child));
  }
  return fields;
}

export function applyFieldOverrides(
  fields: ViewFieldDescriptor[],
  overrides: Map<string, Partial<ViewFieldDescriptor>>,
): ViewFieldDescriptor[] {
  return fields.map((field) => {
    const override = overrides.get(field.id);
    return override ? { ...field, ...override } : field;
  });
}

export function applyNodeFieldOverrides(
  node: ViewCallNode,
  overrides: Map<string, Partial<ViewFieldDescriptor>>,
): ViewCallNode {
  return {
    ...node,
    fields: applyFieldOverrides(node.fields, overrides),
    children: node.children.map((child) => applyNodeFieldOverrides(child, overrides)),
  };
}
