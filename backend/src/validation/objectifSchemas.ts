import { z } from "zod";

export const createObjectifSchema = z.object({
  annee: z.number().int().min(2000).max(2100),
  mois: z.number().int().min(1).max(12),
  objectif_ht: z.number().positive(),
});

export const updateObjectifSchema = z.object({
  objectif_ht: z.number().positive(),
});

export const objectifQuerySchema = z.object({
  annee: z
    .string()
    .optional()
    .transform((value) => (value ? parseInt(value) : undefined)),
});
