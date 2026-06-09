import type { FieldKind, FieldProps } from "./components/field_kind.ts";
import { createElement, type ViewElement } from "./spec_helpers.ts";

export type FieldDescriptorInput = {
  label: string;
  value: string;
  displayValue?: string;
  kind?: FieldKind;
  highlight?: boolean;
  href?: string;
  badge?: string;
  badgeVariant?: FieldProps["badgeVariant"];
  risk?: FieldProps["risk"];
  mono?: boolean;
  clamp?: boolean;
};

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
  const kind = descriptor.kind;
  const presentation =
    descriptor.mono !== undefined
      ? { mono: descriptor.mono, clamp: descriptor.clamp === true }
      : fieldPresentation(kind);

  const props: Record<string, unknown> = {
    label: descriptor.label,
    value: descriptor.value,
    mono: presentation.mono,
    clamp: presentation.clamp,
  };

  if (descriptor.displayValue !== undefined) props.displayValue = descriptor.displayValue;
  if (kind !== undefined) props.kind = kind;
  if (descriptor.highlight !== undefined) props.highlight = descriptor.highlight;
  if (descriptor.href !== undefined) props.href = descriptor.href;
  if (descriptor.badge !== undefined) props.badge = descriptor.badge;
  if (descriptor.badgeVariant !== undefined) props.badgeVariant = descriptor.badgeVariant;
  if (descriptor.risk !== undefined) props.risk = descriptor.risk;

  return createElement("Field", props);
}

export function createFieldElements(
  descriptors: FieldDescriptorInput[],
): Array<{ id: string; element: ViewElement }> {
  return descriptors.map((descriptor) => createFieldElement(descriptor));
}
