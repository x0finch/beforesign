import type { SerializableCalldataCall } from "../../src/types.ts";
import type { ParseFixture } from "./types.ts";
import { forwardBytesAbi, forwardCalldata } from "./inputs.ts";

const input = forwardCalldata;

const options = {
  abi: forwardBytesAbi,
};

// @generated output — fixtures:update 维护，勿手改
const output = {
  "raw": "0xd948d46800000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000044a9059cbb000000000000000000000000d8da6bf26964af9d7eed9e03e53415d37aa96045000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000",
  "selector": "0xd948d468",
  "depth": 0,
  "functionName": "forward",
  "signature": "forward(bytes)",
  "signatureWithNames": "forward(bytes data)",
  "summary": "Call forward",
  "args": [
    {
      "name": "data",
      "type": "bytes",
      "displayValue": "0xa9059cbb000000000000000000000000d8da6bf26964af9d7eed9e03e53415d37aa960450000000000000000000000000000000000000000000000000000000000000002",
      "value": "0xa9059cbb000000000000000000000000d8da6bf26964af9d7eed9e03e53415d37aa960450000000000000000000000000000000000000000000000000000000000000002"
    }
  ],
  "children": []
} satisfies SerializableCalldataCall;

export const genericBytesFixture: ParseFixture = {
  name: "genericBytes",
  input,
  options,
  output,
};
