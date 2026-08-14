import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/auth.js";
import { v4 as uuidv4 } from "uuid";
import { Rdv } from "../models/rdv.js";
import {
  createRdvSchema,
  listEntrepriseRdvsQuerySchema,
  listMyRdvsQuerySchema,
  updateRdvSchema,
} from "../validation/rdvSchemas.js";
import {
  sendError,
  sendInternalError,
  sendValidationError,
} from "../http/apiResponse.js";

export async function listMyRdvs(req: AuthenticatedRequest, res: Response) {
  try {
    const parsedQuery = listMyRdvsQuerySchema.safeParse(
      req.validatedQuery ?? req.query,
    );
    if (!parsedQuery.success) return sendValidationError(res, parsedQuery.error);
    const { statut, de, a, page = 1, limite = 20 } = parsedQuery.data;
    const userId = req.userId;

    if (!userId) {
      return sendError(res, 401, "unauthorized", "Non authentifie");
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
        filter.date_prevue.$gte = new Date(de);
      }
      if (a) {
        filter.date_prevue.$lte = new Date(a);
      }
    }

    const pageNum = Math.max(1, page || 1);
    const limiteNum = Math.min(100, Math.max(1, limite || 20));
    const skip = (pageNum - 1) * limiteNum;

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const rdvs = await Rdv.aggregate([
      { $match: filter },
      {
        $addFields: {
          __isUpcoming: { $gte: ["$date_prevue", startOfToday] },
          __sortDate: { $toLong: "$date_prevue" },
        },
      },
      {
        $addFields: {
          __sortBucket: { $cond: ["$__isUpcoming", 0, 1] },
          __sortValue: {
            $cond: [
              "$__isUpcoming",
              "$__sortDate",
              { $multiply: ["$__sortDate", -1] },
            ],
          },
        },
      },
      { $sort: { __sortBucket: 1, __sortValue: 1 } },
      { $skip: skip },
      { $limit: limiteNum },
      {
        $project: {
          __isUpcoming: 0,
          __sortDate: 0,
          __sortBucket: 0,
          __sortValue: 0,
        },
      },
    ]);

    const total = await Rdv.countDocuments(filter);

    res.json({
      rdvs,
      pagination: { page: pageNum, limite: limiteNum, total },
    });
  } catch (error) {
    console.error("Erreur listMyRdvs:", error);
    sendInternalError(res);
  }
}

export async function listByEntreprise(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    const parsedQuery = listEntrepriseRdvsQuerySchema.safeParse(
      req.validatedQuery ?? req.query,
    );
    if (!parsedQuery.success) return sendValidationError(res, parsedQuery.error);
    const { de, a, page = 1, limite = 20 } = parsedQuery.data;
    const userId = req.userId;

    if (!userId) {
      return sendError(res, 401, "unauthorized", "Non authentifie");
    }

    const filter: any = { entreprise_id: id, user_id: userId };

    if (de || a) {
      filter.date_prevue = {};
      if (de) {
        filter.date_prevue.$gte = new Date(de);
      }
      if (a) {
        filter.date_prevue.$lte = new Date(a);
      }
    }

    const pageNum = Math.max(1, page || 1);
    const limiteNum = Math.min(100, Math.max(1, limite || 20));
    const skip = (pageNum - 1) * limiteNum;

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const rdvs = await Rdv.aggregate([
      { $match: filter },
      {
        $addFields: {
          __isUpcoming: { $gte: ["$date_prevue", startOfToday] },
          __sortDate: { $toLong: "$date_prevue" },
        },
      },
      {
        $addFields: {
          __sortBucket: { $cond: ["$__isUpcoming", 0, 1] },
          __sortValue: {
            $cond: [
              "$__isUpcoming",
              "$__sortDate",
              { $multiply: ["$__sortDate", -1] },
            ],
          },
        },
      },
      { $sort: { __sortBucket: 1, __sortValue: 1 } },
      { $skip: skip },
      { $limit: limiteNum },
      {
        $project: {
          __isUpcoming: 0,
          __sortDate: 0,
          __sortBucket: 0,
          __sortValue: 0,
        },
      },
    ]);

    const total = await Rdv.countDocuments(filter);

    res.json({
      rdvs,
      pagination: { page: pageNum, limite: limiteNum, total },
    });
  } catch (error) {
    console.error("Erreur listByEntreprise:", error);
    sendInternalError(res);
  }
}

export async function get(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    const userId = req.userId;

    if (!userId) {
      return sendError(res, 401, "unauthorized", "Non authentifie");
    }

    const rdv = await Rdv.findOne({ _id: id, user_id: userId });

    if (!rdv) {
      return sendError(res, 404, "not_found", "RDV introuvable");
    }

    res.json(rdv);
  } catch (error) {
    console.error("Erreur get:", error);
    sendInternalError(res);
  }
}

export async function create(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.userId;

    if (!userId) {
      return sendError(res, 401, "unauthorized", "Non authentifie");
    }

    const validation = createRdvSchema.safeParse(req.validatedBody ?? req.body);

    if (!validation.success) {
      return sendValidationError(res, validation.error);
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
    sendInternalError(res);
  }
}

export async function update(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    const userId = req.userId;

    if (!userId) {
      return sendError(res, 401, "unauthorized", "Non authentifie");
    }

    const validation = updateRdvSchema.safeParse(req.validatedBody ?? req.body);

    if (!validation.success) {
      return sendValidationError(res, validation.error);
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
      return sendError(res, 404, "not_found", "RDV introuvable");
    }

    res.json(rdv);
  } catch (error) {
    console.error("Erreur update:", error);
    sendInternalError(res);
  }
}

export async function remove(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    const userId = req.userId;

    if (!userId) {
      return sendError(res, 401, "unauthorized", "Non authentifie");
    }

    const result = await Rdv.deleteOne({ _id: id, user_id: userId });

    if (result.deletedCount === 0) {
      return sendError(res, 404, "not_found", "RDV introuvable");
    }

    res.json({ message: "RDV supprimé" });
  } catch (error) {
    console.error("Erreur remove:", error);
    sendInternalError(res);
  }
}
