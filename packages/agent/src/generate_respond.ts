import type { ViewSpec } from "@beforesign/core";
import { buildFactsContext, summarizeAssistantSpec } from "./context_builder.ts";
import { resolveAssistantSpec } from "./assistant_spec.ts";
import { buildSystemPrompt } from "./prompts/system.ts";
import type { LlmRuntimeConfig } from "./run_context.ts";
import type { AskInput, AskSession } from "./types.ts";

async function collectChatCompletion(
  config: LlmRuntimeConfig,
  messages: Array<{ role: "system" | "user" | "assistant"; content: string }>,
): Promise<string> {
  const baseUrl = (config.baseUrl ?? "https://api.openai.com/v1").replace(/\/$/, "");
  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model: config.model,
      messages,
      stream: false,
      temperature: 0.2,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`LLM request failed (${response.status}): ${text}`);
  }

  const json = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  return json.choices?.[0]?.message?.content ?? "";
}

export async function generateRespond(
  config: LlmRuntimeConfig,
  session: AskSession,
  input: AskInput,
): Promise<ViewSpec> {
  const facts = buildFactsContext(session.parseResult);
  const system = buildSystemPrompt(input.locale);

  const history = session.messages
    .filter((m) => m.role === "user" || m.role === "assistant")
    .slice(-10)
    .map((m) => ({
      role: m.role as "user" | "assistant",
      content:
        m.role === "assistant" && m.spec
          ? summarizeAssistantSpec(m.spec)
          : m.content,
    }));

  const userContent =
    input.locale === "zh"
      ? `用户问题：${input.message}\n\n解析事实：\n${facts}`
      : `User question: ${input.message}\n\nParsed facts:\n${facts}`;

  const assistantText = await collectChatCompletion(config, [
    { role: "system", content: system },
    ...history.slice(0, -1),
    { role: "user", content: userContent },
  ]);

  return resolveAssistantSpec(assistantText, input.locale);
}
