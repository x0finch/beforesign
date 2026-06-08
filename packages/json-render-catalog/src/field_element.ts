import type { FieldKind, FieldProps } from "./components/field_kind.ts";
import { createElement, type ViewElement } from "./spec_helpers.ts";

export type FieldDescriptorInput = {
  label: string;
  value: string;
  displayValue?: string | null;
  kind?: FieldKind | null;
  highlight?: boolean | null;
  href?: string | null;
  badge?: string | null;
  badgeVariant?: FieldProps["badgeVariant"];
  risk?: FieldProps["risk"];
  mono?: boolean | null;
  clamp?: boolean | null;
};

const nullFieldExtras = {
  displayValue: null,
  kind: null,
  highlight: null,
  href: null,
  badge: null,
  badgeVariant: null,
  risk: null,
  mono: null,
  clamp: null,
} as const;

export function fieldPresentation(kind: FieldKind | null | undefined): {
  mono: boolean;
  clamp: boolean;
} {
  switch (kind) {
    case "address":
    case "selector":
      return { mono: true, clamp: false };
    case "hash":
      return { mono: true, clamp: true };
    default:
      return { mono: false, clamp: false };
  }
}

export function createFieldElement(
  descriptor: FieldDescriptorInput,
): { id: string; element: ViewElement } {
  const kind = descriptor.kind ?? null;
  const presentation =
    descriptor.mono !== undefined && descriptor.mono !== null
      ? { mono: descriptor.mono, clamp: descriptor.clamp === true }
      : fieldPresentation(kind);

  return createElement("Field", {
    label: descriptor.label,
    value: descriptor.value,
    displayValue: descriptor.displayValue ?? null,
    kind,
    highlight: descriptor.highlight ?? null,
    href: descriptor.href ?? null,
    badge: descriptor.badge ?? null,
    badgeVariant: descriptor.badgeVariant ?? null,
    risk: descriptor.risk ?? null,
    mono: presentation.mono,
    clamp: presentation.clamp,
  });
}

export function createFieldElements(
  descriptors: FieldDescriptorInput[],
): Array<{ id: string; element: ViewElement }> {
  return descriptors.map((descriptor) => createFieldElement(descriptor));
}

export { nullFieldExtras };
