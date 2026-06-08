/** Known-good short calldata: transfer(address,uint256) with dummy args */
export const CALLDATA_HEX =
  "0xa9059cbb000000000000000000000000d8da6bf26964af9d7eed9e03e53415d37aa960450000000000000000000000000000000000000000000000000000000000000001";

export const TX_HASH =
  "0xbc78ab8a9e9a0bca7d0321a27b2c03addeae08ba81ea98b03cd3dd237eabed44";

export const TENDERLY_SEARCH_SINGLE = {
  transactions: [
    {
      hash: TX_HASH,
      block_number: 13579024,
      from: "0x00192fb10df37c9fb26829eb2cc623cd1bf599e8",
      to: "0xc67f4e626ee4d3f272c2fb31bad60761ab55ed9f",
      input: CALLDATA_HEX,
      value: "0x19755d4ce12c00",
      nonce: 3381149,
      gas: 21000,
      gas_used: 21000,
      gas_price: 111402282825,
      gas_fee_cap: 135000000000,
      gas_tip_cap: 1000000000,
      network_id: "1",
      status: true,
      method: "transfer(address,uint256)",
      timestamp: "2022-08-02T07:18:05.000000Z",
    },
  ],
};

export const TENDERLY_SEARCH_NATIVE = {
  transactions: [
    {
      hash: TX_HASH,
      block_number: 13579024,
      from: "0x00192fb10df37c9fb26829eb2cc623cd1bf599e8",
      to: "0xc67f4e626ee4d3f272c2fb31bad60761ab55ed9f",
      input: "0x",
      value: "0x19755d4ce12c00",
      nonce: 3381149,
      gas: 21000,
      gas_used: 21000,
      gas_price: 111402282825,
      network_id: "1",
      status: true,
      method: "",
      timestamp: "2022-08-02T07:18:05.000000Z",
    },
  ],
};

export const TENDERLY_SEARCH_AMBIGUOUS = {
  transactions: [
    {
      hash: TX_HASH,
      block_number: 13579024,
      from: "0x00192fb10df37c9fb26829eb2cc623cd1bf599e8",
      to: "0xc67f4e626ee4d3f272c2fb31bad60761ab55ed9f",
      input: "0x",
      value: "0x0",
      nonce: 1,
      gas: 21000,
      gas_used: 21000,
      gas_price: 1,
      network_id: "1",
      status: true,
    },
    {
      hash: TX_HASH,
      block_number: 100,
      from: "0x00192fb10df37c9fb26829eb2cc623cd1bf599e8",
      to: "0xc67f4e626ee4d3f272c2fb31bad60761ab55ed9f",
      input: "0x",
      value: "0x0",
      nonce: 1,
      gas: 21000,
      gas_used: 21000,
      gas_price: 1,
      network_id: "8453",
      status: true,
    },
  ],
};
