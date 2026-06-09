import { describe, expect, it, vi } from "vitest";
import { parseInput } from "@beforesign/orchestrator";
import {
  CALLDATA_HEX,
  METAMASK_UNSIGNED_JSON,
} from "../../orchestrator/test/fixtures.ts";
import { assembleParseResult } from "../src/assemble_parse_result.ts";

const mockDeps = {
  txLookup: { searchQuick: vi.fn(), getTransaction: vi.fn() },
  etherscan: { getTransaction: vi.fn(), getTokenInfo: vi.fn() },
  debank: { preExecTx: vi.fn(), explainTx: vi.fn() },
  signatureLookup: { resolveBySelector: vi.fn().mockResolvedValue(undefined) },
  debankEnabled: false,
  txLookupEnabled: false,
};

describe("ai-pipeline aligns with orchestrator", () => {
  it("unsigned tx matches orchestrator parseInput", async () => {
    const input = { raw: METAMASK_UNSIGNED_JSON };
    const [orch, ai] = await Promise.all([
      parseInput(input, mockDeps),
      assembleParseResult(input, mockDeps),
    ]);
    expect(ai.kind).toBe(orch.kind);
    expect(ai.view?.title).toBe(orch.view?.title);
    expect(ai.summary).toBe(orch.summary);
  });

  it("calldata matches orchestrator parseInput", async () => {
    const input = { raw: CALLDATA_HEX };
    const [orch, ai] = await Promise.all([
      parseInput(input, mockDeps),
      assembleParseResult(input, mockDeps),
    ]);
    expect(ai.kind).toBe(orch.kind);
    expect(ai.view?.scenarioId).toBe(orch.view?.scenarioId);
  });
});
