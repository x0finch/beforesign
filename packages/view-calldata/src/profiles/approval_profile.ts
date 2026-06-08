import type { AlertItem } from "@beforesign/json-render-catalog";
import { MAX_UINT256 } from "../format_field.ts";
import type { ViewFieldDescriptor } from "../field_descriptor.ts";
import type { CalldataViewContext } from "./context.ts";
import { CalldataProfile } from "./calldata_profile.ts";

const APPROVAL_SELECTORS = new Set([
  "0x095ea7b3",
  "0x39509351",
  "0xa22cb465",
]);

const ALLOWANCE_ARG_IDS = [
  "calldata.args.amount",
  "calldata.args.value",
  "calldata.args.approved",
];

export class ApprovalProfile extends CalldataProfile {
  readonly id = "approval" as const;
  readonly priority = 80;

  match(ctx: CalldataViewContext): boolean {
    const selector = ctx.tree.selector.toLowerCase();
    if (APPROVAL_SELECTORS.has(selector)) return true;
    const fn = ctx.tree.functionName?.toLowerCase() ?? "";
    return fn.includes("approve") || fn.includes("allowance");
  }

  summary(ctx: CalldataViewContext): string {
    const fn = ctx.tree.functionName ?? "approval";
    return `Token approval: verify ${fn} recipient and allowance before signing`;
  }

  title(ctx: CalldataViewContext): string {
    void ctx;
    return "Token Approval";
  }

  protected buildFieldOverrides(
    ctx: CalldataViewContext,
    fields: ViewFieldDescriptor[],
  ): Map<string, Partial<ViewFieldDescriptor>> {
    void ctx;
    const highlight = this.highlightIds(fields, [
      "calldata.args.spender",
      "calldata.args.operator",
      ...ALLOWANCE_ARG_IDS,
    ]);

    const labels = new Map<string, Partial<ViewFieldDescriptor>>();
    for (const id of ALLOWANCE_ARG_IDS) {
      if (fields.some((field) => field.id === id)) {
        labels.set(id, { label: "Allowance" });
      }
    }
    if (fields.some((field) => field.id === "calldata.args.spender")) {
      labels.set("calldata.args.spender", { label: "Spender" });
    }
    if (fields.some((field) => field.id === "calldata.args.operator")) {
      labels.set("calldata.args.operator", { label: "Operator" });
    }

    const allowanceId = this.firstExistingFieldId(fields, ALLOWANCE_ARG_IDS);
    const allowance = allowanceId
      ? fields.find((field) => field.id === allowanceId)
      : undefined;
    const risk =
      allowanceId && allowance?.value === MAX_UINT256
        ? this.setRiskOnId(fields, allowanceId, "destructive")
        : new Map<string, Partial<ViewFieldDescriptor>>();

    return this.mergeOverrides(highlight, labels, risk);
  }

  protected buildWarnings(
    ctx: CalldataViewContext,
    fields: ViewFieldDescriptor[],
    overrides: Map<string, Partial<ViewFieldDescriptor>>,
  ): AlertItem[] {
    void ctx;
    void overrides;
    const allowanceId = this.firstExistingFieldId(fields, ALLOWANCE_ARG_IDS);
    const allowance = allowanceId
      ? fields.find((field) => field.id === allowanceId)
      : undefined;

    if (allowance?.value === MAX_UINT256) {
      return [
        {
          severity: "destructive",
          message: "Allowance is unlimited (max uint256)",
          code: "unlimitedAllowance",
        },
      ];
    }

    return [];
  }
}
