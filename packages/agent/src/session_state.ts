import type { ParseInput } from "@beforesign/core";
import type { AskSession, ChatMessage } from "./types.ts";

export function createSessionId(): string {
  return crypto.randomUUID();
}

export function createMessageId(): string {
  return crypto.randomUUID();
}

export function createEmptySession(id?: string): AskSession {
  const now = Date.now();
  return {
    id: id ?? createSessionId(),
    messages: [],
    createdAt: now,
    updatedAt: now,
  };
}

export function appendMessage(
  session: AskSession,
  role: ChatMessage["role"],
  content: string,
): ChatMessage {
  const message: ChatMessage = {
    id: createMessageId(),
    role,
    content,
    createdAt: Date.now(),
  };
  session.messages.push(message);
  session.updatedAt = Date.now();
  return message;
}

export function buildParseInputFromAsk(
  input: {
    raw: string;
    chainId?: number;
    abi?: string;
    signerAddress?: string;
    selectedDiscoveryHit?: string;
    locale: "zh" | "en";
  },
): ParseInput {
  return {
    raw: input.raw,
    ...(input.chainId !== undefined ? { chainId: input.chainId } : {}),
    ...(input.abi ? { abi: input.abi } : {}),
    ...(input.signerAddress ? { signerAddress: input.signerAddress } : {}),
    ...(input.selectedDiscoveryHit
      ? { selectedDiscoveryHit: input.selectedDiscoveryHit }
      : {}),
    locale: input.locale,
  };
}
