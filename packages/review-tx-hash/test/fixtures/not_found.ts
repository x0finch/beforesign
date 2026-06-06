import { TX_HASH } from "@beforesign/test-fixtures";
import type { ReviewDocument } from "@beforesign/core";
import type { ReviewFixture } from "./types.ts";

const payload = {
  discovery: { status: "notFound" as const, hits: [] },
};

// @generated output — fixtures:update 维护，勿手改
const output = {
  "kind": "txHash",
  "title": "Transaction",
  "summary": "Transaction hash not found in Tenderly; verify before acting",
  "checks": [],
  "warnings": []
} satisfies ReviewDocument;

export const notFoundFixture: ReviewFixture = {
  name: "notFound",
  hash: TX_HASH,
  payload,
  output,
};
