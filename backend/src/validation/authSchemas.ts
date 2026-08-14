import { z } from "zod";

const strongPasswordSchema = z
  .string()
  .min(8, "Mot de passe trop court (min 8 caracteres)")
  .regex(/[A-Z]/, "Le mot de passe doit contenir une majuscule")
  .regex(/[a-z]/, "Le mot de passe doit contenir une minuscule")
  .regex(/[0-9]/, "Le mot de passe doit contenir un chiffre");

export const registerSchema = z.object({
  email: z.string().email("Email invalide"),
  password: strongPasswordSchema,
  prenom: z.string().optional().nullable(),
  nom: z.string().optional().nullable(),
});

export const loginSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(1, "Mot de passe requis"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Email invalide"),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, "Token requis"),
  password: strongPasswordSchema,
});
