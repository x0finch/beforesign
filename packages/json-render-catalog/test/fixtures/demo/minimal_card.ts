import type { Spec } from "@json-render/core";
import {
  appendElements,
  buildSpec,
  createElement,
  resetElementIds,
} from "../../../src/spec_helpers.ts";

export function buildMinimalCardSpec(): Spec {
  resetElementIds();

  const elements: Record<
    string,
    ReturnType<typeof createElement>["element"]
  > = {};

  const card = createElement("Card", {
    title: "Hello",
    description: "Minimal json-render spec",
    badge: null,
  });
  const text = createElement("Text", {
    content: "A single Card with one Text child.",
    variant: "body",
  });

  card.element.children = [text.id];
  appendElements(elements, [card, text]);

  return buildSpec(card.id, elements);
}

export const minimalCardSpec = buildMinimalCardSpec();
