import { tool } from "@openai/agents";
import type { RunContext } from "@openai/agents";
import { z } from "zod";
import type { BeforeSignRunContext } from "./run_context.ts";
import {
  runBuildViewAction,
  runDetectInputAction,
  runGetFactsAction,
  runParseCalldataAction,
} from "./tool_actions.ts";

function ctx(runContext?: RunContext<unknown>): BeforeSignRunContext {
  const context = runContext?.context as BeforeSignRunContext | undefined;
  if (!context) {
    throw new Error("BeforeSign run context is missing");
  }
  return context;
}

export const detectInputTool = tool({
  name: "detect_input",
  description:
    "Detect the InputKind of the parse target (tx hash, calldata, typed data, signed/unsigned tx). Optional when kind is already known.",
  parameters: z.object({}),
  execute: async (_args, runContext) => {
    const { session, normalized } = ctx(runContext);
    const result = runDetectInputAction(session, normalized);
    return result.message;
  },
});

export const buildViewTool = tool({
  name: "build_view",
  description:
    "Build the structured review view (ParseResult + json-render spec). Fetches on-chain data for tx hashes.",
  parameters: z.object({}),
  execute: async (_args, runContext) => {
    const { session, normalized, deps, emit } = ctx(runContext);
    const result = await runBuildViewAction(session, normalized, deps, emit);
    return result.message;
  },
});

export const parseCalldataTool = tool({
  name: "parse_calldata",
  description:
    "Decode contract calldata from the Data field of the current transaction view (txHash/signedTx/unsignedTx).",
  parameters: z.object({}),
  execute: async (_args, runContext) => {
    const { session, normalized, deps, emit } = ctx(runContext);
    const result = await runParseCalldataAction(session, normalized, deps, emit);
    return result.message;
  },
});

export const getFactsTool = tool({
  name: "get_facts",
  description: "Read parsed facts from the current session (summary, fields, warnings).",
  parameters: z.object({}),
  execute: async (_args, runContext) => {
    const { session, normalized } = ctx(runContext);
    const result = runGetFactsAction(session, normalized);
    return result.message;
  },
});

export const beforeSignTools = [
  detectInputTool,
  buildViewTool,
  parseCalldataTool,
  getFactsTool,
];
