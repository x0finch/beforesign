import type { SerializableCalldataCall } from "../../src/types.ts";
import type { ParseFixture } from "./types.ts";
import { erc20TransferAbi, transferCalldata } from "./inputs.ts";

const input = transferCalldata;

const options = {
  abi: erc20TransferAbi,
};

// @generated output — fixtures:update 维护，勿手改
const output = {
  "raw": "0xa9059cbb000000000000000000000000d8da6bf26964af9d7eed9e03e53415d37aa960450000000000000000000000000000000000000000000000000000000000000001",
  "selector": "0xa9059cbb",
  "depth": 0,
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
      "displayValue": "1",
      "value": "1"
    }
  ],
  "children": []
} satisfies SerializableCalldataCall;

export const transferFixture: ParseFixture = {
  name: "transfer",
  input,
  options,
  output,
};
