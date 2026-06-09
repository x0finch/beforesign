import { describe, expect, it, vi } from "vitest";
import type { Abi, Address, Hex } from "viem";
import { encodeFunctionData } from "viem";
import { parseCalldata, findBySelector, walkLeaves } from "../src/parse_calldata.ts";
import { PARSE_FIXTURE_CASES } from "./fixtures/index.ts";
import {
  erc20TransferAbi,
  forwardBytesAbi,
  forwardCalldata,
  innerTransferCalldata,
  RECIPIENT,
  safeExecCalldata,
  TOKEN_A,
} from "./fixtures/inputs.ts";
import { buildOptions, serializeTree } from "./helpers/serialize_tree.ts";
import { buildResolveAbiFromMap } from "./helpers/resolve_abi_map.ts";

describe.each(PARSE_FIXTURE_CASES)("$name", (fixture) => {
  it("matches golden CalldataCall tree", async () => {
    const tree = await parseCalldata(fixture.input, buildOptions(fixture));
    expect(serializeTree(tree)).toEqual(fixture.output);
  });
});

describe("edge cases", () => {
  it("truncates at maxDepth", async () => {
    const tree = await parseCalldata(safeExecCalldata, { maxDepth: 0 });
    expect(tree.children).toEqual([]);
    expect(tree.functionName).toBe("execTransaction");
  });

  it("avoids infinite recursion when the same calldata appears twice", async () => {
    const loopCalldata = innerTransferCalldata;
    const tree = await parseCalldata(loopCalldata, {
      abi: erc20TransferAbi,
      maxDepth: 4,
    });
    expect(tree.functionName).toBe("transfer");
    expect(tree.children).toEqual([]);
  });

  it("calls resolveAbi once per target during a parse session", async () => {
    const resolveAbi = vi.fn(async ({ target }: { target?: string }) => {
      if (target?.toLowerCase() === TOKEN_A.toLowerCase()) return erc20TransferAbi as Abi;
      return undefined;
    });

    await parseCalldata(safeExecCalldata, { resolveAbi });
    expect(resolveAbi).toHaveBeenCalledTimes(1);
  });

  it("still unwraps children when resolveAbi returns undefined", async () => {
    const resolveAbi = vi.fn(async () => undefined);
    const tree = await parseCalldata(safeExecCalldata, { resolveAbi });
    expect(tree.children).toHaveLength(1);
    expect(tree.children[0]?.selector).toBe("0xa9059cbb");
    expect(tree.children[0]?.functionName).toBeUndefined();
  });

  it("drops generic.bytes children that fail ABI decode", async () => {
    const tree = await parseCalldata(forwardCalldata, { abi: forwardBytesAbi });
    expect(tree.functionName).toBe("forward");
    expect(tree.children).toEqual([]);
  });

  it("walkLeaves returns only leaf nodes", async () => {
    const fixture = PARSE_FIXTURE_CASES.find((item) => item.name === "safeMultisend");
    expect(fixture).toBeDefined();
    const tree = await parseCalldata(fixture!.input, buildOptions(fixture!));
    const leaves = walkLeaves(tree);
    expect(leaves).toHaveLength(2);
    expect(leaves.every((leaf) => leaf.children.length === 0)).toBe(true);
  });

  it("findBySelector searches nested calls", async () => {
    const fixture = PARSE_FIXTURE_CASES.find((item) => item.name === "safeExec");
    expect(fixture).toBeDefined();
    const tree = await parseCalldata(fixture!.input, buildOptions(fixture!));
    const matches = findBySelector(tree, "0xa9059cbb" as Hex);
    expect(matches).toHaveLength(1);
    expect(matches[0]?.depth).toBe(1);
  });

  it("uses resolveAbi root fallback from fixture helper", async () => {
    const resolveAbi = buildResolveAbiFromMap(
      { [TOKEN_A.toLowerCase()]: erc20TransferAbi as Abi },
      TOKEN_A,
    );
    const tree = await parseCalldata(innerTransferCalldata, { resolveAbi });
    expect(tree.functionName).toBe("transfer");
    expect(tree.args[0]?.name).toBe("to");
  });

  it("builds forward(bytes) calldata for generic bytes fixture input", () => {
    const data = encodeFunctionData({
      abi: [{ type: "function", name: "forward", inputs: [{ name: "data", type: "bytes" }], outputs: [] }],
      functionName: "forward",
      args: [innerTransferCalldata],
    });
    expect(data.startsWith("0x")).toBe(true);
    expect(RECIPIENT).toMatch(/^0x/);
  });
});

describe("Safe MultiSend packed format", () => {
  it("uses the 85-byte header defined in MultiSend.sol", async () => {
    const { encodeMultiSendTransaction, MULTISEND_TX_HEADER_BYTES, parseMultiSendTransactions } =
      await import("../src/unwrappers/safe_multi_send.ts");

    expect(MULTISEND_TX_HEADER_BYTES).toBe(85);

    const packed = encodeMultiSendTransaction({
      to: TOKEN_A,
      value: 1n,
      data: innerTransferCalldata,
      operation: 0,
    });
    const dataBytes = (packed.length - 2) / 2;
    expect(dataBytes).toBe(MULTISEND_TX_HEADER_BYTES + (innerTransferCalldata.length - 2) / 2);

    const payloads = parseMultiSendTransactions(packed);
    expect(payloads).toHaveLength(1);
    expect(payloads[0]?.operation).toBe("call");
    expect(payloads[0]?.target?.toLowerCase()).toBe(TOKEN_A.toLowerCase());
    expect(payloads[0]?.value).toBe(1n);
    expect(payloads[0]?.data).toBe(innerTransferCalldata);
  });

  it("parses DELEGATECALL (operation = 1) entries", async () => {
    const { encodeMultiSendTransaction, parseMultiSendTransactions } =
      await import("../src/unwrappers/safe_multi_send.ts");

    const packed = encodeMultiSendTransaction({
      to: TOKEN_A,
      value: 0n,
      data: innerTransferCalldata,
      operation: 1,
    });
    const payloads = parseMultiSendTransactions(packed);
    expect(payloads[0]?.operation).toBe("delegatecall");
  });

  it("preserves zero to address as encoded in calldata", async () => {
    const { encodeMultiSendTransaction, parseMultiSendTransactions } =
      await import("../src/unwrappers/safe_multi_send.ts");

    const zero = "0x0000000000000000000000000000000000000000" as Address;
    const packed = encodeMultiSendTransaction({
      to: zero,
      value: 0n,
      data: innerTransferCalldata,
    });
    const payloads = parseMultiSendTransactions(packed);
    expect(payloads[0]?.target).toBe(zero);
  });

  it("round-trips multiple packed entries", async () => {
    const { encodeMultiSendTransactions, parseMultiSendTransactions } =
      await import("../src/unwrappers/safe_multi_send.ts");

    const { TOKEN_B, secondTransferCalldata, innerTransferCalldata } =
      await import("./fixtures/inputs.ts");

    const packed = encodeMultiSendTransactions([
      { to: TOKEN_A, value: 0n, data: innerTransferCalldata },
      { to: TOKEN_B, value: 0n, data: secondTransferCalldata, operation: 1 },
    ]);
    const payloads = parseMultiSendTransactions(packed);
    expect(payloads).toHaveLength(2);
    expect(payloads[0]?.wrapper.index).toBe(0);
    expect(payloads[1]?.wrapper.index).toBe(1);
    expect(payloads[1]?.operation).toBe("delegatecall");
  });
});
