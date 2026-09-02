import { z } from "zod";

const optionalUrl = z.union([z.literal(""), z.string().url("URL inválida")]).optional();
export const opportunitySchema = z.object({
  title: z.string().trim().min(3).max(120), originalUrl: optionalUrl, source: z.string().min(2).max(40),
  category: z.string().min(2).max(60), subcategory: z.string().max(60).optional(), brand: z.string().max(60).optional(), model: z.string().max(80).optional(), version: z.string().max(80).optional(),
  condition: z.string().min(2), askingPriceCents: z.number().int().nonnegative(), negotiatedPriceCents: z.number().int().nonnegative().optional(),
  city: z.string().min(2).max(80), neighborhood: z.string().max(80).optional(), capturedAt: z.string().min(10),
  riskLevel: z.enum(["BAIXO", "MEDIO", "ALTO"]), expectedDaysToSell: z.number().int().min(1).max(730)
});
