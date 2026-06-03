export function getApiKeys() {
  return {
    etherscanApiKey: process.env.ETHERSCAN_API_KEY ?? "",
    debankAccessKey: process.env.DEBANK_ACCESS_KEY ?? "",
    blockscoutApiKey: process.env.BLOCKSCOUT_API_KEY ?? "",
  };
}
