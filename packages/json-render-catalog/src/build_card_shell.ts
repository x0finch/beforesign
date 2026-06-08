import type { AlertItem } from "./components/alert_severity.ts";
import {
  appendElements,
  buildSpec,
  createElement,
  resetElementIds,
  type ViewElement,
} from "./spec_helpers.ts";

export type CardShellInput = {
  title: string;
  description: string;
  badge?: string | null;
  warnings?: AlertItem[];
  sections: Array<{
    title: string;
    description?: string | null;
    childIds: string[];
  }>;
};

export type CardShellResult = {
  spec: ReturnType<typeof buildSpec>;
  cardId: string;
  stackId: string;
  sectionIds: string[];
  entries: Array<{ id: string; element: ViewElement }>;
};

export function buildCardShell(
  input: CardShellInput,
  opts?: { resetIds?: boolean },
): CardShellResult {
  if (opts?.resetIds !== false) {
    resetElementIds();
  }

  const elements: Record<string, ViewElement> = {};
  const entries: Array<{ id: string; element: ViewElement }> = [];

  const card = createElement("Card", {
    title: input.title,
    description: input.description,
    badge: input.badge ?? null,
  });
  const stack = createElement("Stack", { gap: "md" });
  const stackChildren: string[] = [];

  if (input.warnings && input.warnings.length > 0) {
    const alerts = createElement("AlertList", { items: input.warnings });
    stackChildren.push(alerts.id);
    entries.push(alerts);
  }

  const sectionIds: string[] = [];
  for (const sectionInput of input.sections) {
    const section = createElement("Section", {
      title: sectionInput.title,
      description: sectionInput.description ?? null,
    });
    section.element.children = sectionInput.childIds;
    sectionIds.push(section.id);
    stackChildren.push(section.id);
    entries.push(section);
  }

  stack.element.children = stackChildren;
  card.element.children = [stack.id];
  entries.push(card, stack);
  appendElements(elements, entries);

  return {
    spec: buildSpec(card.id, elements),
    cardId: card.id,
    stackId: stack.id,
    sectionIds,
    entries,
  };
}
