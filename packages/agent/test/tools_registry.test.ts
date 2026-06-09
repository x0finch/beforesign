import { describe, expect, it } from "vitest";
import { getToolDefinition } from "../src/tools/registry.ts";
import { createEmptySession } from "../src/session_state.ts";

describe("agent tools canRun", () => {
  const session = createEmptySession();

  it("detect_input requires raw", () => {
    const tool = getToolDefinition("detect_input")!;
    expect(tool.canRun(session, { message: "hi", locale: "en" })).toBe(false);
    expect(
      tool.canRun(session, {
        message: "0xabc",
        raw: "0xabc",
        locale: "en",
      }),
    ).toBe(true);
  });

  it("respond requires parseResult", () => {
    const tool = getToolDefinition("respond")!;
    expect(tool.canRun(session, { message: "hi", locale: "en" })).toBe(false);
    session.parseResult = {
      kind: "txHash",
      summary: "tx",
      warnings: [],
      raw: "0x",
    };
    expect(tool.canRun(session, { message: "hi", locale: "en" })).toBe(true);
  });
});
