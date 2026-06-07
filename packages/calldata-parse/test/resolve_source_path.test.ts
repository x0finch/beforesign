import { describe, expect, it } from "vitest";
import { parseCalldata } from "../src/parse_calldata.ts";
import {
  buildArgChildLinks,
  childLinkKey,
  formatSourcePathLabel,
  normalizeHex,
  resolveSourcePath,
} from "../src/resolve_source_path.ts";
import { PARSE_FIXTURE_CASES } from "./fixtures/index.ts";
import { buildOptions } from "./helpers/serialize_tree.ts";

describe("resolveSourcePath", () => {
  it("walks aggregate3 callData path", async () => {
    const fixture = PARSE_FIXTURE_CASES.find((item) => item.name === "multicall3");
    expect(fixture).toBeDefined();
    const tree = await parseCalldata(fixture!.input, buildOptions(fixture!));

    const resolved = resolveSourcePath(tree, "0/0/2");
    expect(resolved?.value).toBe(
      "0xa9059cbb000000000000000000000000d8da6bf26964af9d7eed9e03e53415d37aa960450000000000000000000000000000000000000000000000000000000000000002",
    );
    expect(normalizeHex(resolved?.value)).toBe(normalizeHex(tree.children[0]?.raw));
  });

  it("walks execTransaction data path", async () => {
    const fixture = PARSE_FIXTURE_CASES.find((item) => item.name === "safeExec");
    expect(fixture).toBeDefined();
    const tree = await parseCalldata(fixture!.input, buildOptions(fixture!));

    const resolved = resolveSourcePath(tree, "2");
    expect(normalizeHex(resolved?.value)).toBe(normalizeHex(tree.children[0]?.raw));
  });

  it("walks multiSend transactions arg", async () => {
    const fixture = PARSE_FIXTURE_CASES.find((item) => item.name === "safeMultisend");
    expect(fixture).toBeDefined();
    const tree = await parseCalldata(fixture!.input, buildOptions(fixture!));

    const resolved = resolveSourcePath(tree, "0");
    expect(typeof resolved?.value).toBe("string");
    expect((resolved?.value as string).startsWith("0x")).toBe(true);
  });
});

describe("buildArgChildLinks", () => {
  it("links multicall children by unique sourcePath", async () => {
    const fixture = PARSE_FIXTURE_CASES.find((item) => item.name === "multicall3");
    const tree = await parseCalldata(fixture!.input, buildOptions(fixture!));
    const links = buildArgChildLinks(tree);

    expect(links.get("0/0/2")).toBe(tree.children[0]);
    expect(links.get("0/1/2")).toBe(tree.children[1]);
  });

  it("links multiSend children by sourcePath and index", async () => {
    const fixture = PARSE_FIXTURE_CASES.find((item) => item.name === "safeMultisend");
    const tree = await parseCalldata(fixture!.input, buildOptions(fixture!));
    const links = buildArgChildLinks(tree);

    expect(links.get(childLinkKey("0", tree.children[0]?.wrapper))).toBe(tree.children[0]);
    expect(links.get(childLinkKey("0", tree.children[1]?.wrapper))).toBe(tree.children[1]);
  });
});

describe("formatSourcePathLabel", () => {
  it("formats aggregate3 callData label", async () => {
    const fixture = PARSE_FIXTURE_CASES.find((item) => item.name === "multicall3");
    const tree = await parseCalldata(fixture!.input, buildOptions(fixture!));
    expect(formatSourcePathLabel(tree, "0/0/2")).toBe("calls[0].callData");
  });
});

describe("wrapper.sourcePath on fixtures", () => {
  it("multicall3 children expose index paths", async () => {
    const fixture = PARSE_FIXTURE_CASES.find((item) => item.name === "multicall3");
    const tree = await parseCalldata(fixture!.input, buildOptions(fixture!));
    expect(tree.children[0]?.wrapper?.sourcePath).toBe("0/0/2");
    expect(tree.children[1]?.wrapper?.sourcePath).toBe("0/1/2");
  });

  it("safeExec child exposes data path", async () => {
    const fixture = PARSE_FIXTURE_CASES.find((item) => item.name === "safeExec");
    const tree = await parseCalldata(fixture!.input, buildOptions(fixture!));
    expect(tree.children[0]?.wrapper?.sourcePath).toBe("2");
  });

  it("safeMultisend children expose transactions path", async () => {
    const fixture = PARSE_FIXTURE_CASES.find((item) => item.name === "safeMultisend");
    const tree = await parseCalldata(fixture!.input, buildOptions(fixture!));
    expect(tree.children[0]?.wrapper?.sourcePath).toBe("0");
    expect(tree.children[0]?.wrapper?.index).toBe(0);
    expect(tree.children[1]?.wrapper?.sourcePath).toBe("0");
    expect(tree.children[1]?.wrapper?.index).toBe(1);
  });
});
