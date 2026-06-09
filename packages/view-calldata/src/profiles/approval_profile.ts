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

const ALLOWANCE_ARG_NAMES = ["amount", "value", "approved"] as const;

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
    const highlight = this.highlightIds(fields, [
      ...this.rootArgFieldIdsByNames(ctx, ["spender", "operator", ...ALLOWANCE_ARG_NAMES]),
    ]);

    const labels = new Map<string, Partial<ViewFieldDescriptor>>();
    for (const name of ALLOWANCE_ARG_NAMES) {
      const id = this.rootArgFieldId(ctx, name);
      if (id && fields.some((field) => field.id === id)) {
        labels.set(id, { label: "Allowance" });
      }
    }
    const spenderId = this.rootArgFieldId(ctx, "spender");
    if (spenderId && fields.some((field) => field.id === spenderId)) {
      labels.set(spenderId, { label: "Spender" });
    }
    const operatorId = this.rootArgFieldId(ctx, "operator");
    if (operatorId && fields.some((field) => field.id === operatorId)) {
      labels.set(operatorId, { label: "Operator" });
    }

    const allowanceIds = this.rootArgFieldIdsByNames(ctx, [...ALLOWANCE_ARG_NAMES]);
    const allowanceId = this.firstExistingFieldId(fields, allowanceIds);
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
    void overrides;
    const fn = ctx.tree.functionName?.toLowerCase() ?? "";
    if (fn.includes("setapprovalforall")) {
      return [
        {
          severity: "destructive",
          message: "setApprovalForAll affects all tokens in collection",
          code: "approvalForAll",
        },
      ];
    }

    const allowanceIds = this.rootArgFieldIdsByNames(ctx, [...ALLOWANCE_ARG_NAMES]);
    const allowanceId = this.firstExistingFieldId(fields, allowanceIds);
    const allowance = allowanceId
      ? fields.find((field) => field.id === allowanceId)
      : undefined;

    if (allowance?.value === MAX_UINT256) {
      return [
        {
          severity: "destructive",
          message: "Unlimited token approval detected",
          code: "unlimitedApproval",
        },
      ];
    }

    return [];
  }
}
