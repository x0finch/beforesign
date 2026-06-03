import {
  createBlockscoutClient,
  createDebankClient,
  createEtherscanClient,
} from "@beforesign/clients";
import type { ParseInputDeps } from "./parse_input.ts";

export type ApiKeys = {
  etherscanApiKey: string;
  debankAccessKey: string;
  blockscoutApiKey: string;
};

export function createDepsFromKeys(keys: ApiKeys): ParseInputDeps {
  return {
    blockscout: createBlockscoutClient({
      apiKey: keys.blockscoutApiKey || "missing",
    }),
    etherscan: createEtherscanClient({
      apiKey: keys.etherscanApiKey || "missing",
    }),
    debank: createDebankClient({
      accessKey: keys.debankAccessKey || "missing",
    }),
    blockscoutEnabled: Boolean(keys.blockscoutApiKey),
    etherscanEnabled: Boolean(keys.etherscanApiKey),
    debankEnabled: Boolean(keys.debankAccessKey),
  };
}
