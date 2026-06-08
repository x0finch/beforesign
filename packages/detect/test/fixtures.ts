/** EIP-1559 unsigned tx RLP (viem serializeTransaction, hardhat account #0) */
export const UNSIGNED_TX_HEX =
  "0x02e80180843b9aca008504a817c80082520894c02aaa39b223fe8d0a0e5c4f27ead9083c756cc28080c0";

/** EIP-1559 signed tx RLP (viem signTransaction, hardhat account #0) */
export const SIGNED_TX_HEX =
  "0x02f86b0180843b9aca008504a817c80082520894c02aaa39b223fe8d0a0e5c4f27ead9083c756cc28080c001a06f6605bebe23e5810ee1781153631f9c2d0f775056fa832d2ab6b5ce804cf12ca0790803f8d8030469fb929b5e9acdb1c58f310f708ef765d756b4d5778ddf0e53";

/** Known-good short calldata: transfer(address,uint256) with dummy args */
export const CALLDATA_HEX =
  "0xa9059cbb000000000000000000000000d8da6bf26964af9d7eed9e03e53415d37aa960450000000000000000000000000000000000000000000000000000000000000001";

export const TX_HASH =
  "0xbc78ab8a9e9a0bca7d0321a27b2c03addeae08ba81ea98b03cd3dd237eabed44";

export const METAMASK_UNSIGNED_JSON = JSON.stringify({
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
});

export const TYPED_DATA_JSON = JSON.stringify({
  types: {
    EIP712Domain: [
      { name: "name", type: "string" },
      { name: "version", type: "string" },
      { name: "chainId", type: "uint256" },
      { name: "verifyingContract", type: "address" },
    ],
    Permit: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" },
      { name: "value", type: "uint256" },
      { name: "nonce", type: "uint256" },
      { name: "deadline", type: "uint256" },
    ],
  },
  primaryType: "Permit",
  domain: {
    name: "Test",
    version: "1",
    chainId: 1,
    verifyingContract: "0x0000000000000000000000000000000000000001",
  },
  message: {
    owner: "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
    spender: "0x0000000000000000000000000000000000000002",
    value: "1000000000000000000",
    nonce: 0,
    deadline: 9999999999,
  },
});

const ETHERSCAN_TX_RESPONSE = {
  result: {
    from: "0x00192fb10df37c9fb26829eb2cc623cd1bf599e8",
    to: "0xc67f4e626ee4d3f272c2fb31bad60761ab55ed9f",
    input: "0x",
    value: "0x19755d4ce12c00",
    chainId: "0x1",
    nonce: "0x33b79d",
    gas: "0x5208",
    type: "0x2",
    v: "0x0",
    r: "0xa681faea68ff81d191169010888bbbe90ec3eb903e31b0572cd34f13dae281b9",
    s: "0x3f59b0fa5ce6cf38aff2cfeb68e7a503ceda2a72b4442c7e2844d63544383e3",
  },
};

/** MetaMask-style signed tx JSON mapped from ETHERSCAN_TX_RESPONSE.result */
export const SIGNED_TX_JSON = JSON.stringify({
  from: ETHERSCAN_TX_RESPONSE.result.from,
  to: ETHERSCAN_TX_RESPONSE.result.to,
  data: ETHERSCAN_TX_RESPONSE.result.input,
  value: ETHERSCAN_TX_RESPONSE.result.value,
  chainId: ETHERSCAN_TX_RESPONSE.result.chainId,
  nonce: ETHERSCAN_TX_RESPONSE.result.nonce,
  gas: ETHERSCAN_TX_RESPONSE.result.gas,
  type: ETHERSCAN_TX_RESPONSE.result.type,
  v: ETHERSCAN_TX_RESPONSE.result.v,
  r: ETHERSCAN_TX_RESPONSE.result.r,
  s: ETHERSCAN_TX_RESPONSE.result.s,
});
