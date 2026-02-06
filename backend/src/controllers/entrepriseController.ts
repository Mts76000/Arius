import { Request, Response } from "express";
import { z } from "zod";
import {
  getEntreprises,
  getEntrepriseById,
  createEntreprise,
  updateEntreprise,
  deleteEntreprise,
} from "../models/entreprise.js";

const createSchema = z.object({
  nom: z.string().min(1, "Nom requis"),
  statut: z.enum(["client", "prospect", "fournisseur", "a_reactiver"]),
  rue: z
    .string()
    .optional()
    .nullable()
    .transform((val) => val || null),
  code_postal: z
    .string()
    .max(10)
    .optional()
    .nullable()
    .transform((val) => val || null),
  ville: z
    .string()
    .max(100)
    .optional()
    .nullable()
    .transform((val) => val || null),
  pays: z
    .string()
    .max(100)
    .optional()
    .nullable()
    .transform((val) => val || null),
  description: z
    .string()
    .optional()
    .nullable()
    .transform((val) => val || null),
  logo: z
    .string()
    .optional()
    .or(z.literal(""))
    .refine(
      (val) => !val || val.startsWith("/uploads/") || /^https?:\/\//i.test(val),
      {
        message: "logo must be an URL or /uploads path",
      },
    )
    .transform((val) => val || null),
});

const updateSchema = z.object({
  nom: z.string().min(1).optional(),
  statut: z
    .enum(["client", "prospect", "fournisseur", "a_reactiver"])
    .optional(),
  rue: z
    .string()
    .optional()
    .nullable()
    .transform((val) => val || null),
  code_postal: z
    .string()
    .max(10)
    .optional()
    .nullable()
    .transform((val) => val || null),
  ville: z
    .string()
    .max(100)
    .optional()
    .nullable()
    .transform((val) => val || null),
  pays: z
    .string()
    .max(100)
    .optional()
    .nullable()
    .transform((val) => val || null),
  description: z
    .string()
    .optional()
    .nullable()
    .transform((val) => val || null),
  logo: z
    .string()
    .optional()
    .or(z.literal(""))
    .refine(
      (val) => !val || val.startsWith("/uploads/") || /^https?:\/\//i.test(val),
      {
        message: "logo must be an URL or /uploads path",
      },
    )
    .transform((val) => val || null),
});

export async function list(req: Request, res: Response) {
  try {
    const userId = (req as any).userId as string;
    if (!userId) return res.status(401).json({ error: "unauthorized" });

    const { recherche, statut, page, limite } = req.query;

    const filters = {
      recherche: recherche ? String(recherche) : undefined,
      statut: statut as "client" | "prospect" | "fournisseur" | undefined,
      page: page ? parseInt(String(page)) : undefined,
      limite: limite ? parseInt(String(limite)) : undefined,
    };

    const { entreprises, total } = await getEntreprises(userId, filters);
    return res.status(200).json({ entreprises, total });
  } catch (error) {
    console.error("Error listing entreprises:", error);
    return res.status(500).json({ error: "internal_error" });
  }
}

export async function get(req: Request, res: Response) {
  try {
    const userId = (req as any).userId as string;
    if (!userId) return res.status(401).json({ error: "unauthorized" });

    const { id } = req.params;
    const entreprise = await getEntrepriseById(id as string, userId);

    if (!entreprise) {
      return res.status(404).json({ error: "entreprise_not_found" });
    }

    return res.status(200).json(entreprise);
  } catch (error) {
    console.error("Error getting entreprise:", error);
    return res.status(500).json({ error: "internal_error" });
  }
}

export async function create(req: Request, res: Response) {
  try {
    const userId = (req as any).userId as string;
    if (!userId) return res.status(401).json({ error: "unauthorized" });

    const parsed = createSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: "validation_error",
        details: parsed.error.flatten(),
      });
    }

    const entreprise = await createEntreprise(userId, parsed.data);
    return res.status(201).json(entreprise);
  } catch (error) {
    console.error("Error creating entreprise:", error);
    const err = error as any;
    const message = typeof err?.message === "string" ? err.message : "";
    if (
      message.includes("statut") &&
      (message.includes("Incorrect") || message.includes("Data truncated"))
    ) {
      return res.status(400).json({
        error: "invalid_statut",
        message:
          "Statut invalide. Vérifie que la colonne enum `statut` inclut 'a_reactiver'.",
      });
    }
    return res.status(500).json({ error: "internal_error" });
  }
}

export async function update(req: Request, res: Response) {
  try {
    const userId = (req as any).userId as string;
    if (!userId) return res.status(401).json({ error: "unauthorized" });

    const { id } = req.params;
    const parsed = updateSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        error: "validation_error",
        details: parsed.error.flatten(),
      });
    }

    const entreprise = await updateEntreprise(
      id as string,
      userId,
      parsed.data,
    );

    if (!entreprise) {
      return res.status(404).json({ error: "entreprise_not_found" });
    }

    return res.status(200).json(entreprise);
  } catch (error) {
    console.error("Error updating entreprise:", error);
    const err = error as any;
    const message = typeof err?.message === "string" ? err.message : "";
    if (
      message.includes("statut") &&
      (message.includes("Incorrect") || message.includes("Data truncated"))
    ) {
      return res.status(400).json({
        error: "invalid_statut",
        message:
          "Statut invalide. Vérifie que la colonne enum `statut` inclut 'a_reactiver'.",
      });
    }
    return res.status(500).json({ error: "internal_error" });
  }
}

export async function remove(req: Request, res: Response) {
  try {
    const userId = (req as any).userId as string;
    if (!userId) return res.status(401).json({ error: "unauthorized" });

    const { id } = req.params;
    const deleted = await deleteEntreprise(id as string, userId);

    if (!deleted) {
      return res.status(404).json({ error: "entreprise_not_found" });
    }

    return res.status(204).send();
  } catch (error) {
    console.error("Error deleting entreprise:", error);
    return res.status(500).json({ error: "internal_error" });
  }
}
