import { createEmptySession } from "@beforesign/agent";
import { describe, expect, it } from "vitest";
import {
  fromPersisted,
  isSessionExpired,
  toPersisted,
} from "./session_persist.ts";

describe("session_persist", () => {
  it("round-trips session fields without agentMemory", () => {
    const session = createEmptySession("sess-1");
    session.openaiConversationId = "conv_abc";
    session.parseResult = {
      title: "Test tx",
      view: { spec: { root: "root", elements: {} } },
    } as never;
    session.updatedAt = Date.now();

    const persisted = toPersisted(session);
    const restored = fromPersisted(persisted);

    expect(restored.id).toBe("sess-1");
    expect(restored.openaiConversationId).toBe("conv_abc");
    expect(restored.parseResult).toEqual(session.parseResult);
    expect(restored.agentMemory).toBeUndefined();
  });

  it("expires sessions after TTL", () => {
    const now = Date.now();
    expect(
      isSessionExpired(
        {
          id: "sess-1",
          messages: [],
          createdAt: now - 2 * 60 * 60 * 1000,
          updatedAt: now - 2 * 60 * 60 * 1000,
        },
        now,
      ),
    ).toBe(true);
  });
});
