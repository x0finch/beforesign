import { describe, expect, it } from "vitest";
import {
  CALLDATA_HEX,
  METAMASK_UNSIGNED_JSON,
  TX_HASH,
  TYPED_DATA_JSON,
} from "@beforesign/test-fixtures";
import { detectInputType } from "./input_type.ts";

describe("detectInputType", () => {
  it("classifies tx hash", () => {
    expect(detectInputType(TX_HASH).kind).toBe("txHash");
  });

  it("classifies typed data json", () => {
    expect(detectInputType(TYPED_DATA_JSON).kind).toBe("typedData");
  });

  it("classifies unsigned tx json", () => {
    expect(detectInputType(METAMASK_UNSIGNED_JSON).kind).toBe("unsignedTx");
  });

  it("classifies calldata hex", () => {
    expect(detectInputType(CALLDATA_HEX).kind).toBe("calldata");
  });

  it("classifies unknown input", () => {
    expect(detectInputType("hello").kind).toBe("unknown");
  });
});
