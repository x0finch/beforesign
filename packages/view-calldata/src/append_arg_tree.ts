import type {
  CalldataArg,
  CalldataArgComponent,
  CalldataCall,
} from "@beforesign/calldata-parse";
import { buildArgChildLinks } from "@beforesign/calldata-parse";
import { createElement, type ViewElement } from "@beforesign/json-render-catalog";
import type { ViewCallNode, ViewFieldDescriptor } from "./field_descriptor.ts";
import { formatArgValue, idPrefix } from "./field_descriptor.ts";
import { fieldPresentation, kindForArgType } from "./format_field.ts";

export type SpecEntry = { id: string; element: ViewElement };

export type AppendCallNodeFn = (node: ViewCallNode) => { id: string };

function fieldProps(field: ViewFieldDescriptor): Record<string, unknown> {
  return {
    label: field.label,
    value: field.value,
    displayValue: field.displayValue,
    kind: field.kind,
    highlight: field.highlight,
    href: null,
    badge: null,
    badgeVariant: null,
    risk: field.risk,
    ...fieldPresentation(field.kind),
  };
}

function inlineFieldProps(
  label: string,
  value: string,
  kind: ReturnType<typeof kindForArgType>,
): Record<string, unknown> {
  return {
    label,
    value,
    displayValue: null,
    kind,
    highlight: null,
    href: null,
    badge: null,
    badgeVariant: null,
    risk: null,
    ...fieldPresentation(kind),
  };
}

function appendFieldDescriptor(field: ViewFieldDescriptor, entries: SpecEntry[]): string {
  const fieldEl = createElement("Field", fieldProps(field));
  entries.push(fieldEl);
  return fieldEl.id;
}

function appendInlineField(
  label: string,
  value: string,
  kind: ReturnType<typeof kindForArgType>,
  entries: SpecEntry[],
): string {
  const fieldEl = createElement("Field", inlineFieldProps(label, value, kind));
  entries.push(fieldEl);
  return fieldEl.id;
}

function isTupleArrayType(type: string): boolean {
  return type.includes("tuple") && type.endsWith("[]");
}

function findChildNode(parent: ViewCallNode, call: CalldataCall): ViewCallNode | undefined {
  return parent.children.find((child) => child.call === call);
}

function appendLinkedChild(
  parent: ViewCallNode,
  child: CalldataCall,
  appendCallNode: AppendCallNodeFn,
): string | undefined {
  const childNode = findChildNode(parent, child);
  if (!childNode) return undefined;
  return appendCallNode(childNode).id;
}

function appendMultiSendChildren(
  parent: ViewCallNode,
  argPath: string,
  childIds: string[],
  appendCallNode: AppendCallNodeFn,
): void {
  const multiSendChildren = parent.call.children
    .filter(
      (child) =>
        child.wrapper?.kind === "safe.multiSend" && child.wrapper.sourcePath === argPath,
    )
    .sort((left, right) => (left.wrapper?.index ?? 0) - (right.wrapper?.index ?? 0));

  for (const child of multiSendChildren) {
    const childId = appendLinkedChild(parent, child, appendCallNode);
    if (childId) childIds.push(childId);
  }
}

function appendObjectFields(
  parent: ViewCallNode,
  components: CalldataArgComponent[] | undefined,
  value: Record<string, unknown>,
  path: string,
  links: Map<string, CalldataCall>,
  appendCallNode: AppendCallNodeFn,
  entries: SpecEntry[],
): string[] {
  if (!components) return [];

  const childIds: string[] = [];
  for (let index = 0; index < components.length; index += 1) {
    const component = components[index]!;
    const fieldPath = `${path}/${index}`;
    const fieldValue = value[component.name];
    childIds.push(
      appendInlineField(
        component.name,
        formatArgValue(fieldValue),
        kindForArgType(component.type),
        entries,
      ),
    );

    const linked = links.get(fieldPath);
    if (linked) {
      const childId = appendLinkedChild(parent, linked, appendCallNode);
      if (childId) childIds.push(childId);
    }
  }

  return childIds;
}

function appendTupleArray(
  parent: ViewCallNode,
  arg: CalldataArg,
  path: string,
  links: Map<string, CalldataCall>,
  appendCallNode: AppendCallNodeFn,
  entries: SpecEntry[],
): string[] {
  const items = Array.isArray(arg.value) ? arg.value : [];
  const childIds: string[] = [];

  for (let index = 0; index < items.length; index += 1) {
    const item = items[index];
    const itemPath = `${path}/${index}`;

    if (item && typeof item === "object" && !Array.isArray(item)) {
      childIds.push(
        ...appendObjectFields(
          parent,
          arg.components,
          item as Record<string, unknown>,
          itemPath,
          links,
          appendCallNode,
          entries,
        ),
      );
      continue;
    }

    childIds.push(
      appendInlineField(
        `[${index}]`,
        formatArgValue(item),
        kindForArgType(arg.type),
        entries,
      ),
    );
  }

  return childIds;
}

function appendArgNode(
  parent: ViewCallNode,
  arg: CalldataArg,
  argIndex: number,
  links: Map<string, CalldataCall>,
  appendCallNode: AppendCallNodeFn,
  entries: SpecEntry[],
): string[] {
  const path = String(argIndex);
  const childIds: string[] = [];
  const fieldsById = new Map(parent.fields.map((field) => [field.id, field]));
  const fieldId = `${idPrefix(parent.path)}.args.${arg.name || "arg"}`;

  if (isTupleArrayType(arg.type)) {
    childIds.push(...appendTupleArray(parent, arg, path, links, appendCallNode, entries));
    return childIds;
  }

  const descriptor = fieldsById.get(fieldId);
  if (descriptor) {
    childIds.push(appendFieldDescriptor(descriptor, entries));
  } else {
    childIds.push(
      appendInlineField(
        arg.name || "arg",
        formatArgValue(arg.value) || arg.displayValue,
        kindForArgType(arg.type),
        entries,
      ),
    );
  }

  const hasMultiSendEntries = parent.call.children.some(
    (child) => child.wrapper?.kind === "safe.multiSend" && child.wrapper.sourcePath === path,
  );

  if (hasMultiSendEntries) {
    appendMultiSendChildren(parent, path, childIds, appendCallNode);
  } else {
    const linked = links.get(path);
    if (linked) {
      const childId = appendLinkedChild(parent, linked, appendCallNode);
      if (childId) childIds.push(childId);
    }
  }

  if (Array.isArray(arg.value) && !isTupleArrayType(arg.type)) {
    for (let index = 0; index < arg.value.length; index += 1) {
      const itemPath = `${path}/${index}`;
      const item = arg.value[index];
      childIds.push(
        appendInlineField(
          `[${index}]`,
          formatArgValue(item),
          kindForArgType(arg.type),
          entries,
        ),
      );

      const itemLinked = links.get(itemPath);
      if (itemLinked) {
        const childId = appendLinkedChild(parent, itemLinked, appendCallNode);
        if (childId) childIds.push(childId);
      }
    }
  }

  return childIds;
}

export function appendArgTree(
  node: ViewCallNode,
  appendCallNode: AppendCallNodeFn,
  entries: SpecEntry[],
): string[] {
  const links = buildArgChildLinks(node.call);
  const childIds: string[] = [];

  for (let index = 0; index < node.call.args.length; index += 1) {
    const arg = node.call.args[index];
    if (!arg) continue;
    childIds.push(...appendArgNode(node, arg, index, links, appendCallNode, entries));
  }

  return childIds;
}
