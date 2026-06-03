export function get_api_keys() {
  return {
    etherscan_api_key: process.env.ETHERSCAN_API_KEY ?? "",
    debank_access_key: process.env.DEBANK_ACCESS_KEY ?? "",
    blockscout_api_key: process.env.BLOCKSCOUT_API_KEY ?? "",
  };
}
