import { describe, expect, it } from "vitest";
import {
  calldata_hex,
  metamask_unsigned_json,
  tx_hash,
  typed_data_json,
} from "@beforesign/test-fixtures";
import { detect_input_type } from "./input_type.ts";

describe("detect_input_type", () => {
  it("classifies tx hash", () => {
    expect(detect_input_type(tx_hash).kind).toBe("tx_hash");
  });

  it("classifies typed data json", () => {
    expect(detect_input_type(typed_data_json).kind).toBe("typed_data");
  });

  it("classifies unsigned tx json", () => {
    expect(detect_input_type(metamask_unsigned_json).kind).toBe("unsigned_tx");
  });

  it("classifies calldata hex", () => {
    expect(detect_input_type(calldata_hex).kind).toBe("calldata");
  });

  it("classifies unknown input", () => {
    expect(detect_input_type("hello").kind).toBe("unknown");
  });
});
