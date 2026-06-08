import { z } from "zod";

export const parseInputSchema = z.object({
  raw: z.string().min(1),
  chainId: z.number().int().positive().optional(),
  abi: z.string().optional(),
  selectedDiscoveryHit: z.string().optional(),
  locale: z.enum(["zh", "en"]).optional(),
  signerAddress: z
    .string()
    .regex(/^0x[a-fA-F0-9]{40}$/)
    .optional(),
});

export type ParseInput = z.infer<typeof parseInputSchema>;
