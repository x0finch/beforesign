import { z } from "zod";

/** Mirrors @beforesign/core WarningSeverity without a dependency. */
export const alertSeveritySchema = z.enum(["info", "warning", "destructive"]);

export type AlertSeverity = z.infer<typeof alertSeveritySchema>;

export const alertItemSchema = z.object({
  severity: alertSeveritySchema,
  message: z.string(),
  code: z.string().optional(),
});

export type AlertItem = z.infer<typeof alertItemSchema>;

export const alertListPropsSchema = z.object({
  items: z.array(alertItemSchema),
});

export type AlertListProps = z.infer<typeof alertListPropsSchema>;
