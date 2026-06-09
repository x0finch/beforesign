import type { AskSession } from "@beforesign/agent";
import { createEmptySession } from "@beforesign/agent";

export const SESSION_TTL_SECONDS = 60 * 60;

export type PersistedAskSession = {
  id: string;
  messages: AskSession["messages"];
  parseResult?: AskSession["parseResult"];
  lastParseInput?: AskSession["lastParseInput"];
  openaiConversationId?: string;
  lastNormalizedInput?: AskSession["lastNormalizedInput"];
  lastContextExport?: AskSession["lastContextExport"];
  createdAt: number;
  updatedAt: number;
};

export function toPersisted(session: AskSession): PersistedAskSession {
  return {
    id: session.id,
    messages: session.messages,
    parseResult: session.parseResult,
    lastParseInput: session.lastParseInput,
    openaiConversationId: session.openaiConversationId,
    lastNormalizedInput: session.lastNormalizedInput,
    lastContextExport: session.lastContextExport,
    createdAt: session.createdAt,
    updatedAt: session.updatedAt,
  };
}

export function fromPersisted(persisted: PersistedAskSession): AskSession {
  return {
    ...createEmptySession(persisted.id),
    messages: persisted.messages,
    parseResult: persisted.parseResult,
    lastParseInput: persisted.lastParseInput,
    openaiConversationId: persisted.openaiConversationId,
    lastNormalizedInput: persisted.lastNormalizedInput,
    lastContextExport: persisted.lastContextExport,
    createdAt: persisted.createdAt,
    updatedAt: persisted.updatedAt,
  };
}

export function isSessionExpired(
  persisted: PersistedAskSession,
  now = Date.now(),
): boolean {
  return now - persisted.updatedAt > SESSION_TTL_SECONDS * 1000;
}

export async function loadPersistedSession(
  kv: KVNamespace,
  sessionId: string,
): Promise<AskSession | undefined> {
  const raw = await kv.get(sessionId);
  if (!raw) return undefined;

  const persisted = JSON.parse(raw) as PersistedAskSession;
  if (persisted.id !== sessionId || isSessionExpired(persisted)) {
    await kv.delete(sessionId);
    return undefined;
  }

  return fromPersisted(persisted);
}

export async function writePersistedSession(
  kv: KVNamespace,
  session: AskSession,
): Promise<void> {
  const persisted = toPersisted({
    ...session,
    updatedAt: Date.now(),
  });
  await kv.put(session.id, JSON.stringify(persisted), {
    expirationTtl: SESSION_TTL_SECONDS,
  });
}
