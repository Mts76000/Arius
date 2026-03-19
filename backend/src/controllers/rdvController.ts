import { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";
import { Rdv, RdvStatus } from "../models/rdv.js";

// Zod schemas
const CreateRdvSchema = z.object({
  titre: z.string().min(3, "Titre requis (min 3 caractères)"),
  description: z.string().optional(),
  date_prevue: z.string().datetime("Date invalide"),
  duree_minutes: z.number().int().min(1, "Durée invalide"),
  entreprise_id: z.string().min(1, "Entreprise requise"),
  contact_id: z.string().optional(),
  statut: z.enum(["planifie", "termine", "annule"]).optional(),
});

const UpdateRdvSchema = z.object({
  titre: z.string().min(3).optional(),
  description: z.string().optional(),
  date_prevue: z.string().datetime().optional(),
  duree_minutes: z.number().int().min(1, "Durée invalide").optional(),
  statut: z.enum(["planifie", "termine", "annule"]).optional(),
});

type CreateRdvInput = z.infer<typeof CreateRdvSchema>;
type UpdateRdvInput = z.infer<typeof UpdateRdvSchema>;

export async function listMyRdvs(req: Request, res: Response) {
  try {
    const { statut, de, a, page = "1", limite = "20" } = req.query;
    const userId = (req as any).userId;

    if (!userId) {
      return res.status(401).json({ error: "Non authentifié" });
    }

    const filter: any = { user_id: userId };

    // Filtrer par statut
    if (statut) {
      filter.statut = statut;
    }

    // Filtrer par plage dates
    if (de || a) {
      filter.date_prevue = {};
      if (de) {
        filter.date_prevue.$gte = new Date(de as string);
      }
      if (a) {
        filter.date_prevue.$lte = new Date(a as string);
      }
    }

    const pageNum = Math.max(1, parseInt(page as string) || 1);
    const limiteNum = Math.min(
      100,
      Math.max(1, parseInt(limite as string) || 20),
    );
    const skip = (pageNum - 1) * limiteNum;

    const rdvs = await Rdv.find(filter)
      .sort({ date_prevue: -1 })
      .skip(skip)
      .limit(limiteNum);

    const total = await Rdv.countDocuments(filter);

    res.json({
      rdvs,
      pagination: { page: pageNum, limite: limiteNum, total },
    });
  } catch (error) {
    console.error("Erreur listMyRdvs:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
}

export async function listByEntreprise(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const userId = (req as any).userId;

    if (!userId) {
      return res.status(401).json({ error: "Non authentifié" });
    }

    const rdvs = await Rdv.find({ entreprise_id: id, user_id: userId }).sort({
      date_prevue: -1,
    });

    res.json({ rdvs });
  } catch (error) {
    console.error("Erreur listByEntreprise:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
}

export async function get(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const userId = (req as any).userId;

    if (!userId) {
      return res.status(401).json({ error: "Non authentifié" });
    }

    const rdv = await Rdv.findOne({ _id: id, user_id: userId });

    if (!rdv) {
      return res.status(404).json({ error: "RDV introuvable" });
    }

    res.json(rdv);
  } catch (error) {
    console.error("Erreur get:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
}

export async function create(req: Request, res: Response) {
  try {
    const userId = (req as any).userId;

    if (!userId) {
      return res.status(401).json({ error: "Non authentifié" });
    }

    const validation = CreateRdvSchema.safeParse(req.body);

    if (!validation.success) {
      console.log(
        "Validation error:",
        JSON.stringify(validation.error.errors, null, 2),
      );
      console.log("Request body:", req.body);
      return res.status(400).json({ errors: validation.error.errors });
    }

    const {
      titre,
      description,
      date_prevue,
      duree_minutes,
      entreprise_id,
      contact_id,
      statut,
    } = validation.data;

    const rdv = new Rdv({
      _id: uuidv4(),
      user_id: userId,
      entreprise_id,
      contact_id,
      titre,
      description,
      date_prevue: new Date(date_prevue),
      duree_minutes,
      statut: statut || "planifie",
    });

    await rdv.save();

    res.status(201).json(rdv);
  } catch (error) {
    console.error("Erreur create:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
}

export async function update(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const userId = (req as any).userId;

    if (!userId) {
      return res.status(401).json({ error: "Non authentifié" });
    }

    const validation = UpdateRdvSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({ error: validation.error.errors });
    }

    const updateData = validation.data;
    if (updateData.date_prevue) {
      (updateData as any).date_prevue = new Date(updateData.date_prevue);
    }

    const rdv = await Rdv.findOneAndUpdate(
      { _id: id, user_id: userId },
      updateData,
      { new: true },
    );

    if (!rdv) {
      return res.status(404).json({ error: "RDV introuvable" });
    }

    res.json(rdv);
  } catch (error) {
    console.error("Erreur update:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
}

export async function remove(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const userId = (req as any).userId;

    if (!userId) {
      return res.status(401).json({ error: "Non authentifié" });
    }

    const result = await Rdv.deleteOne({ _id: id, user_id: userId });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "RDV introuvable" });
    }

    res.json({ message: "RDV supprimé" });
  } catch (error) {
    console.error("Erreur remove:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
}
