import { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { Devis } from "../models/devis.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function listByEntreprise(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { search } = req.query;
    const userId = (req as any).userId;

    if (!userId) {
      return res.status(401).json({ error: "Non authentifié" });
    }

    const filter: any = { entreprise_id: id, user_id: userId };

    if (search && typeof search === "string") {
      filter.nom = { $regex: search, $options: "i" };
    }

    const devis = await Devis.find(filter).sort({ createdAt: -1 });

    res.json({ devis });
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

    const devis = await Devis.findOne({ _id: id, user_id: userId });

    if (!devis) {
      return res.status(404).json({ error: "Devis introuvable" });
    }

    res.json(devis);
  } catch (error) {
    console.error("Erreur get:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
}

export async function upload(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const userId = (req as any).userId;

    if (!userId) {
      return res.status(401).json({ error: "Non authentifié" });
    }

    if (!req.file) {
      return res.status(400).json({ error: "Fichier requis" });
    }

    const { nom, notes } = req.body;

    if (!nom || (typeof nom === "string" && nom.trim().length < 3)) {
      if (req.file) fs.rmSync(req.file.path, { force: true });
      return res
        .status(400)
        .json({
          error: `Nom du devis requis (min 3 caractères). Reçu: ${nom}`,
        });
    }

    const devis = new Devis({
      _id: uuidv4(),
      user_id: userId,
      entreprise_id: id,
      nom: nom.trim(),
      notes: notes?.trim() || undefined,
      nom_fichier: req.file.filename,
      url_fichier: `/uploads/entreprises/${id}/devis/${req.file.filename}`,
      type_mime: req.file.mimetype,
      taille_octets: req.file.size,
    });

    await devis.save();

    res.status(201).json(devis);
  } catch (error) {
    console.error("Erreur upload:", error);
    if (req.file) {
      fs.rmSync(req.file.path, { force: true });
    }
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

    const devis = await Devis.findOne({ _id: id, user_id: userId });

    if (!devis) {
      return res.status(404).json({ error: "Devis introuvable" });
    }

    const uploadsDir = path.join(
      path.dirname(path.dirname(__dirname)),
      "uploads",
    );
    const filePath = path.join(
      uploadsDir,
      "entreprises",
      devis.entreprise_id,
      "devis",
      devis.nom_fichier,
    );

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await Devis.deleteOne({ _id: id });

    res.json({ message: "Devis supprimé" });
  } catch (error) {
    console.error("Erreur remove:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
}
