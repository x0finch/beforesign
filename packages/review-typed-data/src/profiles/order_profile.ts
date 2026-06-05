import type { ReviewCheckItem } from "@beforesign/core";
import type { TypedDataContext } from "./context.ts";
import { TypedDataProfile } from "./typed_data_profile.ts";

export class OrderProfile extends TypedDataProfile {
  readonly id = "order" as const;
  readonly priority = 60;

  match(ctx: TypedDataContext): boolean {
    const primary = ctx.normalized.primaryType;
    if (/order/i.test(primary)) return true;
    const domainName = this.getDomainString(ctx, "name") ?? "";
    if (/seaport|0x|blur/i.test(domainName)) return true;
    if (this.hasFields(ctx, ["offer"]) && this.hasFields(ctx, ["consideration"])) return true;
    return false;
  }

  summary(ctx: TypedDataContext): string {
    void ctx;
    return "Marketplace order: verify tokens offered, received, fees, and who can fill the order";
  }

  protected mutateChecks(checks: ReviewCheckItem[], ctx: TypedDataContext): ReviewCheckItem[] {
    const result = this.highlightIds(checks, this.summaryFocusIds(ctx, checks));
    const descriptions: Record<string, string> = {};

    const firstOffer = checks.find((c) => c.id.startsWith("message.offer"));
    if (firstOffer) {
      descriptions[firstOffer.id] =
        "Review which tokens and amounts you give versus receive";
    }

    const firstConsideration = checks.find((c) => c.id.startsWith("message.consideration"));
    if (firstConsideration) {
      descriptions[firstConsideration.id] =
        "Check fees, royalties, and extra consideration items";
    }

    if (checks.some((c) => c.id === "message.zone")) {
      descriptions["message.zone"] =
        "Confirm whether any address can fill this signed order";
    }

    return this.setDescriptions(result, descriptions);
  }

  protected summaryFocusIds(ctx: TypedDataContext, checks: ReviewCheckItem[]): string[] {
    const ids: string[] = [];
    if (this.hasFields(ctx, ["zone"])) ids.push("message.zone");
    for (const check of checks) {
      if (
        check.id.startsWith("message.offer") ||
        check.id.startsWith("message.consideration")
      ) {
        ids.push(check.id);
      }
    }
    return [...new Set(ids)];
  }
}
