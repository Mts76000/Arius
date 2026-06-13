import { z } from "zod";

export const createCASchema = z.object({
  entreprise_id: z.string().min(1),
  annee: z.number().int().min(2000).max(2100),
  mois: z.number().int().min(1).max(12),
  ca_ht: z.number().nonnegative(),
});

export const updateCASchema = z.object({
  ca_ht: z.number().nonnegative(),
});

export const caQuerySchema = z.object({
  annee: z
    .string()
    .optional()
    .transform((value) => (value ? parseInt(value) : undefined)),
  mois: z
    .string()
    .optional()
    .transform((value) => (value ? parseInt(value) : undefined)),
  entreprise_id: z.string().optional(),
});

export const caStatsQuerySchema = z.object({
  annee: z.string().transform((value) => parseInt(value)),
  mois: z.string().transform((value) => parseInt(value)),
});

export const caEntrepriseQuerySchema = z.object({
  annee: z.string().transform((value) => parseInt(value)),
});
