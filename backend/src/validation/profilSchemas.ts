import { z } from "zod";

export const updateProfilSchema = z.object({
  prenom: z.string().min(2).max(50).optional().nullable(),
  nom: z.string().min(2).max(50),
});

export const changePasswordSchema = z.object({
  ancienMotdepasse: z.string().min(1),
  nouveauMotdepasse: z
    .string()
    .min(8)
    .regex(/[A-Z]/)
    .regex(/[a-z]/)
    .regex(/[0-9]/),
  confirmation: z.string().min(1),
});

export const anonymizeAccountSchema = z
  .object({
    password: z.string().min(1).optional(),
    motdepasse: z.string().min(1).optional(),
  })
  .refine((value) => value.password || value.motdepasse, {
    message: "Mot de passe requis",
  });
