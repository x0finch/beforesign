import { MemorySession } from "@openai/agents";
import type { AskSession } from "./types.ts";

export function getAgentMemorySession(session: AskSession): MemorySession {
  if (!session.agentMemory) {
    session.agentMemory = new MemorySession({ sessionId: session.id });
  }
  return session.agentMemory;
}
