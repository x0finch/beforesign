import { describe, expect, it } from "vitest";
import type { AgentInputItem } from "@openai/agents";
import { trimParseToolSpecsForModel } from "../src/session_input_callback.ts";

const SPEC_A = { root: "a", elements: { a: { type: "Text", props: { content: "A" } } } };
const SPEC_B = { root: "b", elements: { b: { type: "Text", props: { content: "B" } } } };

function parseToolResult(
  name: string,
  callId: string,
  payload: Record<string, unknown>,
): AgentInputItem {
  return {
    type: "function_call_result",
    name,
    callId,
    status: "completed",
    output: { type: "text", text: JSON.stringify(payload) },
  } as AgentInputItem;
}

describe("trimParseToolSpecsForModel", () => {
  it("keeps spec only on the latest build_view/parse_calldata result", () => {
    const history = [
      parseToolResult("build_view", "call_1", { spec: SPEC_A }),
      { type: "message", role: "user", content: "follow up" } as AgentInputItem,
    ];
    const newItems = [
      parseToolResult("parse_calldata", "call_2", { spec: SPEC_B }),
    ];

    const merged = trimParseToolSpecsForModel(history, newItems);

    const outputs = merged
      .filter((item) => (item as { type?: string }).type === "function_call_result")
      .map((item) =>
        JSON.parse(
          (item as { output: { text: string } }).output.text,
        ) as { spec?: unknown },
      );

    expect(outputs[0]?.spec).toBeUndefined();
    expect(outputs[1]?.spec).toEqual(SPEC_B);
  });
});
