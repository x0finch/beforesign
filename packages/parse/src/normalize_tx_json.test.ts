import { describe, expect, it } from "vitest";
import { METAMASK_UNSIGNED_JSON } from "@beforesign/test-fixtures";
import { normalizeTxJson } from "./normalize_tx_json.ts";

describe("normalizeTxJson", () => {
  it("normalizes metamask json", () => {
    const { tx, missingFields } = normalizeTxJson(METAMASK_UNSIGNED_JSON);
    expect(tx.from?.toLowerCase()).toContain("d8da6b");
    expect(tx.chainId).toBe(1);
    expect(missingFields).not.toContain("chainId");
  });
});
