import { describe, expect, it, vi } from "vitest";
import type { AiPipelineDeps } from "@beforesign/ai-pipeline";
import { normalizeAskInput } from "../src/normalize_ask_input.ts";
import type { BeforeSignRunContext } from "../src/run_context.ts";
import { createEmptySession } from "../src/session_state.ts";
import { runBuildViewAction, runParseCalldataAction } from "../src/tool_actions.ts";
import type { AskSseEvent } from "../src/types.ts";

const FIXTURE_TX_HASH =
  "0x945840884f6f041527cb5063e835152e9e349053b07b2c21b2eb52d48933a852";

const CALLDATA_HEX =
  "0xa9059cbb000000000000000000000000d8da6bf26964af9d7eed9e03e53415d37aa960450000000000000000000000000000000000000000000000000000000000000001";

function mockDeps(): AiPipelineDeps {
  return {
    txLookup: {
      searchQuick: vi.fn().mockResolvedValue({
        status: "resolved",
        hits: [
          {
            id: `1-${FIXTURE_TX_HASH}`,
            chainId: 1,
            chainName: "Ethereum",
            blockNumber: 25271264,
            from: "0x63259a528b9186992e55b265b2bd05eee8df64e1",
            to: "0xca11bde05977b3631167028862be2a173976ca11",
          },
        ],
        resolvedChainId: 1,
      }),
      getTransaction: vi.fn().mockResolvedValue({
        tx: {
          chainId: 1,
          from: "0x63259a528b9186992e55b265b2bd05eee8df64e1",
          to: "0xca11bde05977b3631167028862be2a173976ca11",
          value: "0",
          data: CALLDATA_HEX,
          hash: FIXTURE_TX_HASH,
        },
        onchain: { chainId: 1, status: "success", blockNumber: 25271264n },
      }),
    },
    etherscan: { getTransaction: vi.fn(), getTokenInfo: vi.fn() },
    debank: { preExecTx: vi.fn(), explainTx: vi.fn() },
    signatureLookup: {
      resolveBySelector: vi.fn(async (selector: string) => {
        if (selector.toLowerCase() === "0xa9059cbb") {
          return [
            {
              type: "function",
              name: "transfer",
              inputs: [
                { name: "recipient", type: "address", internalType: "address" },
                { name: "amount", type: "uint256", internalType: "uint256" },
              ],
              outputs: [{ name: "", type: "bool", internalType: "bool" }],
              stateMutability: "nonpayable",
            },
          ];
        }
        return undefined;
      }),
    },
    txLookupEnabled: true,
  };
}

function createRunContext(
  normalized: ReturnType<typeof normalizeAskInput>,
  deps: AiPipelineDeps,
) {
  const events: AskSseEvent[] = [];
  const runContext: BeforeSignRunContext = {
    session: createEmptySession(),
    deps,
    locale: normalized.locale,
    normalized,
    emit: (event) => {
      events.push(event);
    },
  };
  return { runContext, events };
}

describe("runBuildViewAction", () => {
  it("returns transaction view spec only without auto-drilling calldata", async () => {
    const normalized = normalizeAskInput({
      message: FIXTURE_TX_HASH,
      raw: FIXTURE_TX_HASH,
      locale: "en",
    });
    const deps = mockDeps();
    const { runContext, events } = createRunContext(normalized, deps);

    const result = await runBuildViewAction(runContext);

    expect(result.ok).toBe(true);
    const payload = JSON.parse(result.message);
    expect(payload.spec).toBeDefined();
    expect(payload.spec).toEqual(runContext.latestParseResult?.view?.spec);
    expect(runContext.latestParseResult?.kind).toBe("txHash");
    expect(events.filter((event) => event.type === "parse_result").length).toBe(1);
  });
});

describe("runParseCalldataAction", () => {
  it("decodes calldata after build_view when called separately", async () => {
    const normalized = normalizeAskInput({
      message: FIXTURE_TX_HASH,
      raw: FIXTURE_TX_HASH,
      locale: "en",
    });
    const deps = mockDeps();
    const { runContext, events } = createRunContext(normalized, deps);

    await runBuildViewAction(runContext);
    const result = await runParseCalldataAction(runContext);

    expect(result.ok).toBe(true);
    expect(runContext.latestParseResult?.kind).toBe("calldata");
    expect(events.filter((event) => event.type === "parse_result").length).toBe(2);
    const payload = JSON.parse(result.message);
    expect(payload.spec).toEqual(runContext.latestParseResult?.view?.spec);
  });
});
