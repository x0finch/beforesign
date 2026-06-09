import type { AskSession } from "@beforesign/agent";
import { createEmptySession } from "@beforesign/agent";
import { env } from "cloudflare:workers";
import {
  loadPersistedSession,
  SESSION_TTL_SECONDS,
  writePersistedSession,
} from "./session_persist.ts";

const TTL_MS = SESSION_TTL_SECONDS * 1000;
const memorySessions = new Map<string, AskSession>();

function pruneExpiredMemory() {
  const now = Date.now();
  for (const [id, session] of memorySessions) {
    if (now - session.updatedAt > TTL_MS) {
      memorySessions.delete(id);
    }
  }
}

function getKvNamespace(): KVNamespace | undefined {
  return env.SESSIONS;
}

async function loadSession(sessionId: string): Promise<AskSession | undefined> {
  const kv = getKvNamespace();
  if (kv) {
    return loadPersistedSession(kv, sessionId);
  }

  pruneExpiredMemory();
  return memorySessions.get(sessionId);
}

export async function getOrCreateSession(
  sessionId?: string,
): Promise<AskSession> {
  if (sessionId) {
    const existing = await loadSession(sessionId);
    if (existing) return existing;
  }

  const session = createEmptySession(sessionId);
  const kv = getKvNamespace();
  if (!kv) {
    pruneExpiredMemory();
    memorySessions.set(session.id, session);
  }
  return session;
}

export async function getSession(
  sessionId: string,
): Promise<AskSession | undefined> {
  return loadSession(sessionId);
}

export async function saveSession(session: AskSession): Promise<void> {
  session.updatedAt = Date.now();
  const kv = getKvNamespace();
  if (kv) {
    await writePersistedSession(kv, session);
    return;
  }

  pruneExpiredMemory();
  memorySessions.set(session.id, session);
}

export async function deleteSession(sessionId: string): Promise<void> {
  const kv = getKvNamespace();
  if (kv) {
    await kv.delete(sessionId);
    return;
  }

  memorySessions.delete(sessionId);
}
