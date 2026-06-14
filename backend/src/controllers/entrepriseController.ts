import { Request, Response } from "express";
import {
  getEntreprises,
  getEntrepriseById,
  createEntreprise,
  updateEntreprise,
  deleteEntreprise,
} from "../models/entreprise.js";
import {
  createEntrepriseSchema,
  updateEntrepriseSchema,
} from "../validation/entrepriseSchemas.js";
import {
  sendError,
  sendInternalError,
  sendValidationError,
} from "../http/apiResponse.js";

export async function list(req: Request, res: Response) {
  try {
    const userId = (req as any).userId as string;
    if (!userId) return sendError(res, 401, "unauthorized", "Non authentifie");

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
    return sendInternalError(res);
  }
}

export async function get(req: Request, res: Response) {
  try {
    const userId = (req as any).userId as string;
    if (!userId) return sendError(res, 401, "unauthorized", "Non authentifie");

    const { id } = req.params;
    const entreprise = await getEntrepriseById(id as string, userId);

    if (!entreprise) {
      return sendError(res, 404, "not_found", "Entreprise introuvable");
    }

    return res.status(200).json(entreprise);
  } catch (error) {
    console.error("Error getting entreprise:", error);
    return sendInternalError(res);
  }
}

export async function create(req: Request, res: Response) {
  try {
    const userId = (req as any).userId as string;
    if (!userId) return sendError(res, 401, "unauthorized", "Non authentifie");

    const parsed = createEntrepriseSchema.safeParse(
      req.validatedBody ?? req.body,
    );
    if (!parsed.success) {
      return sendValidationError(res, parsed.error);
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
      return sendError(
        res,
        400,
        "validation_error",
        "Statut invalide. Verifie que la colonne enum `statut` inclut 'a_reactiver'.",
      );
    }
    return sendInternalError(res);
  }
}

export async function update(req: Request, res: Response) {
  try {
    const userId = (req as any).userId as string;
    if (!userId) return sendError(res, 401, "unauthorized", "Non authentifie");

    const { id } = req.params;
    const parsed = updateEntrepriseSchema.safeParse(
      req.validatedBody ?? req.body,
    );

    if (!parsed.success) {
      return sendValidationError(res, parsed.error);
    }

    const entreprise = await updateEntreprise(
      id as string,
      userId,
      parsed.data,
    );

    if (!entreprise) {
      return sendError(res, 404, "not_found", "Entreprise introuvable");
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
      return sendError(
        res,
        400,
        "validation_error",
        "Statut invalide. Verifie que la colonne enum `statut` inclut 'a_reactiver'.",
      );
    }
    return sendInternalError(res);
  }
}

export async function remove(req: Request, res: Response) {
  try {
    const userId = (req as any).userId as string;
    if (!userId) return sendError(res, 401, "unauthorized", "Non authentifie");

    const { id } = req.params;
    const deleted = await deleteEntreprise(id as string, userId);

    if (!deleted) {
      return sendError(res, 404, "not_found", "Entreprise introuvable");
    }

    return res.status(204).send();
  } catch (error) {
    console.error("Error deleting entreprise:", error);
    return sendInternalError(res);
  }
}
