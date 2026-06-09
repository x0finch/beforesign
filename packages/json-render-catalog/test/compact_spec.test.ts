import { describe, expect, it } from "vitest";
import { createElement, omitNullishProps } from "../src/index.ts";

describe("omitNullishProps", () => {
  it("removes null and undefined keys", () => {
    expect(
      omitNullishProps({
        label: "value",
        value: "0",
        displayValue: null,
        href: undefined,
        highlight: true,
        mono: false,
      }),
    ).toEqual({
      label: "value",
      value: "0",
      highlight: true,
      mono: false,
    });
  });

  it("strips null from AlertList items", () => {
    expect(
      omitNullishProps({
        items: [{ severity: "warning", message: "Check", code: null }],
      }),
    ).toEqual({
      items: [{ severity: "warning", message: "Check" }],
    });
  });

  it("preserves false and zero", () => {
    expect(
      omitNullishProps({
        highlight: false,
        defaultExpanded: false,
        count: 0,
        note: "",
      }),
    ).toEqual({
      highlight: false,
      defaultExpanded: false,
      count: 0,
      note: "",
    });
  });
});

describe("createElement", () => {
  it("stores compact props without null keys", () => {
    const { element } = createElement("Field", {
      label: "to",
      value: "0xabc",
      kind: "address",
      highlight: true,
      href: null,
      badge: null,
      mono: true,
      clamp: false,
    });

    expect(element.props).toEqual({
      label: "to",
      value: "0xabc",
      kind: "address",
      highlight: true,
      mono: true,
      clamp: false,
    });
    expect(JSON.stringify({ props: element.props })).not.toContain("null");
  });
});
