import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ReviewDocumentView, groupChecksBySection } from "../src/index.ts";
import { usdcPermitOutput } from "./fixtures/usdc_permit_output.ts";

describe("groupChecksBySection", () => {
  it("groups checks by section", () => {
    const grouped = groupChecksBySection(usdcPermitOutput.checks);
    expect(grouped.sections.map((s) => s.id)).toEqual(["domain", "message"]);
  });
});

describe("ReviewDocumentView", () => {
  it("renders title, badges, check rows, inline descriptions, and warnings", () => {
    render(<ReviewDocumentView document={usdcPermitOutput} />);

    expect(screen.getByText("EIP-712 Typed Data Signature")).toBeTruthy();
    expect(document.querySelector('[data-slot="badge"]')?.textContent).toBe("tokenPermit");
    expect(screen.getByText(usdcPermitOutput.summary)).toBeTruthy();
    expect(screen.getByText("Message")).toBeTruthy();
    expect(screen.getByText("Owner")).toBeTruthy();
    expect(screen.getByText("9,420,522.466979 USDC")).toBeTruthy();
    expect(screen.queryByText("Guidance")).toBeNull();
    expect(document.querySelector('[data-check-id="message.owner"]')).toBeTruthy();
    expect(
      screen.getByText("Owner must be an address you control (not spender or relayer)"),
    ).toBeTruthy();
    expect(screen.getByText("longDeadline")).toBeTruthy();
    const highlightedRow = document.querySelector('[data-highlight="true"]');
    expect(highlightedRow).toBeTruthy();
    expect(highlightedRow?.className).toContain("bg-blue-100");
    expect(screen.getByText("Facts")).toBeTruthy();

    const nestedCards = document.querySelectorAll(
      '[data-slot="card-panel"] [data-slot="card"]',
    );
    expect(nestedCards.length).toBe(0);
  });

  it("hides Facts section when document has no external facts", () => {
    render(
      <ReviewDocumentView
        document={{
          ...usdcPermitOutput,
          facts: {},
        }}
      />,
    );

    expect(screen.queryByText("Facts")).toBeNull();
  });

  it("renders parsed fact rows instead of raw JSON", () => {
    const { container } = render(
      <ReviewDocumentView
        document={{
          ...usdcPermitOutput,
          facts: {
            primaryType: "Permit",
            scenarioId: "tokenPermit",
            hasCalldata: true,
            missingFields: ["nonce", "deadline"],
          },
        }}
      />,
    );

    const factsSection = container.querySelector('[data-group="facts"]');
    expect(factsSection).toBeTruthy();

    fireEvent.click(within(factsSection as HTMLElement).getByRole("button", { name: "Facts" }));

    const primaryTypeRow = container.querySelector('[data-check-id="facts.primaryType"]');
    const hasCalldataRow = container.querySelector('[data-check-id="facts.hasCalldata"]');
    const missingFieldsRow = container.querySelector('[data-check-id="facts.missingFields"]');
    const scenarioRow = container.querySelector('[data-check-id="facts.scenarioId"]');

    expect(primaryTypeRow).toBeTruthy();
    expect(primaryTypeRow?.textContent).not.toContain("facts.primaryType");
    expect(primaryTypeRow?.textContent).toContain("Primary type");
    expect(primaryTypeRow?.textContent).toContain("Permit");
    expect(scenarioRow?.textContent).toContain("Scenario");
    expect(scenarioRow?.textContent).toContain("tokenPermit");
    expect(hasCalldataRow?.textContent).toContain("Has calldata");
    expect(hasCalldataRow?.textContent).toContain("Yes");
    expect(missingFieldsRow?.textContent).toContain("Missing fields");
    expect(missingFieldsRow?.textContent).toContain("nonce, deadline");
    expect(container.textContent).not.toContain('"primaryType"');
  });
});
