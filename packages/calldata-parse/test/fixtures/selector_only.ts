import type { SerializableCalldataCall } from "../../src/types.ts";
import type { ParseFixture } from "./types.ts";
import { selectorOnlyCalldata } from "./inputs.ts";

const input = selectorOnlyCalldata;

// @generated output — fixtures:update 维护，勿手改
const output = {
  "raw": "0xdeadbeef00000000000000000000000000000000000000000000000000000001",
  "selector": "0xdeadbeef",
  "depth": 0,
  "summary": "Unknown method (0xdeadbeef)",
  "args": [],
  "children": []
} satisfies SerializableCalldataCall;

export const selectorOnlyFixture: ParseFixture = {
  name: "selectorOnly",
  input,
  output,
};
