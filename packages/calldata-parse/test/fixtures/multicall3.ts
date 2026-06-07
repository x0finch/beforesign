import type { SerializableCalldataCall } from "../../src/types.ts";
import type { ParseFixture } from "./types.ts";
import { multicall3Calldata } from "./inputs.ts";

const input = multicall3Calldata;

// @generated output — fixtures:update 维护，勿手改
const output = {
  "raw": "0x82ad56cb0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000120000000000000000000000000a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000044a9059cbb000000000000000000000000d8da6bf26964af9d7eed9e03e53415d37aa96045000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000044a9059cbb000000000000000000000000d8da6bf26964af9d7eed9e03e53415d37aa96045000000000000000000000000000000000000000000000000000000000000000300000000000000000000000000000000000000000000000000000000",
  "selector": "0x82ad56cb",
  "depth": 0,
  "functionName": "aggregate3",
  "signature": "aggregate3(tuple[])",
  "signatureWithNames": "aggregate3(tuple[] calls)",
  "outputs": [
    {
      "name": "returnData",
      "type": "tuple[]",
      "components": [
        {
          "name": "success",
          "type": "bool"
        },
        {
          "name": "returnData",
          "type": "bytes"
        }
      ]
    }
  ],
  "summary": "aggregate3 → 2 inner call(s)",
  "args": [
    {
      "name": "calls",
      "type": "tuple[]",
      "components": [
        {
          "name": "target",
          "type": "address"
        },
        {
          "name": "allowFailure",
          "type": "bool"
        },
        {
          "name": "callData",
          "type": "bytes"
        }
      ],
      "displayValue": "[{\"target\":\"0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48\",\"allowFailure\":false,\"callData\":\"0xa9059cbb000000000000000000000000d8da6bf26964af9d7eed9e03e53415d37aa960450000000000000000000000000000000000000000000000000000000000000002\"}, {\"target\":\"0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2\",\"allowFailure\":false,\"callData\":\"0xa9059cbb000000000000000000000000d8da6bf26964af9d7eed9e03e53415d37aa960450000000000000000000000000000000000000000000000000000000000000003\"}]",
      "value": [
        {
          "target": "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
          "allowFailure": false,
          "callData": "0xa9059cbb000000000000000000000000d8da6bf26964af9d7eed9e03e53415d37aa960450000000000000000000000000000000000000000000000000000000000000002"
        },
        {
          "target": "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
          "allowFailure": false,
          "callData": "0xa9059cbb000000000000000000000000d8da6bf26964af9d7eed9e03e53415d37aa960450000000000000000000000000000000000000000000000000000000000000003"
        }
      ]
    }
  ],
  "children": [
    {
      "raw": "0xa9059cbb000000000000000000000000d8da6bf26964af9d7eed9e03e53415d37aa960450000000000000000000000000000000000000000000000000000000000000002",
      "selector": "0xa9059cbb",
      "depth": 1,
      "summary": "Unknown method (0xa9059cbb)",
      "target": "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
      "wrapper": {
        "kind": "multicall.aggregate3",
        "index": 0,
        "sourcePath": "0/0/2"
      },
      "args": [],
      "children": []
    },
    {
      "raw": "0xa9059cbb000000000000000000000000d8da6bf26964af9d7eed9e03e53415d37aa960450000000000000000000000000000000000000000000000000000000000000003",
      "selector": "0xa9059cbb",
      "depth": 1,
      "summary": "Unknown method (0xa9059cbb)",
      "target": "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
      "wrapper": {
        "kind": "multicall.aggregate3",
        "index": 1,
        "sourcePath": "0/1/2"
      },
      "args": [],
      "children": []
    }
  ]
} satisfies SerializableCalldataCall;

export const multicall3Fixture: ParseFixture = {
  name: "multicall3",
  input,
  output,
};
