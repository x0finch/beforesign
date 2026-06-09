import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { FieldProps } from "@beforesign/json-render-catalog";
import { FieldRow } from "../src/components/field_row.tsx";

function renderField(overrides: Partial<FieldProps> = {}) {
  const props: FieldProps = {
    label: "Recipient",
    value: "0x0000000000000000000000000000000000000000",
    kind: "address",
    mono: true,
    clamp: false,
    ...overrides,
  };
  return render(<FieldRow props={props} />);
}

describe("FieldRow", () => {
  it("uses a shared label/value grid so values align across rows", () => {
    const { container } = renderField();
    const row = container.firstElementChild;
    expect(row?.className).toContain("grid");
    expect(row?.className).toContain("grid-cols-[minmax(6.5rem,30%)_minmax(0,1fr)]");
    const valueCell = container.querySelector(".whitespace-normal");
    expect(valueCell).toBeTruthy();
  });

  it("applies mono and clamp classes from props", () => {
    const { container } = renderField({
      mono: true,
      clamp: true,
      value: "0x" + "ab".repeat(200),
    });
    const valueBox = container.querySelector(".whitespace-normal > div");
    expect(valueBox?.className).toContain("font-mono");
    expect(valueBox?.className).toContain("overflow-y-auto");
    expect(valueBox?.className).toContain("max-h-32");
  });

  it("does not apply mono when prop is false", () => {
    const { container } = renderField({ mono: false, kind: "amount", value: "1" });
    const valueBox = container.querySelector(".whitespace-normal > div");
    expect(valueBox?.className).not.toContain("font-mono");
  });

  it("renders display value", () => {
    renderField({ displayValue: "0x0000…0000" });
    expect(screen.getByText("0x0000…0000")).toBeTruthy();
  });

  it("uses plain layout when href and badge are omitted", () => {
    const { container } = renderField();
    const valueBox = container.querySelector(".whitespace-normal > div");
    expect(valueBox?.className).toContain("break-all");
    expect(container.querySelector(".flex.flex-wrap")).toBeNull();
  });

  it("adds horizontal padding on highlighted rows", () => {
    const { container } = renderField({ highlight: true });
    expect(container.firstElementChild?.className).toContain("px-3");
  });
});
