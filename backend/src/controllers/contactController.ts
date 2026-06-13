import { Request, Response } from "express";
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

export async function listContactsByEntreprise(req: Request, res: Response) {
  try {
    const userId = (req as any).userId;
    const { entreprise_id } = req.params;

    if (!entreprise_id || typeof entreprise_id !== "string") {
      return res.status(400).json({ error: "ID entreprise invalide" });
    }

    // Vérifier que l'entreprise appartient à l'utilisateur
    const entreprise = await getEntrepriseById(entreprise_id, userId);
    if (!entreprise) {
      return res.status(404).json({ error: "Entreprise non trouvée" });
    }

    const contacts = await getContactsByEntreprise(entreprise_id, userId);
    return res.json(contacts);
  } catch (error) {
    console.error("Error listing contacts:", error);
    return res.status(500).json({ error: "Erreur serveur" });
  }
}

export async function getContact(req: Request, res: Response) {
  try {
    const userId = (req as any).userId;
    const { id } = req.params;

    if (!id || typeof id !== "string") {
      return res.status(400).json({ error: "ID contact invalide" });
    }

    const contact = await getContactById(id, userId);
    if (!contact) {
      return res.status(404).json({ error: "Contact non trouvé" });
    }

    return res.json(contact);
  } catch (error) {
    console.error("Error getting contact:", error);
    return res.status(500).json({ error: "Erreur serveur" });
  }
}

export async function createContactHandler(req: Request, res: Response) {
  try {
    const userId = (req as any).userId;
    const { entreprise_id } = req.params;

    if (!entreprise_id || typeof entreprise_id !== "string") {
      return res.status(400).json({ error: "ID entreprise invalide" });
    }

    // Vérifier que l'entreprise appartient à l'utilisateur
    const entreprise = await getEntrepriseById(entreprise_id, userId);
    if (!entreprise) {
      return res.status(404).json({ error: "Entreprise non trouvée" });
    }

    const parsed = createContactSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten() });
    }

    const contact = await createContact(userId, {
      entreprise_id,
      ...parsed.data,
    });

    return res.status(201).json(contact);
  } catch (error) {
    console.error("Error creating contact:", error);
    return res.status(500).json({ error: "Erreur serveur" });
  }
}

export async function updateContactHandler(req: Request, res: Response) {
  try {
    const userId = (req as any).userId;
    const { id } = req.params;

    if (!id || typeof id !== "string") {
      return res.status(400).json({ error: "ID contact invalide" });
    }

    const parsed = updateContactSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten() });
    }

    const contact = await updateContact(id, userId, parsed.data);
    if (!contact) {
      return res.status(404).json({ error: "Contact non trouvé" });
    }

    return res.json(contact);
  } catch (error) {
    console.error("Error updating contact:", error);
    return res.status(500).json({ error: "Erreur serveur" });
  }
}

export async function deleteContactHandler(req: Request, res: Response) {
  try {
    const userId = (req as any).userId;
    const { id } = req.params;

    if (!id || typeof id !== "string") {
      return res.status(400).json({ error: "ID contact invalide" });
    }

    const deleted = await deleteContact(id, userId);
    if (!deleted) {
      return res.status(404).json({ error: "Contact non trouvé" });
    }

    return res.status(204).send();
  } catch (error) {
    console.error("Error deleting contact:", error);
    return res.status(500).json({ error: "Erreur serveur" });
  }
}
