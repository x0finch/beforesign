export function getApiKeys() {
  return {
    etherscanApiKey: process.env.ETHERSCAN_API_KEY ?? "",
    debankAccessKey: process.env.DEBANK_ACCESS_KEY ?? "",
    tenderlyAccessKey: process.env.TENDERLY_ACCESS_KEY ?? "",
  };
}

export function getLlmConfig():
  | { apiKey: string; baseUrl?: string; model: string }
  | undefined {
  const apiKey = process.env.LLM_API_KEY?.trim();
  if (!apiKey) return undefined;
  return {
    apiKey,
    baseUrl: process.env.LLM_BASE_URL?.trim() || undefined,
    model: process.env.LLM_MODEL?.trim() || "gpt-4o-mini",
  };
}

export function isLlmConfigured(): boolean {
  return Boolean(process.env.LLM_API_KEY?.trim());
}
