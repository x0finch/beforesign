import type { ViewResult } from "@beforesign/core";
import {
  appendElements,
  buildCardShell,
  createFieldElements,
  resetElementIds,
  type ViewElement,
} from "@beforesign/json-render-catalog";
import { buildBaseFields } from "./build_base_fields.ts";
import type { TypedDataContext } from "./profiles/context.ts";
import { defaultRegistry } from "./profiles/profile_registry.ts";

function groupSections(
  fields: ReturnType<typeof buildBaseFields>,
  elementIdByFieldId: Map<string, string>,
) {
  const groups = ["domain", "message", "signature"] as const;
  return groups
    .map((group) => ({
      title: group === "domain" ? "Domain" : group === "message" ? "Message" : "Signature",
      childIds: fields
        .filter((field) => field.group === group)
        .map((field) => elementIdByFieldId.get(field.id)!)
        .filter(Boolean),
    }))
    .filter((section) => section.childIds.length > 0);
}

export function buildTypedDataSpec(ctx: TypedDataContext): ViewResult {
  const profile = defaultRegistry.resolve(ctx);
  const baseFields = buildBaseFields(ctx);
  const enriched = profile.enrich(ctx, baseFields);
  const fieldEntries = createFieldElements(enriched.fields);
  const elementIdByFieldId = new Map(
    enriched.fields.map((field, index) => [field.id, fieldEntries[index]!.id]),
  );
  const sections = groupSections(enriched.fields, elementIdByFieldId);

  resetElementIds();
  const shell = buildCardShell(
    {
      title: profile.title(ctx),
      description: profile.summary(ctx),
      badge: profile.id,
      warnings: enriched.warnings.map((warning) => ({
        code: warning.code,
        severity: warning.severity,
        message: warning.message,
      })),
      sections,
    },
    { resetIds: false },
  );

  appendElements(shell.spec.elements as Record<string, ViewElement>, fieldEntries);

  return {
    title: profile.title(ctx),
    summary: profile.summary(ctx),
    scenarioId: profile.id,
    spec: shell.spec as unknown as ViewResult["spec"],
    warnings: enriched.warnings,
  };
}
