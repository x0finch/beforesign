import type { ReviewDocument } from "@beforesign/core";
import type { TxHashPayload } from "../../src/types.ts";

export type ReviewFixture = {
  name: string;
  hash: `0x${string}`;
  payload?: TxHashPayload;
  output: ReviewDocument;
};
