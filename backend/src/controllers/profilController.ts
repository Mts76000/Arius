import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/auth.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { pool } from "../db/mysql.js";
import {
  anonymizeUser,
  comparePassword,
  getUserById,
  hashPassword,
  isAnonymizedUser,
} from "../models/user.js";
import { Note } from "../models/note.js";
import { Rdv } from "../models/rdv.js";
import { Devis } from "../models/devis.js";
import {
  sendError,
  sendInternalError,
  sendValidationError,
} from "../http/apiResponse.js";
import {
  anonymizeAccountSchema,
  changePasswordSchema,
  updateProfilSchema,
} from "../validation/profilSchemas.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function getProfil(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.userId;
    if (!userId) return sendError(res, 401, "unauthorized", "Non authentifie");

    const user = await getUserById(userId);
    if (!user) return sendError(res, 404, "not_found", "Utilisateur introuvable");
    if (isAnonymizedUser(user))
      return sendError(res, 410, "forbidden", "Compte anonymise");

    return res.json({
      id: user.id,
      email: user.email,
      prenom: user.prenom,
      nom: user.nom,
      created_at: user.created_at,
    });
  } catch (e) {
    console.error("getProfil error:", e);
    return sendInternalError(res);
  }
}

export async function updateProfil(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.userId;
    if (!userId) return sendError(res, 401, "unauthorized", "Non authentifie");
    const parsedBody = updateProfilSchema.safeParse(
      req.validatedBody ?? req.body ?? {},
    );
    if (!parsedBody.success) return sendValidationError(res, parsedBody.error);
    const { prenom, nom } = parsedBody.data as {
      prenom?: string | null;
      nom: string;
    };

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
    return sendInternalError(res);
  }
}

export async function anonymiserCompte(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.userId;
    if (!userId) return sendError(res, 401, "unauthorized", "Non authentifie");
    const parsedBody = anonymizeAccountSchema.safeParse(
      req.validatedBody ?? req.body ?? {},
    );
    if (!parsedBody.success) return sendValidationError(res, parsedBody.error);
    const body = parsedBody.data as {
      password?: string;
      motdepasse?: string;
    };
    const motdepasse = body.motdepasse ?? body.password;
    if (!motdepasse) {
      return sendError(res, 400, "validation_error", "Mot de passe requis");
    }

    const user = await getUserById(userId);
    if (!user) return sendError(res, 404, "not_found", "Utilisateur introuvable");
    if (isAnonymizedUser(user)) {
      return sendError(res, 410, "forbidden", "Compte deja anonymise");
    }
    if (!user.password) {
      return sendError(res, 400, "validation_error", "Mot de passe indisponible");
    }

    const isValid = await comparePassword(motdepasse, user.password);
    if (!isValid) {
      return sendError(res, 400, "invalid_credentials", "Mot de passe invalide");
    }

    const [entrepriseRows] = await pool.execute(
      "SELECT id FROM entreprises WHERE user_id = ?",
      [userId],
    );
    const entrepriseIds = (entrepriseRows as { id: string }[]).map(
      (row) => row.id,
    );
    const uploadsDir = path.join(
      path.dirname(path.dirname(__dirname)),
      "uploads",
    );

    for (const entrepriseId of entrepriseIds) {
      const entrepriseUploadDir = path.join(
        uploadsDir,
        "entreprises",
        entrepriseId,
      );
      if (fs.existsSync(entrepriseUploadDir)) {
        fs.rmSync(entrepriseUploadDir, { recursive: true, force: true });
      }
    }

    await Promise.all([
      Note.deleteMany({ user_id: userId }),
      Rdv.deleteMany({ user_id: userId }),
      Devis.deleteMany({ user_id: userId }),
    ]);

    await pool.execute("DELETE FROM ca_mensuel WHERE user_id = ?", [userId]);
    await pool.execute("DELETE FROM objectifs_mensuels WHERE user_id = ?", [
      userId,
    ]);
    await pool.execute("DELETE FROM contacts WHERE user_id = ?", [userId]);
    await pool.execute("DELETE FROM entreprises WHERE user_id = ?", [userId]);

    await anonymizeUser(userId);
    return res.json({ message: "account deleted and anonymized successfully" });
  } catch (e) {
    console.error("anonymiserCompte error:", e);
    return sendInternalError(res);
  }
}

export async function changerMotdepasse(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.userId;
    if (!userId) return sendError(res, 401, "unauthorized", "Non authentifie");

    const parsedBody = changePasswordSchema.safeParse(
      req.validatedBody ?? req.body ?? {},
    );
    if (!parsedBody.success) return sendValidationError(res, parsedBody.error);
    const { ancienMotdepasse, nouveauMotdepasse, confirmation } =
      parsedBody.data;

    if (nouveauMotdepasse !== confirmation)
      return sendError(
        res,
        400,
        "validation_error",
        "Les mots de passe ne correspondent pas",
      );

    const user = await getUserById(userId);
    if (!user || !user.password)
      return sendError(res, 401, "invalid_credentials", "Identifiants invalides");

    // Vérifier ancien mot de passe
    const isValid = await comparePassword(ancienMotdepasse, user.password);
    if (!isValid)
      return sendError(
        res,
        400,
        "invalid_credentials",
        "Ancien mot de passe invalide",
      );

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
    return sendInternalError(res);
  }
}
