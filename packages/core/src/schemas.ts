import { z } from "zod";

export const parse_input_schema = z.object({
  raw: z.string().min(1),
  chain_id: z.number().int().positive().optional(),
  abi: z.string().optional(),
  selected_discovery_hit: z.string().optional(),
  locale: z.enum(["zh", "en"]).optional(),
});

export type parse_input = z.infer<typeof parse_input_schema>;
