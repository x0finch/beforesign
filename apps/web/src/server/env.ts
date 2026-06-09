import { env as cloudflareEnv } from "cloudflare:workers";

type EnvSource = Record<string, string | undefined>;

function readEnv(source: EnvSource, key: string): string | undefined {
  const value = source[key]?.trim();
  return value || undefined;
}

function getEnvSource(): EnvSource {
  const cf = cloudflareEnv as unknown as EnvSource;
  return new Proxy(cf, {
    get(target, prop: string) {
      return target[prop] ?? process.env[prop];
    },
  });
}

export function getApiKeys() {
  const source = getEnvSource();
  return {
    etherscanApiKey: readEnv(source, "ETHERSCAN_API_KEY") ?? "",
    debankAccessKey: readEnv(source, "DEBANK_ACCESS_KEY") ?? "",
    tenderlyAccessKey: readEnv(source, "TENDERLY_ACCESS_KEY") ?? "",
  };
}

export function getLlmConfig():
  | { apiKey: string; baseUrl?: string; model: string }
  | undefined {
  const source = getEnvSource();
  const apiKey = readEnv(source, "LLM_API_KEY");
  if (!apiKey) return undefined;
  return {
    apiKey,
    baseUrl: readEnv(source, "LLM_BASE_URL"),
    model: readEnv(source, "LLM_MODEL") ?? "gpt-4o-mini",
  };
}

export function isLlmConfigured(): boolean {
  return Boolean(readEnv(getEnvSource(), "LLM_API_KEY"));
}
