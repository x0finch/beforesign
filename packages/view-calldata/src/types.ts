import type { Spec } from "@beforesign/json-render-catalog";
import type { CalldataCall } from "@beforesign/calldata-parse";

export type CalldataViewInput = {
  tree: CalldataCall;
  contractAddress?: string;
};

export type CalldataViewResult = {
  title: string;
  summary: string;
  scenarioId?: string;
  spec: Spec;
};
