import type { ReviewDocument } from "@beforesign/core";
import type { TxPayload } from "../../src/types.ts";

export type ReviewFixture = {
  name: string;
  input: string;
  kind: "signedTx" | "unsignedTx";
  payload?: TxPayload;
  output: ReviewDocument;
};
