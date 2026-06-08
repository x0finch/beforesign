import type { Spec } from "@json-render/core";
import {
  appendElements,
  buildSpec,
  createElement,
  resetElementIds,
} from "../../src/spec_helpers.ts";

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

export function buildSampleCalldataSpec(): Spec {
  resetElementIds();

  const elements: Record<
    string,
    ReturnType<typeof createElement>["element"]
  > = {};

  const card = createElement("Card", {
    title: "ERC-20 transfer",
    description: "Call transfer(address,uint256)",
    badge: "generic",
  });

  const stack = createElement("Stack", { gap: "md" });
  const alerts = createElement("AlertList", {
    items: [
      {
        severity: "warning",
        message: "Verify recipient address before signing",
        code: "verifyRecipient",
      },
    ],
  });
  const section = createElement("Section", {
    title: "Calldata",
    description: null,
  });

  const callRoot = createElement("Accordion", {
    title: "transfer · 0xa9059cbb",
    description: "transfer(address,uint256)",
    defaultExpanded: true,
  });
  const fieldSelector = createElement("Field", {
    label: "Selector",
    value: "0xa9059cbb",
    ...nullFieldExtras,
    kind: "selector",
    mono: true,
    clamp: false,
  });
  const fieldRecipient = createElement("Field", {
    label: "recipient",
    value: "0x0000000000000000000000000000000000000001",
    displayValue: "0x0000…0001",
    kind: "address",
    highlight: null,
    href: null,
    badge: null,
    badgeVariant: null,
    risk: null,
    mono: true,
    clamp: false,
  });
  const fieldAmount = createElement("Field", {
    label: "amount",
    value: "1000000",
    displayValue: "1 USDC",
    kind: "amount",
    highlight: null,
    href: null,
    badge: null,
    badgeVariant: null,
    risk: null,
    mono: false,
    clamp: false,
  });

  const callChild = createElement("Accordion", {
    title: "transfer · inner",
    description: "Inner transfer",
    defaultExpanded: false,
  });
  const fieldInnerAmount = createElement("Field", {
    label: "amount",
    value: "500000",
    displayValue: "0.5 USDC",
    kind: "amount",
    highlight: null,
    href: null,
    badge: null,
    badgeVariant: null,
    risk: null,
    mono: false,
    clamp: false,
  });

  card.element.children = [stack.id];
  stack.element.children = [alerts.id, section.id];
  section.element.children = [callRoot.id];
  callRoot.element.children = [
    fieldSelector.id,
    fieldRecipient.id,
    fieldAmount.id,
    callChild.id,
  ];
  callChild.element.children = [fieldInnerAmount.id];

  appendElements(elements, [
    card,
    stack,
    alerts,
    section,
    callRoot,
    fieldSelector,
    fieldRecipient,
    fieldAmount,
    callChild,
    fieldInnerAmount,
  ]);

  return buildSpec(card.id, elements);
}

export const sampleCalldataSpec = buildSampleCalldataSpec();
