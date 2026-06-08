import { describe, expect, it } from "vitest";
import { findBigIntPaths } from "@beforesign/core";
import { createDepsFromKeys, parseInput } from "./index.ts";

const HASH =
  "0x945840884f6f041527cb5063e835152e9e349053b07b2c21b2eb52d48933a852";

describe("repro user tx hash", () => {
  it("parses without bigint serialization error", async () => {
    const deps = createDepsFromKeys({
      etherscanApiKey: process.env.ETHERSCAN_API_KEY ?? "",
      debankAccessKey: process.env.DEBANK_ACCESS_KEY ?? "",
      tenderlyAccessKey: process.env.TENDERLY_ACCESS_KEY ?? "",
    });

    const result = await parseInput({ raw: HASH }, deps);
    expect(result.kind).toBe("txHash");
    expect(findBigIntPaths(result)).toEqual([]);
    expect(() => JSON.stringify(result)).not.toThrow();
  }, 60_000);
});
