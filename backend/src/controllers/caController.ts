import { Request, Response } from "express";
import { ZodError } from "zod";
import {
  getCA,
  createCA,
  updateCA,
  deleteCA,
  getCAStats,
  getCAEntreprise,
} from "../models/ca.js";
import {
  caEntrepriseQuerySchema,
  caQuerySchema,
  caStatsQuerySchema,
  createCASchema,
  updateCASchema,
} from "../validation/caSchemas.js";

export async function getCAHandler(req: Request, res: Response) {
  try {
    const userId = (req as any).userId;
    const filters = caQuerySchema.parse(req.query);

    const ca = await getCA(userId, filters);

    res.json({ success: true, data: ca });
  } catch (error) {
    console.error("Error fetching CA:", error);
    if (error instanceof ZodError) {
      return res.status(400).json({ success: false, message: error.errors });
    }
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
}

export async function createCAHandler(req: Request, res: Response) {
  try {
    const userId = (req as any).userId;
    const input = createCASchema.parse(req.body);

    const ca = await createCA(userId, input);

    res.status(201).json({ success: true, data: ca });
  } catch (error) {
    console.error("Error creating CA:", error);
    if (error instanceof ZodError) {
      return res.status(400).json({ success: false, message: error.errors });
    }
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
}

export async function updateCAHandler(req: Request, res: Response) {
  try {
    const userId = (req as any).userId;
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const input = updateCASchema.parse(req.body);

    const ca = await updateCA(userId, id, input);

    if (!ca) {
      return res
        .status(404)
        .json({ success: false, message: "CA introuvable" });
    }

    res.json({ success: true, data: ca });
  } catch (error) {
    console.error("Error updating CA:", error);
    if (error instanceof ZodError) {
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
    const { annee, mois } = caStatsQuerySchema.parse(req.query);

    const stats = await getCAStats(userId, annee, mois);

    res.json({ success: true, data: stats });
  } catch (error) {
    console.error("Error fetching CA stats:", error);
    if (error instanceof ZodError) {
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
    const { annee } = caEntrepriseQuerySchema.parse(req.query);

    const stats = await getCAEntreprise(userId, entreprise_id, annee);

    res.json({ success: true, data: stats });
  } catch (error) {
    console.error("Error fetching entreprise CA:", error);
    if (error instanceof ZodError) {
      return res.status(400).json({ success: false, message: error.errors });
    }
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
}
