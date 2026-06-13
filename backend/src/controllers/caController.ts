import { Request, Response } from "express";
import { z } from "zod";
import {
  getCA,
  createCA,
  updateCA,
  deleteCA,
  getCAStats,
  getCAEntreprise,
} from "../models/ca.js";

const createSchema = z.object({
  entreprise_id: z.string().min(1),
  annee: z.number().int().min(2000).max(2100),
  mois: z.number().int().min(1).max(12),
  ca_ht: z.number().nonnegative(),
});

const updateSchema = z.object({
  ca_ht: z.number().nonnegative(),
});

const querySchema = z.object({
  annee: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val) : undefined)),
  mois: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val) : undefined)),
  entreprise_id: z.string().optional(),
});

const statsQuerySchema = z.object({
  annee: z.string().transform((val) => parseInt(val)),
  mois: z.string().transform((val) => parseInt(val)),
});

export async function getCAHandler(req: Request, res: Response) {
  try {
    const userId = (req as any).userId;
    const filters = querySchema.parse(req.query);

    const ca = await getCA(userId, filters);

    res.json({ success: true, data: ca });
  } catch (error) {
    console.error("Error fetching CA:", error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, message: error.errors });
    }
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
}

export async function createCAHandler(req: Request, res: Response) {
  try {
    const userId = (req as any).userId;
    const input = createSchema.parse(req.body);

    const ca = await createCA(userId, input);

    res.status(201).json({ success: true, data: ca });
  } catch (error) {
    console.error("Error creating CA:", error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, message: error.errors });
    }
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
}

export async function updateCAHandler(req: Request, res: Response) {
  try {
    const userId = (req as any).userId;
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const input = updateSchema.parse(req.body);

    const ca = await updateCA(userId, id, input);

    if (!ca) {
      return res
        .status(404)
        .json({ success: false, message: "CA introuvable" });
    }

    res.json({ success: true, data: ca });
  } catch (error) {
    console.error("Error updating CA:", error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, message: error.errors });
    }
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
}

export async function deleteCAHandler(req: Request, res: Response) {
  try {
    const userId = (req as any).userId;
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    const deleted = await deleteCA(userId, id);

    if (!deleted) {
      return res
        .status(404)
        .json({ success: false, message: "CA introuvable" });
    }

    res.json({ success: true, message: "CA supprimé" });
  } catch (error) {
    console.error("Error deleting CA:", error);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
}

export async function getCAStatsHandler(req: Request, res: Response) {
  try {
    const userId = (req as any).userId;
    const { annee, mois } = statsQuerySchema.parse(req.query);

    const stats = await getCAStats(userId, annee, mois);

    res.json({ success: true, data: stats });
  } catch (error) {
    console.error("Error fetching CA stats:", error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, message: error.errors });
    }
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
}

export async function getCAEntrepriseHandler(req: Request, res: Response) {
  try {
    const userId = (req as any).userId;
    const entreprise_id = Array.isArray(req.params.entreprise_id)
      ? req.params.entreprise_id[0]
      : req.params.entreprise_id;
    const anneeStr = req.query.annee as string;

    if (!anneeStr) {
      return res.status(400).json({ success: false, message: "Année requise" });
    }

    const annee = parseInt(anneeStr);

    const stats = await getCAEntreprise(userId, entreprise_id, annee);

    res.json({ success: true, data: stats });
  } catch (error) {
    console.error("Error fetching entreprise CA:", error);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
}
