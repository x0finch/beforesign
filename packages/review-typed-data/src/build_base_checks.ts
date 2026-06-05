import type { ReviewCheckItem } from "@beforesign/core";
import type { TypedDataDefinition } from "viem";
import { flattenMessageValue, shouldFlattenField } from "./flatten_nested.ts";
import { buildFieldCheck } from "./format_field.ts";
import type { TypedDataContext } from "./profiles/context.ts";

function getTypeFields(
  types: TypedDataDefinition["types"],
  typeName: string,
): Array<{ name: string; type: string }> {
  const fields = types[typeName as keyof typeof types];
  if (!fields || !Array.isArray(fields)) return [];
  return fields;
}

function buildDomainChecks(ctx: TypedDataContext): ReviewCheckItem[] {
  const domain = ctx.domain;
  const fields = getTypeFields(ctx.normalized.types, "EIP712Domain");

  return fields.map((field) =>
    buildFieldCheck({
      id: `domain.${field.name}`,
      group: "domain",
      fieldName: field.name,
      fieldType: field.type,
      rawValue: domain[field.name],
      tokenHint: ctx.tokenHint,
    }),
  );
}

function buildMessageChecks(ctx: TypedDataContext): ReviewCheckItem[] {
  const message = ctx.message;
  const fields = getTypeFields(ctx.normalized.types, ctx.normalized.primaryType);

  const checks: ReviewCheckItem[] = [
    {
      id: "message.primaryType",
      group: "message",
      label: "Primary type",
      value: ctx.normalized.primaryType,
      kind: "text",
    },
  ];

  for (const field of fields) {
    const rawValue = message[field.name];
    if (shouldFlattenField(field.name) && typeof rawValue === "object" && rawValue !== null) {
      checks.push(
        ...flattenMessageValue(`message.${field.name}`, rawValue, {
          tokenHint: ctx.tokenHint,
        }),
      );
      continue;
    }

    checks.push(
      buildFieldCheck({
        id: `message.${field.name}`,
        group: "message",
        fieldName: field.name,
        fieldType: field.type,
        rawValue,
        tokenHint: ctx.tokenHint,
      }),
    );
  }

  return checks;
}

export function buildBaseChecks(ctx: TypedDataContext): ReviewCheckItem[] {
  return [
    ...buildDomainChecks(ctx),
    ...buildMessageChecks(ctx),
    {
      id: "signature.signableHash",
      group: "signature",
      label: "Signable hash",
      value: ctx.signableHash,
      kind: "hash",
    },
  ];
}
