import { Agent } from "@openai/agents";
import { buildBeforeSignInstructions } from "./prompts/beforesign_instructions.ts";
import { beforeSignTools } from "./sdk_tools.ts";
import type { AskLocale } from "./types.ts";

export function createBeforeSignAgent(locale: AskLocale): Agent {
  return new Agent({
    name: "BeforeSign",
    instructions: buildBeforeSignInstructions(locale),
    tools: beforeSignTools,
    modelSettings: {
      toolChoice: "auto",
      temperature: 0.2,
    },
  });
}
