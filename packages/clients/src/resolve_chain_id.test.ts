import { describe, expect, it } from "vitest";
import { resolve_chain_id } from "./resolve_chain_id.ts";

describe("resolve_chain_id", () => {
  it("prefers user chain id", () => {
    const id = resolve_chain_id(
      { status: "resolved", hits: [], resolved_chain_id: 1 },
      137,
    );
    expect(id).toBe(137);
  });

  it("uses single hit", () => {
    const id = resolve_chain_id({
      status: "ambiguous",
      hits: [{ id: "1-0x", chain_id: 42161, chain_name: "Arbitrum" }],
    });
    expect(id).toBe(42161);
  });
});
