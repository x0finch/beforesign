/** Minimal valid EIP-1559 signed tx RLP (example from viem docs style) */
export const signed_tx_hex =
  "0x02f87382012c8509184e72a00082520894b0897686c54517fcfcc93c46ebd279999c315ace880de0b6b3a764000080c080a820f4f5a071c2f1e2e4e4e4e4e4e4e4e4e4e4e4e4e4e4e4e4e4e4e4e4e4e4e4e4e4e4e4e4e4e4e4e4e4e4e4e4e4e4";

/** Known-good short calldata: transfer(address,uint256) with dummy args */
export const calldata_hex =
  "0xa9059cbb000000000000000000000000d8da6bf26964af9d7eed9e03e53415d37aa960450000000000000000000000000000000000000000000000000000000000000001";

export const tx_hash =
  "0xbc78ab8a9e9a0bca7d0321a27b2c03addeae08ba81ea98b03cd3dd237eabed44";

export const metamask_unsigned_json = JSON.stringify({
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

export const typed_data_json = JSON.stringify({
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

export const blockscout_single_hit = {
  transactions: [
    {
      chain_id: 1,
      chain_name: "Ethereum",
      hash: tx_hash,
      from: "0x00192fb10df37c9fb26829eb2cc623cd1bf599e8",
      to: "0xc67f4e626ee4d3f272c2fb31bad60761ab55ed9f",
    },
  ],
};

export const etherscan_tx_response = {
  jsonrpc: "2.0",
  id: 1,
  result: {
    blockHash: "0xf850331061196b8f2b67e1f43aaa9e69504c059d3d3fb9547b04f9ed4d141ab7",
    blockNumber: "0xcf2420",
    from: "0x00192fb10df37c9fb26829eb2cc623cd1bf599e8",
    gas: "0x5208",
    hash: tx_hash,
    input: "0x",
    nonce: "0x33b79d",
    to: "0xc67f4e626ee4d3f272c2fb31bad60761ab55ed9f",
    transactionIndex: "0x5b",
    value: "0x19755d4ce12c00",
    type: "0x2",
    chainId: "0x1",
    v: "0x0",
    r: "0xa681faea68ff81d191169010888bbbe90ec3eb903e31b0572cd34f13dae281b9",
    s: "0x3f59b0fa5ce6cf38aff2cfeb68e7a503ceda2a72b4442c7e2844d63544383e3",
    yParity: "0x0",
  },
};
