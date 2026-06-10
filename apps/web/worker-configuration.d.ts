declare namespace Cloudflare {
  interface Env {
    LLM_API_KEY?: string;
    LLM_BASE_URL?: string;
    LLM_MODEL?: string;
    ETHERSCAN_API_KEY?: string;
    DEBANK_ACCESS_KEY?: string;
    TENDERLY_ACCESS_KEY?: string;
  }
}

interface Env extends Cloudflare.Env {}
