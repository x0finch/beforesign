import type { ReviewDocument } from "@beforesign/core";
import type { TypedDataPayload } from "../../src/profiles/context.ts";

export type ReviewFixture = {
  name: string;
  input: string;
  payload?: TypedDataPayload;
  output: ReviewDocument;
};
