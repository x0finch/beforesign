import { describe, expect, it } from "vitest";
import { metamask_unsigned_json } from "@beforesign/test-fixtures";
import { normalize_tx_json } from "./normalize_tx_json.ts";

describe("normalize_tx_json", () => {
  it("normalizes metamask json", () => {
    const { tx, missing_fields } = normalize_tx_json(metamask_unsigned_json);
    expect(tx.from?.toLowerCase()).toContain("d8da6b");
    expect(tx.chain_id).toBe(1);
    expect(missing_fields).not.toContain("chain_id");
  });
});
