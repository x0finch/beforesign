import { describe, expect, it } from "vitest";
import {
  accordionPropsSchema,
  alertItemSchema,
  alertListPropsSchema,
  fieldPropsSchema,
} from "../src/components/core.ts";
import { catalog, componentNames } from "../src/catalog.ts";

const expectedComponents = [
  "Accordion",
  "AlertList",
  "Badge",
  "Card",
  "Divider",
  "Field",
  "Section",
  "Stack",
  "Text",
] as const;

describe("catalog", () => {
  it("registers all core components", () => {
    expect([...componentNames].sort()).toEqual([...expectedComponents].sort());
  });

  it("exposes a non-empty AI prompt", () => {
    expect(catalog.prompt().length).toBeGreaterThan(100);
  });

  it("parses compact Field props without omitted keys", () => {
    const result = fieldPropsSchema.safeParse({
      label: "Recipient",
      value: "0xabc",
      kind: "address",
      highlight: true,
      mono: true,
      clamp: false,
    });
    expect(result.success).toBe(true);
  });

  it("rejects explicit null on optional Field props", () => {
    const result = fieldPropsSchema.safeParse({
      label: "Recipient",
      value: "0xabc",
      href: null,
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid Field kind", () => {
    const result = fieldPropsSchema.safeParse({
      label: "Recipient",
      value: "0xabc",
      kind: "invalid",
    });
    expect(result.success).toBe(false);
  });

  it("parses valid AlertList props", () => {
    const result = alertListPropsSchema.safeParse({
      items: [{ severity: "warning", message: "Check spender", code: "spender" }],
    });
    expect(result.success).toBe(true);
  });

  it("rejects explicit null alert code", () => {
    const result = alertItemSchema.safeParse({
      severity: "warning",
      message: "nope",
      code: null,
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid alert severity", () => {
    const result = alertItemSchema.safeParse({
      severity: "critical",
      message: "nope",
    });
    expect(result.success).toBe(false);
  });

  it("parses valid Accordion props", () => {
    const result = accordionPropsSchema.safeParse({
      title: "transfer · 0xa9059cbb",
      description: "transfer(address,uint256)",
      defaultExpanded: true,
    });
    expect(result.success).toBe(true);
  });

  it("rejects Accordion without title", () => {
    const result = accordionPropsSchema.safeParse({
      defaultExpanded: false,
    });
    expect(result.success).toBe(false);
  });
});
