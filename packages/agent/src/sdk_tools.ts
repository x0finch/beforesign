import { tool } from "@openai/agents";
import type { RunContext } from "@openai/agents";
import { z } from "zod";
import type { BeforeSignRunContext } from "./run_context.ts";
import {
  runBuildViewAction,
  runDetectInputAction,
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
    const result = runDetectInputAction(ctx(runContext));
    return result.message;
  },
});

export const buildViewTool = tool({
  name: "build_view",
  description:
    "Build the structured review view (json-render spec) for the current parse target. Fetches on-chain data for tx hashes. Returns spec only; does not decode contract Data—call parse_calldata separately when the spec shows non-empty calldata.",
  parameters: z.object({}),
  execute: async (_args, runContext) => {
    const result = await runBuildViewAction(ctx(runContext));
    return result.message;
  },
});

export const parseCalldataTool = tool({
  name: "parse_calldata",
  description:
    "Decode contract calldata from the Data field after build_view in the same run. Call when the build_view spec shows non-empty contract Data (0x with length > 2, not just 0x). Not needed for plain ETH transfers (data is 0x).",
  parameters: z.object({}),
  execute: async (_args, runContext) => {
    const result = await runParseCalldataAction(ctx(runContext));
    return result.message;
  },
});

export const beforeSignTools = [detectInputTool, buildViewTool, parseCalldataTool];
