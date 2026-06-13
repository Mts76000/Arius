import { Request, Response } from "express";
import { z } from "zod";
import {
  getObjectifs,
  createObjectif,
  updateObjectif,
  deleteObjectif,
} from "../models/objectif.js";

const createSchema = z.object({
  annee: z.number().int().min(2000).max(2100),
  mois: z.number().int().min(1).max(12),
  objectif_ht: z.number().positive(),
});

const updateSchema = z.object({
  objectif_ht: z.number().positive(),
});

const querySchema = z.object({
  annee: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val) : undefined)),
});

export async function getObjectifsHandler(req: Request, res: Response) {
  try {
    const userId = (req as any).userId;
    const { annee } = querySchema.parse(req.query);

    const objectifs = await getObjectifs(userId, annee);

    res.json({ success: true, data: objectifs });
  } catch (error) {
    console.error("Error fetching objectifs:", error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, message: error.errors });
    }
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
}

export async function createObjectifHandler(req: Request, res: Response) {
  try {
    const userId = (req as any).userId;
    const input = createSchema.parse(req.body);

    const objectif = await createObjectif(userId, input);

    res.status(201).json({ success: true, data: objectif });
  } catch (error) {
    console.error("Error creating objectif:", error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, message: error.errors });
    }
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
}

export async function updateObjectifHandler(req: Request, res: Response) {
  try {
    const userId = (req as any).userId;
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const input = updateSchema.parse(req.body);

    const objectif = await updateObjectif(userId, id, input);

    if (!objectif) {
      return res
        .status(404)
        .json({ success: false, message: "Objectif introuvable" });
    }

    res.json({ success: true, data: objectif });
  } catch (error) {
    console.error("Error updating objectif:", error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, message: error.errors });
    }
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
}

export async function deleteObjectifHandler(req: Request, res: Response) {
  try {
    const userId = (req as any).userId;
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    const deleted = await deleteObjectif(userId, id);

    if (!deleted) {
      return res
        .status(404)
        .json({ success: false, message: "Objectif introuvable" });
    }

    res.json({ success: true, message: "Objectif supprimé" });
  } catch (error) {
    console.error("Error deleting objectif:", error);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
}
