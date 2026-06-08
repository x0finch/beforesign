import type { Spec } from "@json-render/core";
import {
  appendElements,
  buildSpec,
  createElement,
  resetElementIds,
} from "../../../src/spec_helpers.ts";

export function buildComponentGallerySpec(): Spec {
  resetElementIds();

  const elements: Record<
    string,
    ReturnType<typeof createElement>["element"]
  > = {};

  const card = createElement("Card", {
    title: "Component gallery",
    description: "All catalog components in one spec",
    badge: "demo",
  });
  const stack = createElement("Stack", { gap: "md" });
  const intro = createElement("Text", {
    content: "Smoke test for registry coverage.",
    variant: "caption",
  });
  const badge = createElement("Badge", { label: "Badge", variant: "info" });
  const divider = createElement("Divider", {});
  const section = createElement("Section", {
    title: "Section",
    description: "Static grouping",
  });
  const accordion = createElement("Accordion", {
    title: "Accordion block",
    description: "Collapsible content",
    defaultExpanded: true,
  });
  const field = createElement("Field", {
    label: "Example field",
    value: "0xabc",
    displayValue: null,
    kind: "hash",
    highlight: true,
    href: null,
    badge: null,
    badgeVariant: null,
    risk: null,
  });
  const alerts = createElement("AlertList", {
    items: [{ severity: "info", message: "Info alert", code: "info" }],
  });

  card.element.children = [stack.id];
  stack.element.children = [intro.id, badge.id, divider.id, section.id, alerts.id];
  section.element.children = [accordion.id];
  accordion.element.children = [field.id];

  appendElements(elements, [
    card,
    stack,
    intro,
    badge,
    divider,
    section,
    accordion,
    field,
    alerts,
  ]);

  return buildSpec(card.id, elements);
}

export const componentGallerySpec = buildComponentGallerySpec();
