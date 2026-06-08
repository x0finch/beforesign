import type { AlertItem } from "@beforesign/json-render-catalog";
import {
  appendElements,
  createElement,
  type ViewElement,
} from "@beforesign/json-render-catalog";
import { appendArgTree } from "./append_arg_tree.ts";
import type { ViewCallNode } from "./field_descriptor.ts";
import { fieldPresentation } from "./format_field.ts";
import type { CalldataViewContext } from "./profiles/context.ts";
import { defaultRegistry } from "./profiles/profile_registry.ts";

function accordionTitle(node: ViewCallNode): string {
  const fn = node.call.functionName ?? "call";
  return `${fn} · ${node.call.selector}`;
}

function accordionDescription(node: ViewCallNode): string | null {
  return node.call.signature ?? node.call.signatureWithNames ?? null;
}

function appendCallNode(
  node: ViewCallNode,
  entries: Array<{ id: string; element: ViewElement }>,
): { id: string; element: ViewElement } {
  const accordion = createElement("Accordion", {
    title: accordionTitle(node),
    description: accordionDescription(node),
    defaultExpanded: node.call.depth === 0,
  });
  const appendCallNodeFn = (child: ViewCallNode) => appendCallNode(child, entries);
  accordion.element.children = appendArgTree(node, appendCallNodeFn, entries);
  entries.push(accordion);
  return accordion;
}

export type CalldataSectionInput = {
  tree: CalldataViewContext["tree"];
  contractAddress?: string;
};

export type CalldataSectionResult = {
  sectionId: string;
  childIds: string[];
  entries: Array<{ id: string; element: ViewElement }>;
  warnings: AlertItem[];
};

export function buildCalldataSection(input: CalldataSectionInput): CalldataSectionResult {
  const ctx: CalldataViewContext = {
    tree: input.tree,
    contractAddress: input.contractAddress,
  };
  const profile = defaultRegistry.resolve(ctx);
  const enriched = profile.enrich(ctx);
  const entries: Array<{ id: string; element: ViewElement }> = [];
  const sectionChildren: string[] = [];

  if (ctx.contractAddress) {
    const contractField = createElement("Field", {
      label: "Contract",
      value: ctx.contractAddress,
      displayValue: null,
      kind: "address",
      highlight: true,
      href: null,
      badge: null,
      badgeVariant: null,
      risk: null,
      ...fieldPresentation("address"),
    });
    sectionChildren.push(contractField.id);
    entries.push(contractField);
  }

  const rootAccordion = appendCallNode(enriched.root, entries);
  sectionChildren.push(rootAccordion.id);

  const section = createElement("Section", {
    title: "Calldata",
    description: null,
  });
  section.element.children = sectionChildren;
  entries.push(section);

  return {
    sectionId: section.id,
    childIds: sectionChildren,
    entries,
    warnings: enriched.warnings,
  };
}

export function mergeViewEntries(
  target: Record<string, ViewElement>,
  entries: Array<{ id: string; element: ViewElement }>,
): void {
  appendElements(target, entries);
}
