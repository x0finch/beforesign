import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { FieldProps } from "@beforesign/json-render-catalog";
import { FieldRow } from "../src/components/field_row.tsx";

function renderField(overrides: Partial<FieldProps> = {}) {
  const props: FieldProps = {
    label: "Recipient",
    value: "0x0000000000000000000000000000000000000000",
    displayValue: null,
    kind: "address",
    highlight: null,
    href: null,
    badge: null,
    badgeVariant: null,
    risk: null,
    mono: true,
    clamp: false,
    ...overrides,
  };
  return render(<FieldRow props={props} />);
}

describe("FieldRow", () => {
  it("applies whitespace-normal on value cell for wrapping", () => {
    const { container } = renderField();
    const valueCell = container.querySelector("td.whitespace-normal");
    expect(valueCell).toBeTruthy();
  });

  it("applies mono and clamp classes from props", () => {
    const { container } = renderField({
      mono: true,
      clamp: true,
      value: "0x" + "ab".repeat(200),
    });
    const valueBox = container.querySelector("td.whitespace-normal > div");
    expect(valueBox?.className).toContain("font-mono");
    expect(valueBox?.className).toContain("overflow-y-auto");
    expect(valueBox?.className).toContain("max-h-32");
  });

  it("does not apply mono when prop is false", () => {
    const { container } = renderField({ mono: false, kind: "amount", value: "1" });
    const valueBox = container.querySelector("td.whitespace-normal > div");
    expect(valueBox?.className).not.toContain("font-mono");
  });

  it("renders display value", () => {
    renderField({ displayValue: "0x0000…0000" });
    expect(screen.getByText("0x0000…0000")).toBeTruthy();
  });
});
