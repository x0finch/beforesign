import type { AlertItem } from "@beforesign/json-render-catalog";
import {
  appendElements,
  buildSpec,
  createElement,
  resetElementIds,
  type ViewElement,
} from "@beforesign/json-render-catalog";
import { appendArgTree } from "./append_arg_tree.ts";
import type { ViewCallNode } from "./field_descriptor.ts";
import { fieldPresentation } from "./format_field.ts";
import type { CalldataProfile } from "./profiles/calldata_profile.ts";
import type { CalldataViewContext } from "./profiles/context.ts";

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

export function treeToSpec(
  ctx: CalldataViewContext,
  profile: CalldataProfile,
  root: ViewCallNode,
  warnings: AlertItem[],
) {
  resetElementIds();

  const elements: Record<string, ViewElement> = {};
  const entries: Array<{ id: string; element: ViewElement }> = [];

  const card = createElement("Card", {
    title: profile.title(ctx),
    description: profile.summary(ctx),
    badge: profile.id,
  });
  const stack = createElement("Stack", { gap: "md" });
  const section = createElement("Section", {
    title: "Calldata",
    description: null,
  });

  const stackChildren: string[] = [];

  if (warnings.length > 0) {
    const alerts = createElement("AlertList", { items: warnings });
    stackChildren.push(alerts.id);
    entries.push(alerts);
  }

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

  const rootAccordion = appendCallNode(root, entries);
  sectionChildren.push(rootAccordion.id);

  section.element.children = sectionChildren;
  stackChildren.push(section.id);
  card.element.children = [stack.id];
  stack.element.children = stackChildren;

  entries.push(card, stack, section);
  appendElements(elements, entries);

  return buildSpec(card.id, elements);
}
