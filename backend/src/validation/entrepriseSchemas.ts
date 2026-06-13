import { z } from "zod";

const nullableString = z
  .string()
  .optional()
  .nullable()
  .transform((value) => value || null);

const logoSchema = z
  .string()
  .optional()
  .or(z.literal(""))
  .refine(
    (value) =>
      !value || value.startsWith("/uploads/") || /^https?:\/\//i.test(value),
    {
      message: "logo must be an URL or /uploads path",
    },
  )
  .transform((value) => value || null);

export const createEntrepriseSchema = z.object({
  nom: z.string().min(1, "Nom requis"),
  statut: z.enum(["client", "prospect", "fournisseur", "a_reactiver"]),
  rue: nullableString,
  code_postal: nullableString.pipe(z.string().max(10).nullable()),
  ville: nullableString.pipe(z.string().max(100).nullable()),
  pays: nullableString.pipe(z.string().max(100).nullable()),
  description: nullableString,
  logo: logoSchema,
});

export const updateEntrepriseSchema = createEntrepriseSchema.partial().extend({
  nom: z.string().min(1).optional(),
});
