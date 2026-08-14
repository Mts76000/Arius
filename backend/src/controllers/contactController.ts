import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/auth.js";
import {
  getContactsByEntreprise,
  getContactById,
  createContact,
  updateContact,
  deleteContact,
} from "../models/contact.js";
import { getEntrepriseById } from "../models/entreprise.js";
import {
  createContactSchema,
  updateContactSchema,
} from "../validation/contactSchemas.js";
import {
  sendError,
  sendInternalError,
  sendValidationError,
} from "../http/apiResponse.js";

export async function listContactsByEntreprise(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.userId as string;
    const { entreprise_id } = req.params;

    if (!entreprise_id || typeof entreprise_id !== "string") {
      return sendError(res, 400, "validation_error", "ID entreprise invalide");
    }

    // Vérifier que l'entreprise appartient à l'utilisateur
    const entreprise = await getEntrepriseById(entreprise_id, userId);
    if (!entreprise) {
      return sendError(res, 404, "not_found", "Entreprise introuvable");
    }

    const contacts = await getContactsByEntreprise(entreprise_id, userId);
    return res.json(contacts);
  } catch (error) {
    console.error("Error listing contacts:", error);
    return sendInternalError(res);
  }
}

export async function getContact(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.userId as string;
    const { id } = req.params;

    if (!id || typeof id !== "string") {
      return sendError(res, 400, "validation_error", "ID contact invalide");
    }

    const contact = await getContactById(id, userId);
    if (!contact) {
      return sendError(res, 404, "not_found", "Contact introuvable");
    }

    return res.json(contact);
  } catch (error) {
    console.error("Error getting contact:", error);
    return sendInternalError(res);
  }
}

export async function createContactHandler(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.userId as string;
    const { entreprise_id } = req.params;

    if (!entreprise_id || typeof entreprise_id !== "string") {
      return sendError(res, 400, "validation_error", "ID entreprise invalide");
    }

    // Vérifier que l'entreprise appartient à l'utilisateur
    const entreprise = await getEntrepriseById(entreprise_id, userId);
    if (!entreprise) {
      return sendError(res, 404, "not_found", "Entreprise introuvable");
    }

    const parsed = createContactSchema.safeParse(
      req.validatedBody ?? req.body,
    );
    if (!parsed.success) {
      return sendValidationError(res, parsed.error);
    }

    const contact = await createContact(userId, {
      entreprise_id,
      ...parsed.data,
    });

    return res.status(201).json(contact);
  } catch (error) {
    console.error("Error creating contact:", error);
    return sendInternalError(res);
  }
}

export async function updateContactHandler(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.userId as string;
    const { id } = req.params;

    if (!id || typeof id !== "string") {
      return sendError(res, 400, "validation_error", "ID contact invalide");
    }

    const parsed = updateContactSchema.safeParse(
      req.validatedBody ?? req.body,
    );
    if (!parsed.success) {
      return sendValidationError(res, parsed.error);
    }

    const contact = await updateContact(id, userId, parsed.data);
    if (!contact) {
      return sendError(res, 404, "not_found", "Contact introuvable");
    }

    return res.json(contact);
  } catch (error) {
    console.error("Error updating contact:", error);
    return sendInternalError(res);
  }
}

export async function deleteContactHandler(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.userId as string;
    const { id } = req.params;

    if (!id || typeof id !== "string") {
      return sendError(res, 400, "validation_error", "ID contact invalide");
    }

    const deleted = await deleteContact(id, userId);
    if (!deleted) {
      return sendError(res, 404, "not_found", "Contact introuvable");
    }

    return res.status(204).send();
  } catch (error) {
    console.error("Error deleting contact:", error);
    return sendInternalError(res);
  }
}
