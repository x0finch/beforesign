import { z } from "zod";

export const parseInputSchema = z.object({
  raw: z.string().min(1),
  chainId: z.number().int().positive().optional(),
  abi: z.string().optional(),
  selectedDiscoveryHit: z.string().optional(),
  locale: z.enum(["zh", "en"]).optional(),
});

export type ParseInput = z.infer<typeof parseInputSchema>;
