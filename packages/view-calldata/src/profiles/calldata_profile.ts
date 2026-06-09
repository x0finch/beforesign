import type { AlertItem } from "@beforesign/json-render-catalog";
import { argFieldId } from "@beforesign/calldata-parse";
import type { ViewCallNode, ViewFieldDescriptor } from "../field_descriptor.ts";
import {
  applyNodeFieldOverrides,
  collectCallTree,
  flattenFieldDescriptors,
  idPrefix,
} from "../field_descriptor.ts";
import type { CalldataScenarioId, CalldataViewContext } from "./context.ts";

export type ProfileEnrichResult = {
  root: ViewCallNode;
  warnings: AlertItem[];
};

export abstract class CalldataProfile {
  abstract readonly id: CalldataScenarioId;
  abstract readonly priority: number;

  abstract match(ctx: CalldataViewContext): boolean;
  abstract summary(ctx: CalldataViewContext): string;

  title(ctx: CalldataViewContext): string {
    void ctx;
    return "Contract Calldata";
  }

  enrich(ctx: CalldataViewContext): ProfileEnrichResult {
    const root = collectCallTree(ctx.tree);
    const fields = flattenFieldDescriptors(root);
    const overrides = this.buildFieldOverrides(ctx, fields);
    const enrichedRoot = applyNodeFieldOverrides(root, overrides);
    const warnings = this.buildWarnings(ctx, fields, overrides);
    return { root: enrichedRoot, warnings };
  }

  protected buildFieldOverrides(
    ctx: CalldataViewContext,
    fields: ViewFieldDescriptor[],
  ): Map<string, Partial<ViewFieldDescriptor>> {
    void ctx;
    void fields;
    return new Map();
  }

  protected buildWarnings(
    ctx: CalldataViewContext,
    fields: ViewFieldDescriptor[],
    overrides: Map<string, Partial<ViewFieldDescriptor>>,
  ): AlertItem[] {
    void ctx;
    void fields;
    void overrides;
    return [];
  }

  protected highlightIds(
    fields: ViewFieldDescriptor[],
    ids: string[],
  ): Map<string, Partial<ViewFieldDescriptor>> {
    const overrides = new Map<string, Partial<ViewFieldDescriptor>>();
    const idSet = new Set(ids);
    for (const field of fields) {
      if (idSet.has(field.id)) {
        overrides.set(field.id, { highlight: true });
      }
    }
    return overrides;
  }

  protected mergeOverrides(
    ...maps: Array<Map<string, Partial<ViewFieldDescriptor>>>
  ): Map<string, Partial<ViewFieldDescriptor>> {
    const merged = new Map<string, Partial<ViewFieldDescriptor>>();
    for (const map of maps) {
      for (const [id, override] of map) {
        merged.set(id, { ...merged.get(id), ...override });
      }
    }
    return merged;
  }

  protected setRiskOnId(
    fields: ViewFieldDescriptor[],
    id: string,
    risk: "destructive",
  ): Map<string, Partial<ViewFieldDescriptor>> {
    const overrides = new Map<string, Partial<ViewFieldDescriptor>>();
    if (fields.some((field) => field.id === id)) {
      overrides.set(id, { risk });
    }
    return overrides;
  }

  protected firstExistingFieldId(fields: ViewFieldDescriptor[], ids: string[]): string | undefined {
    const idSet = new Set(fields.map((field) => field.id));
    return ids.find((id) => idSet.has(id));
  }

  protected rootArgFieldId(ctx: CalldataViewContext, argName: string): string | undefined {
    const index = ctx.tree.args.findIndex((arg) => arg.name === argName);
    if (index < 0) return undefined;
    return argFieldId(idPrefix(undefined), index);
  }

  protected rootArgFieldIdsByNames(ctx: CalldataViewContext, names: string[]): string[] {
    return names.flatMap((name) => {
      const id = this.rootArgFieldId(ctx, name);
      return id ? [id] : [];
    });
  }

  protected argFieldIdByName(node: ViewCallNode, argName: string): string | undefined {
    const index = node.call.args.findIndex((arg) => arg.name === argName);
    if (index < 0) return undefined;
    return argFieldId(idPrefix(node.path), index);
  }

  protected rootArgIds(fields: ViewFieldDescriptor[]): string[] {
    return fields
      .filter((field) => field.id.startsWith("calldata.args."))
      .map((field) => field.id);
  }
}
