import { z } from "zod";
import { NOTE_TYPES } from "../shared/apiTypes.js";

export const noteTypeSchema = z.enum(NOTE_TYPES);

export const createNoteSchema = z.object({
  entreprise_id: z.string().min(1),
  contenu: z.string().min(1),
  type: noteTypeSchema,
  tags: z.array(z.string()).optional(),
  est_template: z.boolean().optional(),
  nom_template: z.string().optional().nullable(),
});

export const updateNoteSchema = z.object({
  contenu: z.string().min(1).optional(),
  type: noteTypeSchema.optional(),
  tags: z.array(z.string()).optional(),
  est_template: z.boolean().optional(),
  nom_template: z.string().optional().nullable(),
});

export const listNotesQuerySchema = z.object({
  type: noteTypeSchema.optional(),
  tag: z.string().optional(),
  page: z
    .string()
    .optional()
    .transform((value) => (value ? parseInt(value) : 1)),
  limite: z
    .string()
    .optional()
    .transform((value) => (value ? parseInt(value) : 20)),
});

export const searchNotesQuerySchema = z.object({
  q: z.string().min(1, "Recherche requise"),
});

export const noteTemplatesQuerySchema = z.object({
  type: noteTypeSchema,
});

export const dashboardNotesQuerySchema = z.object({
  jours_seuil: z
    .string()
    .optional()
    .transform((value) => (value ? parseInt(value) : 7)),
});
