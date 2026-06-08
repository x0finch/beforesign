import type { WarningItem } from "@beforesign/core";
import type { ViewFieldDescriptor } from "../field_descriptor.ts";
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

  protected mutateFields(fields: ViewFieldDescriptor[], ctx: TypedDataContext): ViewFieldDescriptor[] {
    return this.highlightIds(fields, this.summaryFocusIds(ctx));
  }

  protected summaryFocusIds(ctx: TypedDataContext): string[] {
    const ids = ["domain.name", "message.uri", "message.nonce"];
    if (this.hasFields(ctx, ["expirationTime"])) ids.push("message.expirationTime");
    return ids;
  }

  protected buildWarnings(ctx: TypedDataContext, fields: ViewFieldDescriptor[]): WarningItem[] {
    void fields;
    return this.warnExpiredDeadline(ctx, ["expirationTime", "expiration"]);
  }
}
