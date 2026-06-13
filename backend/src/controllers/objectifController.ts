import { Request, Response } from "express";
import { ZodError } from "zod";
import {
  getObjectifs,
  createObjectif,
  updateObjectif,
  deleteObjectif,
} from "../models/objectif.js";
import {
  createObjectifSchema,
  objectifQuerySchema,
  updateObjectifSchema,
} from "../validation/objectifSchemas.js";

export async function getObjectifsHandler(req: Request, res: Response) {
  try {
    const userId = (req as any).userId;
    const { annee } = objectifQuerySchema.parse(req.query);

    const objectifs = await getObjectifs(userId, annee);

    res.json({ success: true, data: objectifs });
  } catch (error) {
    console.error("Error fetching objectifs:", error);
    if (error instanceof ZodError) {
      return res.status(400).json({ success: false, message: error.errors });
    }
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
}

export async function createObjectifHandler(req: Request, res: Response) {
  try {
    const userId = (req as any).userId;
    const input = createObjectifSchema.parse(req.body);

    const objectif = await createObjectif(userId, input);

    res.status(201).json({ success: true, data: objectif });
  } catch (error) {
    console.error("Error creating objectif:", error);
    if (error instanceof ZodError) {
      return res.status(400).json({ success: false, message: error.errors });
    }
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
}

export async function updateObjectifHandler(req: Request, res: Response) {
  try {
    const userId = (req as any).userId;
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const input = updateObjectifSchema.parse(req.body);

    const objectif = await updateObjectif(userId, id, input);

    if (!objectif) {
      return res
        .status(404)
        .json({ success: false, message: "Objectif introuvable" });
    }

    res.json({ success: true, data: objectif });
  } catch (error) {
    console.error("Error updating objectif:", error);
    if (error instanceof ZodError) {
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
