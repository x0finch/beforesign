import { describe, expect, it } from "vitest";
import { metamask_unsigned_json, typed_data_json } from "@beforesign/test-fixtures";
import { parse_locally } from "./parse_locally.ts";
import { can_simulate_debank } from "./simulate.ts";
import { normalize_tx_json } from "./normalize_tx_json.ts";

describe("parse_locally", () => {
  it("parses typed data", () => {
    const result = parse_locally("typed_data", typed_data_json);
    expect(result.typed_data?.primary_type).toBe("Permit");
    expect(result.typed_data?.signable_hash).toBeTruthy();
  });

  it("parses unsigned json", () => {
    const result = parse_locally("unsigned_tx", metamask_unsigned_json);
    expect(result.tx?.from).toBeTruthy();
    expect(can_simulate_debank(result.tx)).toBe(true);
  });

  it("flags missing simulate fields", () => {
    const { tx } = normalize_tx_json('{"from":"0x' + "0".repeat(40) + '"}');
    expect(can_simulate_debank(tx)).toBe(false);
  });
});
