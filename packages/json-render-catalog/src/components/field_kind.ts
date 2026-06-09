import { z } from "zod";

/** Mirrors @beforesign/core ReviewCheckKind without a dependency. */
export const fieldKindSchema = z.enum([
  "address",
  "hash",
  "amount",
  "selector",
  "text",
  "timestamp",
  "chainId",
  "bool",
]);

export type FieldKind = z.infer<typeof fieldKindSchema>;

export const fieldBadgeVariantSchema = z.enum(["success", "error", "info"]);

export type FieldBadgeVariant = z.infer<typeof fieldBadgeVariantSchema>;

export const fieldRiskSchema = z.enum(["info", "warning", "destructive"]);

export type FieldRisk = z.infer<typeof fieldRiskSchema>;

export const fieldPropsSchema = z.object({
  label: z.string(),
  value: z.string(),
  displayValue: z.string().optional(),
  kind: fieldKindSchema.optional(),
  highlight: z.boolean().optional(),
  href: z.string().optional(),
  badge: z.string().optional(),
  badgeVariant: fieldBadgeVariantSchema.optional(),
  risk: fieldRiskSchema.optional(),
  mono: z.boolean().optional(),
  clamp: z.boolean().optional(),
});

export type FieldProps = z.infer<typeof fieldPropsSchema>;
