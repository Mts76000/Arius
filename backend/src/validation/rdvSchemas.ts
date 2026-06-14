import { z } from "zod";
import { RDV_STATUSES } from "../shared/apiTypes.js";

export const rdvStatusSchema = z.enum(RDV_STATUSES);

export const createRdvSchema = z.object({
  titre: z.string().min(3, "Titre requis (min 3 caractères)"),
  description: z.string().optional(),
  date_prevue: z.string().datetime("Date invalide"),
  duree_minutes: z.number().int().min(1, "Durée invalide"),
  entreprise_id: z.string().min(1, "Entreprise requise"),
  contact_id: z.string().optional(),
  statut: rdvStatusSchema.optional(),
});

export const updateRdvSchema = z.object({
  titre: z.string().min(3).optional(),
  description: z.string().optional(),
  date_prevue: z.string().datetime().optional(),
  duree_minutes: z.number().int().min(1, "Durée invalide").optional(),
  statut: rdvStatusSchema.optional(),
});
