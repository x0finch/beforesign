import { describe, expect, it } from "vitest";
import { parseAgentTurn } from "../src/agent_turn.ts";

describe("parseAgentTurn", () => {
  it("parses raw JSON", () => {
    const turn = parseAgentTurn(
      JSON.stringify({
        thought: "Looks like a tx hash; I'll detect the input type first.",
        tool: "detect_input",
      }),
    );
    expect(turn).toEqual({
      thought: "Looks like a tx hash; I'll detect the input type first.",
      tool: "detect_input",
    });
  });

  it("parses fenced JSON", () => {
    const turn = parseAgentTurn(
      '```json\n{"thought":"Next I will build the review view.","tool":"build_view"}\n```',
    );
    expect(turn?.tool).toBe("build_view");
  });

  it("rejects invalid tool", () => {
    expect(
      parseAgentTurn(
        JSON.stringify({ thought: "nope", tool: "fly_to_moon" }),
      ),
    ).toBeNull();
  });
});
