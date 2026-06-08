import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { DEMO_SPEC_CASES } from "@beforesign/json-render-catalog/fixtures/demo";
import { SpecRenderer } from "../src/spec_renderer.tsx";

const sampleCalldataSpec =
  DEMO_SPEC_CASES.find((item) => item.id === "calldata-transfer")?.spec ?? DEMO_SPEC_CASES[0]!.spec;

const componentGallerySpec =
  DEMO_SPEC_CASES.find((item) => item.id === "component-gallery")?.spec ?? DEMO_SPEC_CASES[0]!.spec;

function innerAccordionTrigger() {
  return screen.getByRole("button", { name: /transfer · inner/i });
}

function rootAccordionTrigger() {
  return screen.getByRole("button", { name: /transfer · 0xa9059cbb/i });
}

describe("SpecRenderer", () => {
  it("renders sampleCalldataSpec content", () => {
    render(<SpecRenderer spec={sampleCalldataSpec} />);

    expect(screen.getByText("ERC-20 transfer")).toBeTruthy();
    expect(screen.getByText("Calldata")).toBeTruthy();
    expect(screen.getByText("recipient")).toBeTruthy();
    expect(screen.getAllByText("amount").length).toBeGreaterThan(0);
  });

  it("renders Field highlight and kind rows", () => {
    render(<SpecRenderer spec={sampleCalldataSpec} />);

    expect(screen.getByText("Selector")).toBeTruthy();
    expect(screen.getByText("0xa9059cbb")).toBeTruthy();
    expect(screen.getByText("0x0000…0001")).toBeTruthy();
  });

  it("renders AlertList warning message", () => {
    render(<SpecRenderer spec={sampleCalldataSpec} />);

    expect(screen.getByText("Verify recipient address before signing")).toBeTruthy();
  });

  it("shows root Accordion content when defaultExpanded is true", () => {
    render(<SpecRenderer spec={sampleCalldataSpec} />);

    expect(rootAccordionTrigger().getAttribute("aria-expanded")).toBe("true");
    expect(screen.getByText("1 USDC")).toBeTruthy();
  });

  it("hides inner Accordion content when defaultExpanded is false", () => {
    render(<SpecRenderer spec={sampleCalldataSpec} />);

    expect(innerAccordionTrigger().getAttribute("aria-expanded")).toBe("false");
    expect(screen.queryByText("0.5 USDC")).toBeNull();
  });

  it("toggles inner Accordion visibility on trigger click", async () => {
    const user = userEvent.setup();
    render(<SpecRenderer spec={sampleCalldataSpec} />);

    expect(innerAccordionTrigger().getAttribute("aria-expanded")).toBe("false");

    await user.click(innerAccordionTrigger());

    expect(innerAccordionTrigger().getAttribute("aria-expanded")).toBe("true");
    expect(screen.getByText("0.5 USDC")).toBeTruthy();

    await user.click(innerAccordionTrigger());

    expect(innerAccordionTrigger().getAttribute("aria-expanded")).toBe("false");
    expect(screen.queryByText("0.5 USDC")).toBeNull();
  });

  it("renders component gallery without throwing", () => {
    expect(() => render(<SpecRenderer spec={componentGallerySpec} />)).not.toThrow();
    expect(screen.getByText("Component gallery")).toBeTruthy();
  });
});
