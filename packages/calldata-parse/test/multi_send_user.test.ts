import { describe, expect, it } from "vitest";
import { slice } from "viem";
import { parseCalldata } from "../src/parse_calldata.ts";
import { resolveViewNodePath } from "../src/resolve_source_path.ts";
import { userMultiSendCalldata } from "./fixtures/inputs.ts";

describe("user multiSend regression", () => {
  it("unwraps three inner calls from packed transactions", async () => {
    const tree = await parseCalldata(userMultiSendCalldata);
    expect(tree.functionName).toBe("multiSend");
    expect(tree.children).toHaveLength(3);
    expect(tree.children[0]?.selector).toBe("0xbd86e508");
    expect(tree.children[1]?.selector).toBe("0xbf6213e4");
    expect(tree.children[2]?.selector).toBe("0x0087b83f");
  });

  it("assigns distinct view paths for each multiSend child", async () => {
    const tree = await parseCalldata(userMultiSendCalldata);
    expect(resolveViewNodePath(undefined, tree.children[0]!, 0)).toBe("0#0");
    expect(resolveViewNodePath(undefined, tree.children[1]!, 1)).toBe("0#1");
    expect(resolveViewNodePath(undefined, tree.children[2]!, 2)).toBe("0#2");
  });

  it("does not attach generic.bytes children without ABI decode", async () => {
    const tree = await parseCalldata(userMultiSendCalldata);
    for (const child of tree.children) {
      expect(child.children).toEqual([]);
      expect(slice(child.raw, 0, 4)).toBe(child.selector);
    }
  });
});
