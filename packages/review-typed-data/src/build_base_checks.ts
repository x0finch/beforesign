import type { ReviewCheckItem } from "@beforesign/core";
import type { TypedDataDefinition } from "viem";
import { flattenMessageValue, shouldFlattenField } from "./flatten_nested.ts";
import { buildFieldCheck } from "./format_field.ts";
import type { TypedDataContext } from "./profiles/context.ts";
import { hintForField } from "./token_hints.ts";

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
      tokenHint: hintForField(ctx, field.name, domain[field.name]),
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
        ...flattenMessageValue(`message.${field.name}`, rawValue, { ctx }),
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
        tokenHint: hintForField(ctx, field.name, rawValue),
      }),
    );
  }

  return checks;
}

function buildSignatureChecks(ctx: TypedDataContext): ReviewCheckItem[] {
  const checks: ReviewCheckItem[] = [
    {
      id: "signature.domainHash",
      group: "signature",
      label: "Domain hash",
      value: ctx.domainHash,
      kind: "hash",
    },
  ];

  if (ctx.structHash) {
    checks.push({
      id: "signature.structHash",
      group: "signature",
      label: "Struct hash",
      value: ctx.structHash,
      kind: "hash",
    });
  }

  checks.push({
    id: "signature.signableHash",
    group: "signature",
    label: "Signable hash",
    value: ctx.signableHash,
    kind: "hash",
  });

  return checks;
}

export function buildBaseChecks(ctx: TypedDataContext): ReviewCheckItem[] {
  return [
    ...buildDomainChecks(ctx),
    ...buildMessageChecks(ctx),
    ...buildSignatureChecks(ctx),
  ];
}
