import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/auth.js";
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
import {
  sendError,
  sendInternalError,
  sendValidationError,
} from "../http/apiResponse.js";

export async function getObjectifsHandler(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.userId as string;
    const parsedQuery = objectifQuerySchema.safeParse(
      req.validatedQuery ?? req.query,
    );
    if (!parsedQuery.success) return sendValidationError(res, parsedQuery.error);
    const { annee } = parsedQuery.data;

    const objectifs = await getObjectifs(userId, annee);

    res.json({ success: true, data: objectifs });
  } catch (error) {
    console.error("Error fetching objectifs:", error);
    sendInternalError(res);
  }
}

export async function createObjectifHandler(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.userId as string;
    const parsedBody = createObjectifSchema.safeParse(
      req.validatedBody ?? req.body,
    );
    if (!parsedBody.success) return sendValidationError(res, parsedBody.error);
    const input = parsedBody.data;

    const objectif = await createObjectif(userId, input);

    res.status(201).json({ success: true, data: objectif });
  } catch (error) {
    console.error("Error creating objectif:", error);
    sendInternalError(res);
  }
}

export async function updateObjectifHandler(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.userId as string;
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const parsedBody = updateObjectifSchema.safeParse(
      req.validatedBody ?? req.body,
    );
    if (!parsedBody.success) return sendValidationError(res, parsedBody.error);
    const input = parsedBody.data;

    const objectif = await updateObjectif(userId, id, input);

    if (!objectif) {
      return sendError(res, 404, "not_found", "Objectif introuvable");
    }

    res.json({ success: true, data: objectif });
  } catch (error) {
    console.error("Error updating objectif:", error);
    sendInternalError(res);
  }
}

export async function deleteObjectifHandler(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.userId as string;
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    const deleted = await deleteObjectif(userId, id);

    if (!deleted) {
      return sendError(res, 404, "not_found", "Objectif introuvable");
    }

    res.json({ success: true, message: "Objectif supprimé" });
  } catch (error) {
    console.error("Error deleting objectif:", error);
    sendInternalError(res);
  }
}
