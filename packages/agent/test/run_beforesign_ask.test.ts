import { describe, expect, it } from "vitest";
import type { AiPipelineDeps } from "@beforesign/ai-pipeline";
import { runBeforeSignAsk } from "../src/run_beforesign_ask.ts";
import { createEmptySession } from "../src/session_state.ts";

const deps = {} as AiPipelineDeps;

const FIXTURE_TX_HASH =
  "0x945840884f6f041527cb5063e835152e9e349053b07b2c21b2eb52d48933a852";

describe("runBeforeSignAsk", () => {
  it("errors when LLM is not configured", async () => {
    const session = createEmptySession();

    const events = [];
    for await (const event of runBeforeSignAsk({
      session,
      input: {
        message: FIXTURE_TX_HASH,
        raw: FIXTURE_TX_HASH,
        locale: "en",
      },
      deps,
    })) {
      events.push(event);
    }

    expect(events).toEqual([
      { type: "error", message: "LLM is not configured. Set LLM_API_KEY." },
    ]);
  });
});
