import { describe, expect, it } from "vitest";
import { validateSpec } from "../src/index.ts";
import {
  buildSpec,
  createElement,
  resetElementIds,
} from "../src/spec_helpers.ts";
import { catalog } from "../src/catalog.ts";
import { sampleCalldataSpec } from "./fixtures/sample_calldata_spec.ts";

describe("spec_helpers", () => {
  it("builds stable root + elements structure", () => {
    resetElementIds();
    const card = createElement("Card", {
      title: "Title",
    });
    const spec = buildSpec(card.id, { [card.id]: card.element });

    expect(spec.root).toBe(card.id);
    expect(spec.elements[card.id]?.type).toBe("Card");
    expect(spec.elements[card.id]?.visible).toBe(true);
    expect(spec.elements[card.id]?.props).toEqual({ title: "Title" });
  });

  it("passes validateSpec for a minimal spec", () => {
    resetElementIds();
    const card = createElement("Card", {
      title: "Title",
    });
    const spec = buildSpec(card.id, { [card.id]: card.element });
    expect(validateSpec(spec).valid).toBe(true);
  });

  it("passes catalog.validate for sample calldata spec", () => {
    const result = catalog.validate(sampleCalldataSpec);
    expect(result.success).toBe(true);
  });

  it("passes validateSpec for sample calldata spec", () => {
    expect(validateSpec(sampleCalldataSpec).valid).toBe(true);
  });
});
