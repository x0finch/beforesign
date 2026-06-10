import { isOpenAIConversationId } from "./beforesign_session.ts";
import type { LlmRuntimeConfig } from "./run_context.ts";

function conversationsUrl(baseUrl?: string): string {
  const root = (baseUrl ?? "https://api.openai.com/v1").replace(/\/$/, "");
  return `${root}/conversations`;
}

export async function createOpenAIConversation(
  llm: LlmRuntimeConfig,
  fetchFn: typeof fetch = fetch,
): Promise<string> {
  if (!llm.apiKey) {
    throw new Error("LLM apiKey is required to create a conversation");
  }

  const response = await fetchFn(conversationsUrl(llm.baseUrl), {
    method: "POST",
    headers: {
      Authorization: `Bearer ${llm.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({}),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Failed to create conversation (${response.status})`);
  }

  const body = (await response.json()) as { id?: string };
  if (!isOpenAIConversationId(body.id)) {
    throw new Error("OpenAI conversation response missing conv_* id");
  }

  return body.id;
}
