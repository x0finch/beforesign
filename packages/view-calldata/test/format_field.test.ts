import { describe, expect, it } from "vitest";
import { fieldPresentation } from "../src/format_field.ts";

describe("fieldPresentation", () => {
  it("sets mono for address and selector", () => {
    expect(fieldPresentation("address")).toEqual({ mono: true, clamp: false });
    expect(fieldPresentation("selector")).toEqual({ mono: true, clamp: false });
  });

  it("sets mono and clamp for hash", () => {
    expect(fieldPresentation("hash")).toEqual({ mono: true, clamp: true });
  });

  it("defaults to no mono or clamp", () => {
    expect(fieldPresentation("amount")).toEqual({ mono: false, clamp: false });
    expect(fieldPresentation(null)).toEqual({ mono: false, clamp: false });
  });
});
