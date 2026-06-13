import { z } from "zod";

const nullableTrimmedString = z
  .union([z.string(), z.null()])
  .optional()
  .transform((value) => (value && value.trim() ? value : null));

const nullableEmail = nullableTrimmedString.refine(
  (value) => !value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
  { message: "Email invalide" },
);

export const createContactSchema = z.object({
  prenom: nullableTrimmedString,
  nom: z.string().min(1, "Nom requis"),
  poste: nullableTrimmedString,
  email: nullableEmail,
  tel_direct: nullableTrimmedString,
  tel_mobile: nullableTrimmedString,
  contact_principal: z.boolean().optional().default(false),
  commentaire: nullableTrimmedString,
});

export const updateContactSchema = createContactSchema.partial().extend({
  nom: z.string().min(1, "Nom requis").optional(),
  contact_principal: z.boolean().optional(),
});
