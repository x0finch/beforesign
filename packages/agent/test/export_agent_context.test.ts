import { describe, expect, it } from "vitest";
import { buildAgentContextExport } from "../src/export_agent_context.ts";
import { normalizeAskInput } from "../src/normalize_ask_input.ts";
import { createEmptySession } from "../src/session_state.ts";

describe("buildAgentContextExport", () => {
  it("includes agent config, turn preamble, and parse facts", async () => {
    const session = createEmptySession();
    session.messages.push({
      id: "m1",
      role: "user",
      content: "What is this tx?",
      createdAt: Date.now(),
    });

    const normalized = normalizeAskInput({
      message: "What is this tx?",
      raw: "0x945840884f6f041527cb5063e835152e9e349053b07b2c21b2eb52d48933a852",
      locale: "en",
    });

    const snapshot = await buildAgentContextExport(session, normalized);

    expect(snapshot.sessionId).toBe(session.id);
    expect(snapshot.locale).toBe("en");
    expect(snapshot.agent.name).toBe("BeforeSign");
    expect(snapshot.agent.tools.map((tool) => tool.name)).toEqual([
      "detect_input",
      "build_view",
      "parse_calldata",
    ]);
    expect(snapshot.turn.message).toBe("What is this tx?");
    expect(snapshot.turn.normalized.detectedKind).not.toBe("unknown");
    expect(snapshot.turn.preamble).toContain("Parse target:");
    expect(snapshot.turn.userTurn).toContain("What is this tx?");
    expect(snapshot.session.chatMessages).toHaveLength(1);
    expect(snapshot.session.parseFacts).toBeDefined();
  });
});
