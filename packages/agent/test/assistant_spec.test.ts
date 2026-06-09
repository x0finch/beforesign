import { describe, expect, it } from "vitest";
import {
  buildTextFallbackSpec,
  parseAssistantSpec,
  resolveAssistantSpec,
} from "../src/assistant_spec.ts";

const sampleSpec = {
  root: "card-1",
  elements: {
    "card-1": {
      type: "Card",
      props: { title: "解读", description: null, badge: null },
      children: ["text-1"],
      visible: true,
    },
    "text-1": {
      type: "Text",
      props: { content: "这是一笔链上转账。", variant: "body" },
      children: [],
      visible: true,
    },
  },
};

describe("assistant_spec", () => {
  it("parses raw JSON spec", () => {
    expect(parseAssistantSpec(JSON.stringify(sampleSpec))).toEqual(sampleSpec);
  });

  it("parses fenced JSON spec", () => {
    const wrapped = `\`\`\`json\n${JSON.stringify(sampleSpec)}\n\`\`\``;
    expect(parseAssistantSpec(wrapped)).toEqual(sampleSpec);
  });

  it("builds fallback spec from markdown prose", () => {
    const spec = buildTextFallbackSpec("**发送方**：0xabc\n\n普通说明。", "解读");
    expect(spec.root).toBeTruthy();
    expect(Object.values(spec.elements).some((el) => el.type === "Text")).toBe(true);
  });

  it("resolveAssistantSpec falls back when JSON invalid", () => {
    const spec = resolveAssistantSpec("纯文本说明", "zh");
    const card = Object.values(spec.elements).find((el) => el.type === "Card");
    expect(card?.props?.title).toBe("解读");
  });
});
