import type { Abi, Address, Hex } from "viem";
import { encodeFunctionData, parseAbi } from "viem";
import { encodeMultiSendTransactions } from "../../src/unwrappers/safe_multi_send.ts";
import { safeKnownAbi } from "../../src/known_abis/safe.ts";
import { multicallKnownAbi } from "../../src/known_abis/multicall.ts";
import { parseMultiSendTransactions } from "../../src/unwrappers/safe_multi_send.ts";

export const RECIPIENT = "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045" as Address;
export const TOKEN_A = "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48" as Address;
export const TOKEN_B = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2" as Address;
export const SAFE_ADDRESS = "0x1234567890123456789012345678901234567890" as Address;
export const MULTICALL_ADDRESS = "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd" as Address;

export const erc20TransferAbi = [
  {
    type: "function",
    name: "transfer",
    inputs: [
      { name: "to", type: "address" },
      { name: "value", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "nonpayable",
  },
] as const satisfies Abi;

export const forwardBytesAbi = parseAbi([
  "function forward(bytes data)",
]);

export const transferCalldata = encodeFunctionData({
  abi: erc20TransferAbi,
  functionName: "transfer",
  args: [RECIPIENT, 1n],
}) as Hex;

export const innerTransferCalldata = encodeFunctionData({
  abi: erc20TransferAbi,
  functionName: "transfer",
  args: [RECIPIENT, 2n],
}) as Hex;

export const secondTransferCalldata = encodeFunctionData({
  abi: erc20TransferAbi,
  functionName: "transfer",
  args: [RECIPIENT, 3n],
}) as Hex;

export const safeExecCalldata = encodeFunctionData({
  abi: safeKnownAbi,
  functionName: "execTransaction",
  args: [
    TOKEN_A,
    0n,
    innerTransferCalldata,
    0,
    0n,
    0n,
    0n,
    "0x0000000000000000000000000000000000000000",
    "0x0000000000000000000000000000000000000000",
    "0x",
  ],
}) as Hex;

export const multiSendPacked = encodeMultiSendTransactions([
  { to: TOKEN_A, value: 0n, data: innerTransferCalldata, operation: 0 },
  { to: TOKEN_B, value: 0n, data: secondTransferCalldata, operation: 0 },
]);

export const safeMultiSendCalldata = encodeFunctionData({
  abi: safeKnownAbi,
  functionName: "multiSend",
  args: [multiSendPacked],
}) as Hex;

export const multicall3Calldata = encodeFunctionData({
  abi: multicallKnownAbi,
  functionName: "aggregate3",
  args: [
    [
      { target: TOKEN_A, allowFailure: false, callData: innerTransferCalldata },
      { target: TOKEN_B, allowFailure: false, callData: secondTransferCalldata },
    ],
  ],
}) as Hex;

export const forwardCalldata = encodeFunctionData({
  abi: forwardBytesAbi,
  functionName: "forward",
  args: [innerTransferCalldata],
}) as Hex;

export const selectorOnlyCalldata = "0xdeadbeef00000000000000000000000000000000000000000000000000000001" as Hex;

export const erc20TransferAbiMap = {
  [TOKEN_A.toLowerCase()]: erc20TransferAbi as Abi,
  [TOKEN_B.toLowerCase()]: erc20TransferAbi as Abi,
};

// sanity check helper for multisend tests
export const parsedMultiSendPayloads = parseMultiSendTransactions(multiSendPacked);
