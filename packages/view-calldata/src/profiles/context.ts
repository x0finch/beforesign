import type { CalldataCall } from "@beforesign/calldata-parse";

export type CalldataScenarioId = "generic" | "approval";

export type CalldataViewContext = {
  tree: CalldataCall;
  contractAddress?: string;
};
