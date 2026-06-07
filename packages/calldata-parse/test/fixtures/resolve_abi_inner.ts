import type { SerializableCalldataCall } from "../../src/types.ts";
import type { ParseFixture } from "./types.ts";
import {
  erc20TransferAbiMap,
  safeExecCalldata,
  TOKEN_A,
} from "./inputs.ts";

const input = safeExecCalldata;

const options = {
  abiByTarget: erc20TransferAbiMap,
  rootTarget: TOKEN_A,
};

// @generated output — fixtures:update 维护，勿手改
const output = {
  "raw": "0x6a761202000000000000000000000000a0b86991c6218b36c1d19d4a2e9eb0ce3606eb480000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000014000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001c00000000000000000000000000000000000000000000000000000000000000044a9059cbb000000000000000000000000d8da6bf26964af9d7eed9e03e53415d37aa960450000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
  "selector": "0x6a761202",
  "depth": 0,
  "functionName": "execTransaction",
  "signature": "execTransaction(address,uint256,bytes,uint8,uint256,uint256,uint256,address,address,bytes)",
  "signatureWithNames": "execTransaction(address to,uint256 value,bytes data,uint8 operation,uint256 safeTxGas,uint256 baseGas,uint256 gasPrice,address gasToken,address refundReceiver,bytes signatures)",
  "outputs": [
    {
      "name": "success",
      "type": "bool"
    }
  ],
  "summary": "execTransaction → 1 inner call(s)",
  "args": [
    {
      "name": "to",
      "type": "address",
      "displayValue": "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
      "value": "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"
    },
    {
      "name": "value",
      "type": "uint256",
      "displayValue": "0",
      "value": "0"
    },
    {
      "name": "data",
      "type": "bytes",
      "displayValue": "0xa9059cbb000000000000000000000000d8da6bf26964af9d7eed9e03e53415d37aa960450000000000000000000000000000000000000000000000000000000000000002",
      "value": "0xa9059cbb000000000000000000000000d8da6bf26964af9d7eed9e03e53415d37aa960450000000000000000000000000000000000000000000000000000000000000002"
    },
    {
      "name": "operation",
      "type": "uint8",
      "displayValue": "0",
      "value": 0
    },
    {
      "name": "safeTxGas",
      "type": "uint256",
      "displayValue": "0",
      "value": "0"
    },
    {
      "name": "baseGas",
      "type": "uint256",
      "displayValue": "0",
      "value": "0"
    },
    {
      "name": "gasPrice",
      "type": "uint256",
      "displayValue": "0",
      "value": "0"
    },
    {
      "name": "gasToken",
      "type": "address",
      "displayValue": "0x0000000000000000000000000000000000000000",
      "value": "0x0000000000000000000000000000000000000000"
    },
    {
      "name": "refundReceiver",
      "type": "address",
      "displayValue": "0x0000000000000000000000000000000000000000",
      "value": "0x0000000000000000000000000000000000000000"
    },
    {
      "name": "signatures",
      "type": "bytes",
      "displayValue": "0x",
      "value": "0x"
    }
  ],
  "children": [
    {
      "raw": "0xa9059cbb000000000000000000000000d8da6bf26964af9d7eed9e03e53415d37aa960450000000000000000000000000000000000000000000000000000000000000002",
      "selector": "0xa9059cbb",
      "depth": 1,
      "functionName": "transfer",
      "signature": "transfer(address,uint256)",
      "signatureWithNames": "transfer(address to,uint256 value)",
      "outputs": [
        {
          "name": "",
          "type": "bool"
        }
      ],
      "summary": "Call transfer",
      "target": "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
      "wrapper": {
        "kind": "safe.execTransaction",
        "sourcePath": "2"
      },
      "operation": "call",
      "value": "0",
      "args": [
        {
          "name": "to",
          "type": "address",
          "displayValue": "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
          "value": "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045"
        },
        {
          "name": "value",
          "type": "uint256",
          "displayValue": "2",
          "value": "2"
        }
      ],
      "children": []
    }
  ]
} satisfies SerializableCalldataCall;

export const resolveAbiInnerFixture: ParseFixture = {
  name: "resolveAbiInner",
  input,
  options,
  output,
};
