import { z } from "zod";

export const noteTypeSchema = z.enum(["appel", "reunion", "email", "info", "autre"]);

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
