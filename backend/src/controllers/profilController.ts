import { Request, Response } from "express";
import { pool } from "../db/mysql.js";
import { getUserById, hashPassword, comparePassword } from "../models/user.js";

export async function getProfil(req: Request, res: Response) {
  try {
    const userId = (req as any).userId;
    if (!userId) return res.status(401).json({ error: "unauthorized" });

    const user = await getUserById(userId);
    if (!user) return res.status(404).json({ error: "user not found" });

    return res.json({
      id: user.id,
      email: user.email,
      prenom: user.prenom,
      nom: user.nom,
      created_at: user.created_at,
    });
  } catch (e) {
    console.error("getProfil error:", e);
    return res.status(500).json({ error: "internal_error" });
  }
}

export async function updateProfil(req: Request, res: Response) {
  try {
    const userId = (req as any).userId;
    if (!userId) return res.status(401).json({ error: "unauthorized" });

    const { prenom, nom } = req.body ?? {};

    // Validation
    if (!prenom || typeof prenom !== "string")
      return res
        .status(400)
        .json({ error: "prenom required and must be string" });
    if (!nom || typeof nom !== "string")
      return res.status(400).json({ error: "nom required and must be string" });

    if (prenom.length < 2 || prenom.length > 50)
      return res.status(400).json({ error: "prenom must be 2-50 characters" });
    if (nom.length < 2 || nom.length > 50)
      return res.status(400).json({ error: "nom must be 2-50 characters" });

    // Update user
    const now = new Date().toISOString().slice(0, 19).replace("T", " ");
    await pool.execute(
      "UPDATE users SET prenom = ?, nom = ?, updated_at = ? WHERE id = ?",
      [prenom, nom, now, userId],
    );

    const user = await getUserById(userId);
    return res.json({
      id: user!.id,
      email: user!.email,
      prenom: user!.prenom,
      nom: user!.nom,
    });
  } catch (e) {
    console.error("updateProfil error:", e);
    return res.status(500).json({ error: "internal_error" });
  }
}

export async function changerMotdepasse(req: Request, res: Response) {
  try {
    const userId = (req as any).userId;
    if (!userId) return res.status(401).json({ error: "unauthorized" });

    const { ancienMotdepasse, nouveauMotdepasse, confirmation } =
      req.body ?? {};

    // Validation
    if (!ancienMotdepasse || typeof ancienMotdepasse !== "string")
      return res.status(400).json({ error: "ancienMotdepasse required" });
    if (!nouveauMotdepasse || typeof nouveauMotdepasse !== "string")
      return res.status(400).json({ error: "nouveauMotdepasse required" });
    if (!confirmation || typeof confirmation !== "string")
      return res.status(400).json({ error: "confirmation required" });

    if (nouveauMotdepasse !== confirmation)
      return res.status(400).json({ error: "passwords do not match" });

    // Validation mot de passe (min 6 caractères)
    if (nouveauMotdepasse.length < 6) {
      return res.status(400).json({
        error: "password must be at least 6 characters",
      });
    }

    const user = await getUserById(userId);
    if (!user || !user.password)
      return res.status(401).json({ error: "invalid credentials" });

    // Vérifier ancien mot de passe
    const isValid = await comparePassword(ancienMotdepasse, user.password);
    if (!isValid)
      return res.status(400).json({ error: "invalid old password" });

    // Hacher et mettre à jour
    const hashed = await hashPassword(nouveauMotdepasse);
    const now = new Date().toISOString().slice(0, 19).replace("T", " ");
    await pool.execute(
      "UPDATE users SET password = ?, updated_at = ? WHERE id = ?",
      [hashed, now, userId],
    );

    return res.json({ message: "password updated successfully" });
  } catch (e) {
    console.error("changerMotdepasse error:", e);
    return res.status(500).json({ error: "internal_error" });
  }
}
