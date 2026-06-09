import type { AskSession } from "@beforesign/agent";
import { createEmptySession } from "@beforesign/agent";

const TTL_MS = 60 * 60 * 1000;
const sessions = new Map<string, AskSession>();

function pruneExpired() {
  const now = Date.now();
  for (const [id, session] of sessions) {
    if (now - session.updatedAt > TTL_MS) {
      sessions.delete(id);
    }
  }
}

export function getOrCreateSession(sessionId?: string): AskSession {
  pruneExpired();
  if (sessionId) {
    const existing = sessions.get(sessionId);
    if (existing) return existing;
  }
  const session = createEmptySession(sessionId);
  sessions.set(session.id, session);
  return session;
}

export function getSession(sessionId: string): AskSession | undefined {
  pruneExpired();
  return sessions.get(sessionId);
}

export function deleteSession(sessionId: string) {
  sessions.delete(sessionId);
}
