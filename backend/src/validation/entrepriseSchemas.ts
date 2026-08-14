import { z } from "zod";
import { ENTREPRISE_STATUSES } from "../shared/apiTypes.js";
import { queryIntWithDefault } from "./queryHelpers.js";

const nullableString = z
  .string()
  .optional()
  .nullable()
  .transform((value) => value || null);

const logoSchema = z
  .union([z.string(), z.null(), z.undefined()])
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
  statut: z.enum(ENTREPRISE_STATUSES),
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

export const listEntreprisesQuerySchema = z.object({
  recherche: z.string().max(255).optional(),
  statut: z.enum(ENTREPRISE_STATUSES).optional(),
  page: queryIntWithDefault(1, { min: 1 }),
  limite: queryIntWithDefault(20, { min: 1, max: 100 }),
});
