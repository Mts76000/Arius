import { Request, Response } from "express";
import { streamRgpdExport } from "../services/exportService.js";

export async function downloadExport(req: Request, res: Response) {
  const userId = (req as any).userId;

  if (!userId) {
    return res.status(401).json({ error: "Non authentifié" });
  }

  const typeRaw = req.query.type;
  const type =
    typeof typeRaw === "string"
      ? typeRaw
      : Array.isArray(typeRaw) && typeof typeRaw[0] === "string"
        ? typeRaw[0]
        : undefined;

  try {
    await streamRgpdExport(userId, res, type);
  } catch (error) {
    console.error("Erreur export RGPD:", error);
    if (!res.headersSent) {
      res
        .status(500)
        .json({ error: "Erreur lors de la génération de l'export" });
    }
  }
}
