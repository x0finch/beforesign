import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ReviewSection } from "../src/review_section.tsx";

const sampleChecks = [
  {
    id: "message.owner",
    group: "message",
    label: "Owner",
    value: "0xabc",
    kind: "address" as const,
  },
];

describe("ReviewSection", () => {
  it("renders a static heading for non-collapsible sections", () => {
    const { container } = render(
      <ReviewSection id="domain" title="Domain" checks={sampleChecks} />,
    );

    expect(container.querySelector('[data-group="domain"] h3')?.textContent).toBe("Domain");
    expect(screen.queryByRole("button", { name: "Domain" })).toBeNull();
    expect(screen.getByText("Owner")).toBeTruthy();
  });

  it("renders a collapsible trigger for accordion sections", () => {
    const { container } = render(
      <ReviewSection
        id="guidance"
        title="Guidance"
        checks={sampleChecks}
        showId={false}
        collapsible
        defaultOpen={false}
      />,
    );

    const guidanceSection = container.querySelector('[data-group="guidance"]');
    expect(guidanceSection?.querySelector('[data-slot="accordion-trigger"]')).toBeTruthy();
    expect(guidanceSection?.querySelector(":scope > h3")).toBeNull();
    expect(screen.getByRole("button", { name: "Guidance" })).toBeTruthy();
  });

  it("renders custom children instead of checks", () => {
    const { container } = render(
      <ReviewSection id="warnings" title="Warnings">
        <p>Custom warning content</p>
      </ReviewSection>,
    );

    const warningsSection = container.querySelector('[data-group="warnings"]');
    expect(within(warningsSection as HTMLElement).getByText("Custom warning content")).toBeTruthy();
    expect(warningsSection?.querySelector('[data-slot="review-section-list"]')).toBeNull();
  });

  it("renders empty content inside collapsible sections", () => {
    const { container } = render(
      <ReviewSection
        id="facts"
        title="Facts"
        checks={[]}
        collapsible
        defaultOpen={false}
        empty={<p>No facts available</p>}
      />,
    );

    const factsSection = container.querySelector('[data-group="facts"]');
    expect(factsSection).toBeTruthy();

    fireEvent.click(within(factsSection as HTMLElement).getByRole("button", { name: "Facts" }));

    expect(screen.getByText("No facts available")).toBeTruthy();
  });

  it("returns null when checks are empty and no empty fallback is provided", () => {
    const { container } = render(<ReviewSection id="domain" title="Domain" checks={[]} />);

    expect(container.querySelector('[data-group="domain"]')).toBeNull();
  });
});
