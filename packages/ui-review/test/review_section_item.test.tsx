import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { ReviewCheckItem } from "@beforesign/core";
import { ReviewSectionItem } from "../src/review_section_item.tsx";

function chainCheck(overrides: Partial<ReviewCheckItem> = {}): ReviewCheckItem {
  return {
    id: "transaction.chain",
    group: "transaction",
    label: "Chain",
    value: "1",
    displayValue: "Ethereum",
    kind: "chainId",
    href: "https://etherscan.io/tx/0xabc",
    badge: "13579024",
    badgeVariant: "success",
    ...overrides,
  };
}

describe("ReviewSectionItem", () => {
  it("renders chain name as external link with hover underline class", () => {
    render(<ReviewSectionItem check={chainCheck()} showId={false} />);

    const link = screen.getByRole("link", { name: "Ethereum" });
    expect(link.getAttribute("href")).toBe("https://etherscan.io/tx/0xabc");
    expect(link.getAttribute("target")).toBe("_blank");
    expect(link.className).toContain("hover:underline");
  });

  it("renders success badge with block number", () => {
    const { container } = render(<ReviewSectionItem check={chainCheck()} showId={false} />);

    const badge = container.querySelector('[data-slot="badge"]');
    expect(badge?.textContent).toBe("13579024");
  });

  it("renders error badge for failed transactions", () => {
    const { container } = render(
      <ReviewSectionItem
        check={chainCheck({ badgeVariant: "error", badge: "13579024" })}
        showId={false}
      />,
    );

    const badge = container.querySelector('[data-slot="badge"]');
    expect(badge?.textContent).toBe("13579024");
    expect(badge?.className).toContain("destructive");
  });

  it("renders info badge with pending text", () => {
    render(
      <ReviewSectionItem
        check={chainCheck({ badgeVariant: "info", badge: "pending" })}
        showId={false}
      />,
    );

    expect(screen.getByText("pending")).toBeTruthy();
    expect(screen.queryByText("13579024")).toBeNull();
  });

  it("renders hash values in a scrollable container", () => {
    const longHex = `0x${"ab".repeat(200)}`;
    const { container } = render(
      <ReviewSectionItem
        check={{
          id: "transaction.data",
          group: "default",
          label: "Data",
          value: longHex,
          kind: "hash",
        }}
        showId={false}
      />,
    );

    const scrollContainer = container.querySelector(".max-h-32.overflow-y-auto");
    expect(scrollContainer?.textContent).toBe(longHex);
  });
});
