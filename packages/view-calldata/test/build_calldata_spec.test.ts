import { describe, expect, it } from "vitest";
import { parseCalldata } from "@beforesign/calldata-parse";
import { validateSpec, type ViewElement } from "@beforesign/json-render-catalog";
import { CALLDATA_HEX } from "@beforesign/test-fixtures";
import { buildCalldataSpec } from "../src/build_calldata_spec.ts";
import {
  APPROVE_SELECTOR_ABI,
  MOCK_SELECTOR_ABI,
  TRANSFER_SELECTOR_ABI,
} from "./helpers/mock_abi.ts";

const safeExecCalldata =
  "0x6a761202000000000000000000000000a0b86991c6218b36c1d19d4a2e9eb0ce3606eb480000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000014000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001c00000000000000000000000000000000000000000000000000000000000000044a9059cbb000000000000000000000000d8da6bf26964af9d7eed9e03e53415d37aa960450000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000" as const;

const approveUnlimitedCalldata =
  "0x095ea7b3000000000000000000000000d8da6bf26964af9d7eed9e03e53415d37aa96045ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff" as const;

const multicall3Calldata =
  "0x82ad56cb0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000120000000000000000000000000a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000044a9059cbb000000000000000000000000d8da6bf26964af9d7eed9e03e53415d37aa96045000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000044a9059cbb000000000000000000000000d8da6bf26964af9d7eed9e03e53415d37aa96045000000000000000000000000000000000000000000000000000000000000000300000000000000000000000000000000000000000000000000000000" as const;

function specElements(spec: ReturnType<typeof buildCalldataSpec>["spec"]): ViewElement[] {
  return Object.values(spec.elements as Record<string, ViewElement>);
}

function specElementMap(
  spec: ReturnType<typeof buildCalldataSpec>["spec"],
): Record<string, ViewElement> {
  return spec.elements as Record<string, ViewElement>;
}

function fieldLabels(spec: ReturnType<typeof buildCalldataSpec>["spec"]): string[] {
  return specElements(spec)
    .filter((element) => element.type === "Field")
    .map((element) => element.props.label as string);
}

function accordionTitles(spec: ReturnType<typeof buildCalldataSpec>["spec"]): string[] {
  return specElements(spec)
    .filter((element) => element.type === "Accordion")
    .map((element) => element.props.title as string);
}

function elementTypes(spec: ReturnType<typeof buildCalldataSpec>["spec"]): string[] {
  const elements = specElementMap(spec);
  const walk = (id: string): string[] => {
    const element = elements[id];
    if (!element) return [];
    const types = [element.type];
    for (const childId of element.children) {
      types.push(...walk(childId));
    }
    return types;
  };
  return walk(spec.root);
}

function findAccordionByTitle(
  spec: ReturnType<typeof buildCalldataSpec>["spec"],
  pattern: RegExp,
): ViewElement | undefined {
  return specElements(spec).find(
    (element) => element.type === "Accordion" && pattern.test(element.props.title as string),
  );
}

function findFieldIdByLabel(
  spec: ReturnType<typeof buildCalldataSpec>["spec"],
  label: string,
): string | undefined {
  const entry = Object.entries(specElementMap(spec)).find(
    ([, element]) => element.type === "Field" && element.props.label === label,
  );
  return entry?.[0];
}

function childFollows(
  spec: ReturnType<typeof buildCalldataSpec>["spec"],
  parentAccordion: ViewElement,
  afterLabel: string,
  nextTitlePattern: RegExp,
): boolean {
  const elements = specElementMap(spec);
  const afterFieldId = findFieldIdByLabel(spec, afterLabel);
  const nextAccordion = specElements(spec).find(
    (element) => element.type === "Accordion" && nextTitlePattern.test(element.props.title as string),
  );
  if (!afterFieldId || !nextAccordion) return false;

  const nextAccordionId = Object.entries(elements).find(([, element]) => element === nextAccordion)?.[0];
  if (!nextAccordionId) return false;

  const children = parentAccordion.children;
  const afterIndex = children.indexOf(afterFieldId);
  const nextIndex = children.indexOf(nextAccordionId);
  return afterIndex >= 0 && nextIndex === afterIndex + 1;
}

describe("buildCalldataSpec", () => {
  it("builds a valid transfer spec with highlighted root args only", async () => {
    const tree = await parseCalldata(CALLDATA_HEX, { abi: TRANSFER_SELECTOR_ABI });
    const result = buildCalldataSpec({ tree });

    expect(validateSpec(result.spec).valid).toBe(true);
    expect(result.scenarioId).toBe("generic");
    expect(result.title).toBe("Contract Calldata");
    expect(result.summary).toContain("transfer");

    const labels = fieldLabels(result.spec);
    expect(labels).not.toContain("Selector");
    expect(labels).not.toContain("Function");
    expect(labels).toContain("recipient");
    expect(labels).toContain("amount");

    const types = elementTypes(result.spec);
    expect(types).toEqual(["Card", "Stack", "Section", "Accordion", "Field", "Field"]);

    const recipientField = specElements(result.spec).find(
      (element) => element.type === "Field" && element.props.label === "recipient",
    );
    expect(recipientField?.props.highlight).toBe(true);
  });

  it("builds safe_exec with inner accordion after Data field", async () => {
    const tree = await parseCalldata(safeExecCalldata, {
      resolveAbi: async ({ selector }) => MOCK_SELECTOR_ABI[selector.toLowerCase()],
    });
    const result = buildCalldataSpec({ tree });

    expect(validateSpec(result.spec).valid).toBe(true);
    expect(accordionTitles(result.spec)).toHaveLength(2);

    const rootAccordion = findAccordionByTitle(result.spec, /0x6a761202/);
    const innerAccordion = findAccordionByTitle(result.spec, /0xa9059cbb/);
    expect(rootAccordion?.props.title).toContain("execTransaction");
    expect(rootAccordion?.props.defaultExpanded).toBe(true);
    expect(innerAccordion?.props.defaultExpanded).toBe(false);

    const labels = fieldLabels(result.spec);
    expect(labels).not.toContain("Summary (2)");
    expect(labels).not.toContain("Target (2)");
    expect(labels).toContain("recipient");

    expect(rootAccordion).toBeTruthy();
    expect(
      childFollows(result.spec, rootAccordion!, "data", /transfer · 0xa9059cbb|0xa9059cbb/),
    ).toBe(true);
  });

  it("builds multicall3 with inner accordions after callData fields", async () => {
    const tree = await parseCalldata(multicall3Calldata, {
      resolveAbi: async ({ selector }) => MOCK_SELECTOR_ABI[selector.toLowerCase()],
    });
    const result = buildCalldataSpec({ tree });

    expect(validateSpec(result.spec).valid).toBe(true);
    expect(accordionTitles(result.spec).length).toBeGreaterThanOrEqual(3);

    const rootAccordion = findAccordionByTitle(result.spec, /aggregate3|0x82ad56cb/i);
    expect(rootAccordion).toBeTruthy();

    const innerAccordions = specElements(result.spec).filter(
      (element) =>
        element.type === "Accordion" &&
        (element.props.title as string).includes("0xa9059cbb"),
    );
    expect(innerAccordions.length).toBe(2);

    const callDataFields = specElements(result.spec).filter(
      (element) => element.type === "Field" && element.props.label === "callData",
    );
    expect(callDataFields.length).toBeGreaterThanOrEqual(2);
  });

  it("builds approval spec with destructive allowance warning", async () => {
    const tree = await parseCalldata(approveUnlimitedCalldata, { abi: APPROVE_SELECTOR_ABI });
    const result = buildCalldataSpec({ tree });

    expect(validateSpec(result.spec).valid).toBe(true);
    expect(result.scenarioId).toBe("approval");
    expect(result.title).toBe("Token Approval");

    const alertList = specElements(result.spec).find((element) => element.type === "AlertList");
    expect(alertList?.props.items).toEqual([
      {
        severity: "destructive",
        message: "Allowance is unlimited (max uint256)",
        code: "unlimitedAllowance",
      },
    ]);

    const allowanceField = specElements(result.spec).find(
      (element) => element.type === "Field" && element.props.label === "Allowance",
    );
    expect(allowanceField?.props.risk).toBe("destructive");
  });

  it("includes contract address field when provided", async () => {
    const tree = await parseCalldata(CALLDATA_HEX, { abi: TRANSFER_SELECTOR_ABI });
    const contractAddress = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
    const result = buildCalldataSpec({ tree, contractAddress });

    const contractField = specElements(result.spec).find(
      (element) => element.type === "Field" && element.props.label === "Contract",
    );
    expect(contractField?.props.value).toBe(contractAddress);
    expect(contractField?.props.highlight).toBe(true);
  });
});
