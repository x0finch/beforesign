import { parseTransaction } from "viem";

/** EIP-1559 unsigned tx RLP (viem serializeTransaction, hardhat account #0) */
export const UNSIGNED_TX_HEX =
  "0x02e80180843b9aca008504a817c80082520894c02aaa39b223fe8d0a0e5c4f27ead9083c756cc28080c0";

/** EIP-1559 signed tx RLP (viem signTransaction, hardhat account #0) */
export const SIGNED_TX_HEX =
  "0x02f86b0180843b9aca008504a817c80082520894c02aaa39b223fe8d0a0e5c4f27ead9083c756cc28080c001a06f6605bebe23e5810ee1781153631f9c2d0f775056fa832d2ab6b5ce804cf12ca0790803f8d8030469fb929b5e9acdb1c58f310f708ef765d756b4d5778ddf0e53";

/** Known-good short calldata: transfer(address,uint256) with dummy args */
export const CALLDATA_HEX =
  "0xa9059cbb000000000000000000000000d8da6bf26964af9d7eed9e03e53415d37aa960450000000000000000000000000000000000000000000000000000000000000001";

export const SIGNED_TX_FROM = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";

function unsignedTxJsonBase(): Record<string, string> {
  return {
    from: "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
    to: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
    data: "0x",
    value: "0x0",
    chainId: "0x1",
    nonce: "0x0",
    gas: "0x5208",
    maxFeePerGas: "0x4e3b29200",
    maxPriorityFeePerGas: "0x4e3b29200",
    type: "0x2",
  };
}

function omitUnsignedTxJson(...keys: string[]): string {
  const obj = unsignedTxJsonBase();
  for (const key of keys) {
    delete obj[key];
  }
  return JSON.stringify(obj);
}

export const UNSIGNED_TX_JSON = JSON.stringify(unsignedTxJsonBase());

export const UNSIGNED_TX_JSON_NO_CHAIN_ID = omitUnsignedTxJson("chainId");
export const UNSIGNED_TX_JSON_NO_FROM = omitUnsignedTxJson("from");
export const UNSIGNED_TX_JSON_NO_NONCE = omitUnsignedTxJson("nonce");

export const UNSIGNED_TX_JSON_TO_DATA_ONLY = JSON.stringify({
  to: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
  data: CALLDATA_HEX,
});

function hexBigInt(value: bigint): string {
  return `0x${value.toString(16)}`;
}

const signedParsed = parseTransaction(SIGNED_TX_HEX);

export const SIGNED_TX_JSON = JSON.stringify({
  from: SIGNED_TX_FROM,
  to: signedParsed.to,
  data: signedParsed.data ?? "0x",
  value: hexBigInt(signedParsed.value ?? 0n),
  chainId: hexBigInt(BigInt(signedParsed.chainId ?? 1)),
  nonce: hexBigInt(BigInt(signedParsed.nonce ?? 0)),
  gas: hexBigInt("gas" in signedParsed ? (signedParsed.gas ?? 0n) : 0n),
  maxFeePerGas: hexBigInt(
    "maxFeePerGas" in signedParsed ? (signedParsed.maxFeePerGas ?? 0n) : 0n,
  ),
  maxPriorityFeePerGas: hexBigInt(
    "maxPriorityFeePerGas" in signedParsed ? (signedParsed.maxPriorityFeePerGas ?? 0n) : 0n,
  ),
  type: "0x2",
  v: hexBigInt("v" in signedParsed && signedParsed.v !== undefined ? BigInt(signedParsed.v) : 0n),
  r: "r" in signedParsed ? signedParsed.r : undefined,
  s: "s" in signedParsed ? signedParsed.s : undefined,
});
