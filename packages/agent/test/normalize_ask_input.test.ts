import { describe, expect, it } from "vitest";
import { CALLDATA_HEX } from "../../detect/test/fixtures.ts";
import { normalizeAskInput } from "../src/normalize_ask_input.ts";

const TX_HASH =
  "0x945840884f6f041527cb5063e835152e9e349053b07b2c21b2eb52d48933a852";

describe("normalizeAskInput", () => {
  it("extracts tx hash from mixed Chinese message when raw is the full text", () => {
    const normalized = normalizeAskInput({
      message: `这是什么交易 ${TX_HASH}`,
      raw: `这是什么交易 ${TX_HASH}`,
      locale: "zh",
    });
    expect(normalized.raw).toBe(TX_HASH);
    expect(normalized.detectedKind).toBe("txHash");
    expect(normalized.parseTargetSource).toBe("embedded");
  });

  it("extracts calldata from a parse request follow-up", () => {
    const normalized = normalizeAskInput({
      message: `解析 ${CALLDATA_HEX}`,
      locale: "zh",
    });
    expect(normalized.raw).toBe(CALLDATA_HEX);
    expect(normalized.detectedKind).toBe("calldata");
  });

  it("leaves unknown when no parse target exists", () => {
    const normalized = normalizeAskInput({
      message: "继续解析data",
      locale: "zh",
    });
    expect(normalized.raw).toBeUndefined();
    expect(normalized.detectedKind).toBe("unknown");
  });
});
