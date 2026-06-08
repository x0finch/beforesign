export function getApiKeys() {
  return {
    etherscanApiKey: process.env.ETHERSCAN_API_KEY ?? "",
    debankAccessKey: process.env.DEBANK_ACCESS_KEY ?? "",
    tenderlyAccessKey: process.env.TENDERLY_ACCESS_KEY ?? "",
  };
}
