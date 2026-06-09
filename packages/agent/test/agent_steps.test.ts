import { describe, expect, it } from "vitest";
import { buildStepEvent, formatInputKind, stepLabel } from "../src/agent_steps.ts";

describe("agent_steps", () => {
  it("formatInputKind maps txHash in zh and en", () => {
    expect(formatInputKind("txHash", "zh")).toBe("交易哈希");
    expect(formatInputKind("txHash", "en")).toBe("Transaction hash");
  });

  it("stepLabel shows running detect text", () => {
    expect(stepLabel("detect", "zh", "running")).toBe("识别输入类型…");
    expect(stepLabel("detect", "en", "running")).toBe("Detecting input type…");
  });

  it("stepLabel includes kind detail when detect is done", () => {
    const label = stepLabel("detect", "en", "done", "txHash");
    expect(label).toContain("txHash");
    expect(label).toContain("Transaction hash");
  });

  it("stepLabel includes summary when parse is done", () => {
    expect(stepLabel("parse", "zh", "done", "On-chain transaction")).toBe(
      "解析完成：On-chain transaction",
    );
  });

  it("buildStepEvent returns step SSE payload", () => {
    const event = buildStepEvent("explain", "en", "running");
    expect(event).toEqual({
      type: "step",
      key: "explain",
      status: "running",
      label: "Generating explanation…",
    });
  });
});
