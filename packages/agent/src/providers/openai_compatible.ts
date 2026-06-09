import type { LlmMessage, LlmStream } from "../types.ts";

export type OpenAiCompatibleConfig = {
  apiKey: string;
  baseUrl?: string;
  model: string;
};

type ChatCompletionChunk = {
  choices?: Array<{
    delta?: { content?: string };
  }>;
};

export function createOpenAiCompatibleLlm(config: OpenAiCompatibleConfig): LlmStream {
  const baseUrl = (config.baseUrl ?? "https://api.openai.com/v1").replace(/\/$/, "");

  return {
    async *streamChat(messages: LlmMessage[]): AsyncIterable<string> {
      const response = await fetch(`${baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${config.apiKey}`,
        },
        body: JSON.stringify({
          model: config.model,
          messages,
          stream: true,
          temperature: 0.2,
        }),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`LLM request failed (${response.status}): ${text}`);
      }

      if (!response.body) {
        throw new Error("LLM response has no body");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith("data:")) continue;
          const payload = trimmed.slice(5).trim();
          if (payload === "[DONE]") return;

          try {
            const parsed = JSON.parse(payload) as ChatCompletionChunk;
            const text = parsed.choices?.[0]?.delta?.content;
            if (text) yield text;
          } catch {
            // skip malformed chunks
          }
        }
      }
    },
  };
}
