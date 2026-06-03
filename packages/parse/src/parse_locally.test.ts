import { describe, expect, it } from "vitest";
import { METAMASK_UNSIGNED_JSON, TYPED_DATA_JSON } from "@beforesign/test-fixtures";
import { parseLocally } from "./parse_locally.ts";
import { canSimulateDebank } from "./simulate.ts";
import { normalizeTxJson } from "./normalize_tx_json.ts";

describe("parseLocally", () => {
  it("parses typed data", () => {
    const result = parseLocally("typedData", TYPED_DATA_JSON);
    expect(result.typedData?.primaryType).toBe("Permit");
    expect(result.typedData?.signableHash).toBeTruthy();
  });

  it("parses unsigned json", () => {
    const result = parseLocally("unsignedTx", METAMASK_UNSIGNED_JSON);
    expect(result.tx?.from).toBeTruthy();
    expect(canSimulateDebank(result.tx)).toBe(true);
  });

  it("flags missing simulate fields", () => {
    const { tx } = normalizeTxJson('{"from":"0x' + "0".repeat(40) + '"}');
    expect(canSimulateDebank(tx)).toBe(false);
  });
});
