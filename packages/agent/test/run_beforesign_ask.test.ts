import { describe, expect, it } from "vitest";
import type { AiPipelineDeps } from "@beforesign/ai-pipeline";
import { runBeforeSignAsk } from "../src/run_beforesign_ask.ts";
import { createEmptySession } from "../src/session_state.ts";

const deps = {} as AiPipelineDeps;

describe("runBeforeSignAsk fallback", () => {
  it("builds view without LLM when raw is present", async () => {
    const session = createEmptySession();

    const events = [];
    for await (const event of runBeforeSignAsk({
      session,
      input: {
        message: "0x945840884f6f041527cb5063e835152e9e349053b07b2c21b2eb52d48933a852",
        raw: "0x945840884f6f041527cb5063e835152e9e349053b07b2c21b2eb52d48933a852",
        locale: "en",
      },
      deps,
    })) {
      events.push(event);
    }

    expect(events.some((e) => e.type === "timeline")).toBe(true);
    expect(events.some((e) => e.type === "context_export")).toBe(true);
    expect(events.at(-1)?.type).toBe("done");
    expect(events.at(-2)?.type).toBe("context_export");
    expect(events.some((e) => e.type === "assistant_spec")).toBe(false);
    expect(
      events.some((e) => e.type === "parse_result") || events.some((e) => e.type === "error"),
    ).toBe(true);
  });
});
