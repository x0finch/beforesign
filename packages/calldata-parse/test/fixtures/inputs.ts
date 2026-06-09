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

/** Safe multiSend(bytes) with three packed inner calls (regression input). */
export const userMultiSendCalldata =
  "0x8d80ff0a0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000046b00469788fe6e9e9681c6ebf3bf78e7fd26fc01544600000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000044bd86e508736166652e6574680000000000000000000000000000000000000000000000000000000000000000000000003317ad9eda6942b5a7be5ba83346c0ea82c3c26c00a0b937d5c8e32a80e3a8ed4227cd020221544ee6000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002c4bf6213e4000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001a0000000000000000000000000000000000000000000000000000000005bacaa2000000000000000000000000000000000000000000000000778f89c2507a4c00000000000000000000000000000000000000000000000000000000000000000a000000000000000000000000000000000000000000000000000000000000000105445df891026993f9e429b4335107485551b7ea15fbf7ea105e9fe2f8913b237317167a8f76aba70f4f146893fe362b81e275141938a2693dd131d564c65de2127687dfd5b0fd6d29c2107d87892c3ec7a48fcc6a45302fb24004caf84cfa0c2342c1f2f46224851082cb37b57b8b3c452ec34d9f75ff37d3093576423a6a5dbdaa0699ec122027cde94139aed4af590e79ada1396dc90f3e2c0c6e2694254d22473ab5a509fd1973cdeefd17b30bf5a5ca2febf6cf0e99372a396cad9358d9f650a4db6d5a0edd3ab913126cbf239a539a431ad887bac3b77ea20318ee0180c8fb766ab705f00b6ee473d1a753bcab065d4d8456617a93668df44a5d92723206c9d8a652b918093a8c688c8ed55be8ff9c733a18a2318b4cb90f5f56a487593192cb599df460b40c5e0a5fc36e97af034cf448dcbbce6d915279416cb54ab647ab66268a526bd7249decfd21fb284308eb16db5154f5a603c8bef589e24b6492c37705641a287ac442cdec3fd580e9abeabe2c966cfaa3cc7fad97013df6dd626b2e5f92bca75599e0f0f8f168256d8536431e6976f9632737813d7acab0e74de55fd0da1d542dba838771c685601a1fcb072387d5d82676a1c95c1b7aad5ca6b3e88b74da169ca93e56f322d7b2ab8416495d64a8a9f57d0ca443d995b2364f8e2791b9d07b3e620189a36bf17e30c874e66b205c79492a16cd5a9c5bb65b700a0b937d5c8e32a80e3a8ed4227cd020221544ee6000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000640087b83fd2ded030cf69b4eb0e81a1f5f9f4eaef618b8f2b2002dbc81601ecc940a9570e00000000000000000000000041d1b29b08bdc2531362a047014bb6e283b1302000000000000000000000000000000000ffffffffffffffffffffffffffffffff000000000000000000000000000000000000000000" as Hex;
