import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/auth.js";
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
import {
  sendError,
  sendInternalError,
  sendValidationError,
} from "../http/apiResponse.js";

export async function getCAHandler(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.userId as string;
    if (!userId) return sendError(res, 401, "unauthorized", "Non authentifie");
    const parsedQuery = caQuerySchema.safeParse(req.validatedQuery ?? req.query);
    if (!parsedQuery.success) return sendValidationError(res, parsedQuery.error);
    const filters = parsedQuery.data;

    const ca = await getCA(userId, filters);

    res.json({ success: true, data: ca });
  } catch (error) {
    console.error("Error fetching CA:", error);
    sendInternalError(res);
  }
}

export async function createCAHandler(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.userId as string;
    const parsedBody = createCASchema.safeParse(req.validatedBody ?? req.body);
    if (!parsedBody.success) return sendValidationError(res, parsedBody.error);
    const input = parsedBody.data;

    const ca = await createCA(userId, input);

    res.status(201).json({ success: true, data: ca });
  } catch (error) {
    console.error("Error creating CA:", error);
    sendInternalError(res);
  }
}

export async function updateCAHandler(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.userId as string;
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const parsedBody = updateCASchema.safeParse(req.validatedBody ?? req.body);
    if (!parsedBody.success) return sendValidationError(res, parsedBody.error);
    const input = parsedBody.data;

    const ca = await updateCA(userId, id, input);

    if (!ca) {
      return sendError(res, 404, "not_found", "CA introuvable");
    }

    res.json({ success: true, data: ca });
  } catch (error) {
    console.error("Error updating CA:", error);
    sendInternalError(res);
  }
}

export async function deleteCAHandler(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.userId as string;
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    const deleted = await deleteCA(userId, id);

    if (!deleted) {
      return sendError(res, 404, "not_found", "CA introuvable");
    }

    res.json({ success: true, message: "CA supprimé" });
  } catch (error) {
    console.error("Error deleting CA:", error);
    sendInternalError(res);
  }
}

export async function getCAStatsHandler(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.userId as string;
    const parsedQuery = caStatsQuerySchema.safeParse(
      req.validatedQuery ?? req.query,
    );
    if (!parsedQuery.success) return sendValidationError(res, parsedQuery.error);
    const { annee, mois } = parsedQuery.data;

    const stats = await getCAStats(userId, annee, mois);

    res.json({ success: true, data: stats });
  } catch (error) {
    console.error("Error fetching CA stats:", error);
    sendInternalError(res);
  }
}

export async function getCAEntrepriseHandler(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.userId as string;
    const entreprise_id = Array.isArray(req.params.entreprise_id)
      ? req.params.entreprise_id[0]
      : req.params.entreprise_id;
    const parsedQuery = caEntrepriseQuerySchema.safeParse(
      req.validatedQuery ?? req.query,
    );
    if (!parsedQuery.success) return sendValidationError(res, parsedQuery.error);
    const { annee } = parsedQuery.data;

    const stats = await getCAEntreprise(userId, entreprise_id, annee);

    res.json({ success: true, data: stats });
  } catch (error) {
    console.error("Error fetching entreprise CA:", error);
    sendInternalError(res);
  }
}
