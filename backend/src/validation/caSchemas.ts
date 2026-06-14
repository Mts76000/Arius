import { z } from "zod";
import { optionalQueryInt, requiredQueryInt } from "./queryHelpers.js";

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
  annee: optionalQueryInt({ min: 2000, max: 2100 }),
  mois: optionalQueryInt({ min: 1, max: 12 }),
  entreprise_id: z.string().optional(),
});

export const caStatsQuerySchema = z.object({
  annee: requiredQueryInt({ min: 2000, max: 2100 }),
  mois: requiredQueryInt({ min: 1, max: 12 }),
});

export const caEntrepriseQuerySchema = z.object({
  annee: requiredQueryInt({ min: 2000, max: 2100 }),
});
