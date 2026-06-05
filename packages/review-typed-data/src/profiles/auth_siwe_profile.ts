import type { ReviewCheckItem, WarningItem } from "@beforesign/core";
import type { TypedDataContext } from "./context.ts";
import { TypedDataProfile } from "./typed_data_profile.ts";

const SIWE_DOMAIN_NAMES = new Set(["Login", "Sign-In with Ethereum"]);

export class AuthSiweProfile extends TypedDataProfile {
  readonly id = "auth" as const;
  readonly priority = 90;

  match(ctx: TypedDataContext): boolean {
    const domainName = this.getDomainString(ctx, "name");
    if (domainName && SIWE_DOMAIN_NAMES.has(domainName)) return true;
    if (ctx.normalized.primaryType === "Login") return true;
    const hasSiweFields =
      this.hasFields(ctx, ["statement", "uri", "nonce"]) && !this.hasFields(ctx, ["spender"]);
    return hasSiweFields;
  }

  summary(ctx: TypedDataContext): string {
    void ctx;
    return "Sign-in message: verify domain, URI, nonce, and expiration (low asset risk)";
  }

  protected mutateChecks(checks: ReviewCheckItem[], ctx: TypedDataContext): ReviewCheckItem[] {
    const result = this.highlightIds(checks, this.summaryFocusIds(ctx));
    const descriptions: Record<string, string> = {};

    if (result.some((c) => c.id === "domain.name")) {
      descriptions["domain.name"] =
        "Confirm domain matches the application you intend to sign in to. Login signatures should not be reusable as other protocol actions";
    }
    if (result.some((c) => c.id === "message.uri")) {
      descriptions["message.uri"] = "URI should match the site requesting the signature";
    }
    if (result.some((c) => c.id === "message.nonce")) {
      descriptions["message.nonce"] = "Nonce prevents replay of this login signature";
    }

    return this.setDescriptions(result, descriptions);
  }

  protected summaryFocusIds(ctx: TypedDataContext): string[] {
    const ids = ["domain.name", "message.uri", "message.nonce"];
    if (this.hasFields(ctx, ["expirationTime"])) ids.push("message.expirationTime");
    return ids;
  }

  protected buildWarnings(ctx: TypedDataContext, checks: ReviewCheckItem[]): WarningItem[] {
    void checks;
    return this.warnExpiredDeadline(ctx, ["expirationTime", "expiration"]);
  }
}
