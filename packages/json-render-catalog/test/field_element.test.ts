import { describe, expect, it } from "vitest";
import { validateSpec } from "@json-render/core";
import {
  appendElements,
  buildCardShell,
  createFieldElement,
  fieldPresentation,
  type ViewElement,
} from "../src/index.ts";

describe("fieldPresentation", () => {
  it("sets mono for address and hash clamp", () => {
    expect(fieldPresentation("address")).toEqual({ mono: true, clamp: false });
    expect(fieldPresentation("hash")).toEqual({ mono: true, clamp: true });
  });
});

describe("createFieldElement", () => {
  it("creates a Field with explicit presentation props", () => {
    const { element } = createFieldElement({
      label: "to",
      value: "0xabc",
      kind: "address",
      highlight: true,
    });
    expect(element.type).toBe("Field");
    expect(element.props.mono).toBe(true);
    expect(element.props.highlight).toBe(true);
  });
});

describe("buildCardShell", () => {
  it("builds a valid card spec with sections", () => {
    const field = createFieldElement({ label: "Chain", value: "1", kind: "chainId" });
    const { spec } = buildCardShell({
      title: "Transaction",
      description: "Verify fields",
      sections: [{ title: "Transaction", childIds: [field.id] }],
    });
    appendElements(spec.elements as Record<string, ViewElement>, [field]);
    expect(validateSpec(spec).valid).toBe(true);
  });
});
