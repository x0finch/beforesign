import { describe, expect, it } from "vitest";
import { buildSystemPrompt } from "../src/prompts/system.ts";

describe("buildSystemPrompt", () => {
  it("forbids transfer language without value or token facts", () => {
    const en = buildSystemPrompt("en");
    const zh = buildSystemPrompt("zh");

    expect(en).toContain("Do not describe From/To as a transfer");
    expect(en).toContain("contract call");
    expect(zh).toContain("转账");
  });
});
