import type { Spec } from "@json-render/core";

export type ViewElement = {
  type: string;
  props: Record<string, unknown>;
  children: string[];
  visible: null;
};

export type ViewSpecInput = {
  root: string;
  elements: Record<string, ViewElement>;
};

let idCounter = 0;

export function resetElementIds(): void {
  idCounter = 0;
}

export function createElementId(prefix: string): string {
  idCounter += 1;
  return `${prefix}-${idCounter}`;
}

export function createElement(
  type: string,
  props: Record<string, unknown>,
  children: string[] = [],
): { id: string; element: ViewElement } {
  const id = createElementId(type.toLowerCase());
  return {
    id,
    element: {
      type,
      props,
      children,
      visible: null,
    },
  };
}

export function buildSpec(rootId: string, elements: Record<string, ViewElement>): Spec {
  return {
    root: rootId,
    elements,
  } as unknown as Spec;
}

export function appendElements(
  target: Record<string, ViewElement>,
  entries: Array<{ id: string; element: ViewElement }>,
): void {
  for (const entry of entries) {
    target[entry.id] = entry.element;
  }
}
