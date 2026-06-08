import type { ClientsBundle } from "@beforesign/clients";
import type { JsonValue, WarningItem, WarningSeverity } from "@beforesign/core";
import { addressesEqual } from "../address_rules.ts";
import { isExpired, isLongDeadline, parseUnixSeconds } from "../time_rules.ts";
import type { ViewFieldDescriptor } from "../field_descriptor.ts";
import type { TypedDataContext, TypedDataScenarioId } from "./context.ts";

export type ProfileEnrichResult = {
  fields: ViewFieldDescriptor[];
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

  enrich(ctx: TypedDataContext, fields: ViewFieldDescriptor[]): ProfileEnrichResult {
    const mutated = this.mutateFields(fields, ctx);
    const warnings = this.buildWarnings(ctx, mutated);
    return { fields: mutated, warnings };
  }

  buildExternalFacts(ctx: TypedDataContext): Record<string, JsonValue> {
    void ctx;
    return {};
  }

  protected mutateFields(fields: ViewFieldDescriptor[], ctx: TypedDataContext): ViewFieldDescriptor[] {
    void ctx;
    return fields;
  }

  protected buildWarnings(ctx: TypedDataContext, fields: ViewFieldDescriptor[]): WarningItem[] {
    void ctx;
    void fields;
    return [];
  }

  protected highlightIds(fields: ViewFieldDescriptor[], ids: string[]): ViewFieldDescriptor[] {
    const idSet = new Set(ids);
    return fields.map((field) => (idSet.has(field.id) ? { ...field, highlight: true } : field));
  }

  protected messageFieldIds(fields: ViewFieldDescriptor[]): string[] {
    return fields
      .filter((field) => field.group === "message" && field.id !== "message.primaryType")
      .map((field) => field.id);
  }

  protected firstExistingFieldId(fields: ViewFieldDescriptor[], ids: string[]): string | undefined {
    const idSet = new Set(fields.map((field) => field.id));
    return ids.find((id) => idSet.has(id));
  }

  protected setRiskOnId(
    fields: ViewFieldDescriptor[],
    id: string,
    risk: WarningSeverity,
  ): ViewFieldDescriptor[] {
    return fields.map((field) => (field.id === id ? { ...field, risk } : field));
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
