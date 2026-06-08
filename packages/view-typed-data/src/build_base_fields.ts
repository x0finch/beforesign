import type { TypedDataDefinition } from "viem";
import { flattenMessageValue, shouldFlattenField } from "./flatten_nested.ts";
import { buildFieldDescriptor } from "./format_field.ts";
import type { ViewFieldDescriptor } from "./field_descriptor.ts";
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

function buildDomainFields(ctx: TypedDataContext): ViewFieldDescriptor[] {
  const domain = ctx.domain;
  const fields = getTypeFields(ctx.normalized.types, "EIP712Domain");

  return fields.map((field) =>
    buildFieldDescriptor({
      id: `domain.${field.name}`,
      group: "domain",
      fieldName: field.name,
      fieldType: field.type,
      rawValue: domain[field.name],
      tokenHint: hintForField(ctx, field.name, domain[field.name]),
    }),
  );
}

function buildMessageFields(ctx: TypedDataContext): ViewFieldDescriptor[] {
  const message = ctx.message;
  const fields = getTypeFields(ctx.normalized.types, ctx.normalized.primaryType);

  const result: ViewFieldDescriptor[] = [
    buildFieldDescriptor({
      id: "message.primaryType",
      group: "message",
      fieldName: "primaryType",
      fieldType: "string",
      rawValue: ctx.normalized.primaryType,
      label: "Primary type",
    }),
  ];

  for (const field of fields) {
    const rawValue = message[field.name];
    if (shouldFlattenField(field.name) && typeof rawValue === "object" && rawValue !== null) {
      result.push(...flattenMessageValue(`message.${field.name}`, rawValue, { ctx }));
      continue;
    }

    result.push(
      buildFieldDescriptor({
        id: `message.${field.name}`,
        group: "message",
        fieldName: field.name,
        fieldType: field.type,
        rawValue,
        tokenHint: hintForField(ctx, field.name, rawValue),
      }),
    );
  }

  return result;
}

function buildSignatureFields(ctx: TypedDataContext): ViewFieldDescriptor[] {
  const fields: ViewFieldDescriptor[] = [
    buildFieldDescriptor({
      id: "signature.domainHash",
      group: "signature",
      fieldName: "domainHash",
      fieldType: "bytes32",
      rawValue: ctx.domainHash,
      label: "Domain hash",
    }),
  ];

  if (ctx.structHash) {
    fields.push(
      buildFieldDescriptor({
        id: "signature.structHash",
        group: "signature",
        fieldName: "structHash",
        fieldType: "bytes32",
        rawValue: ctx.structHash,
        label: "Struct hash",
      }),
    );
  }

  fields.push(
    buildFieldDescriptor({
      id: "signature.signableHash",
      group: "signature",
      fieldName: "signableHash",
      fieldType: "bytes32",
      rawValue: ctx.signableHash,
      label: "Signable hash",
    }),
  );

  return fields;
}

export function buildBaseFields(ctx: TypedDataContext): ViewFieldDescriptor[] {
  return [...buildDomainFields(ctx), ...buildMessageFields(ctx), ...buildSignatureFields(ctx)];
}
