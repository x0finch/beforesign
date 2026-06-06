import type { ClientsBundle } from "@beforesign/clients";
import type { JsonValue, ReviewCheckItem, WarningItem, WarningSeverity } from "@beforesign/core";
import { addressesEqual } from "../address_rules.ts";
import { isExpired, isLongDeadline, parseUnixSeconds } from "../time_rules.ts";
import type { TypedDataContext, TypedDataScenarioId } from "./context.ts";

export type ProfileEnrichResult = {
  checks: ReviewCheckItem[];
  warnings: WarningItem[];
};

export abstract class TypedDataProfile {
  abstract readonly id: TypedDataScenarioId;
  abstract readonly priority: number;

  abstract match(ctx: TypedDataContext): boolean;
  abstract summary(ctx: TypedDataContext): string;

  title(ctx: TypedDataContext): string {
    void ctx;
    return "EIP-712 Typed Data Signature";
  }

  async prepareContext(
    ctx: TypedDataContext,
    clients: ClientsBundle,
  ): Promise<TypedDataContext> {
    void clients;
    return ctx;
  }

  enrich(ctx: TypedDataContext, checks: ReviewCheckItem[]): ProfileEnrichResult {
    const mutated = this.mutateChecks(checks, ctx);
    const warnings = this.buildWarnings(ctx, mutated);
    return {
      checks: mutated,
      warnings,
    };
  }

  buildExternalFacts(ctx: TypedDataContext): Record<string, JsonValue> {
    void ctx;
    return {};
  }

  protected mutateChecks(checks: ReviewCheckItem[], ctx: TypedDataContext): ReviewCheckItem[] {
    void ctx;
    return checks;
  }

  protected buildWarnings(ctx: TypedDataContext, checks: ReviewCheckItem[]): WarningItem[] {
    void ctx;
    void checks;
    return [];
  }

  protected highlightIds(checks: ReviewCheckItem[], ids: string[]): ReviewCheckItem[] {
    const idSet = new Set(ids);
    return checks.map((check) => (idSet.has(check.id) ? { ...check, highlight: true } : check));
  }

  protected messageCheckIds(checks: ReviewCheckItem[]): string[] {
    return checks
      .filter((check) => check.group === "message" && check.id !== "message.primaryType")
      .map((check) => check.id);
  }

  protected setDescriptions(
    checks: ReviewCheckItem[],
    descriptions: Record<string, string>,
  ): ReviewCheckItem[] {
    return checks.map((check) =>
      descriptions[check.id] ? { ...check, description: descriptions[check.id] } : check,
    );
  }

  protected firstExistingCheckId(checks: ReviewCheckItem[], ids: string[]): string | undefined {
    const idSet = new Set(checks.map((check) => check.id));
    return ids.find((id) => idSet.has(id));
  }

  protected setRiskOnId(
    checks: ReviewCheckItem[],
    id: string,
    risk: WarningSeverity,
  ): ReviewCheckItem[] {
    return checks.map((check) => (check.id === id ? { ...check, risk } : check));
  }

  protected warnSignerFieldMismatch(
    ctx: TypedDataContext,
    fieldName: string,
    code = "ownerMismatch",
  ): WarningItem | undefined {
    const signer = ctx.payload?.signerAddress;
    const fieldValue = this.getMessageString(ctx, fieldName);
    if (!signer || !fieldValue) return undefined;
    if (addressesEqual(signer, fieldValue)) return undefined;
    return {
      code,
      severity: "destructive",
      message: `${fieldName} does not match signer address`,
    };
  }

  protected warnExpiredDeadline(
    ctx: TypedDataContext,
    fieldNames: string[],
    nowSeconds?: number,
  ): WarningItem[] {
    const warnings: WarningItem[] = [];
    for (const name of fieldNames) {
      const raw = this.getMessageString(ctx, name);
      const ts = parseUnixSeconds(raw);
      if (ts !== undefined && isExpired(ts, nowSeconds)) {
        warnings.push({
          code: "expiredDeadline",
          severity: "destructive",
          message: `${name} has already expired`,
        });
      }
    }
    return warnings;
  }

  protected warnLongDeadline(
    ctx: TypedDataContext,
    fieldNames: string[],
    nowSeconds?: number,
  ): WarningItem | undefined {
    for (const name of fieldNames) {
      const raw = this.getMessageString(ctx, name);
      const ts = parseUnixSeconds(raw);
      if (ts !== undefined && isLongDeadline(ts, nowSeconds)) {
        return {
          code: "longDeadline",
          severity: "warning",
          message: `${name} is more than one year in the future`,
        };
      }
    }
    return undefined;
  }

  protected hasFields(ctx: TypedDataContext, names: string[]): boolean {
    return names.every((name) => ctx.primaryFieldNames.includes(name));
  }

  protected getMessageString(ctx: TypedDataContext, field: string): string | undefined {
    const value = ctx.message[field];
    if (value === undefined || value === null) return undefined;
    if (typeof value === "string") return value;
    if (typeof value === "number" || typeof value === "bigint") return String(value);
    return undefined;
  }

  protected getDomainString(ctx: TypedDataContext, field: string): string | undefined {
    const value = ctx.domain[field];
    if (value === undefined || value === null) return undefined;
    if (typeof value === "string") return value;
    if (typeof value === "number" || typeof value === "bigint") return String(value);
    return undefined;
  }

  protected firstExistingMessageField(ctx: TypedDataContext, names: string[]): string | undefined {
    for (const name of names) {
      const value = this.getMessageString(ctx, name);
      if (value !== undefined) return name;
    }
    return undefined;
  }
}
