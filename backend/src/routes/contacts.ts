import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import {
  listContactsByEntreprise,
  getContact,
  createContactHandler,
  updateContactHandler,
  deleteContactHandler,
} from "../controllers/contactController.js";

const router = Router();

// Routes pour les contacts d'une entreprise
router.get(
  "/entreprises/:entreprise_id/contacts",
  requireAuth,
  listContactsByEntreprise,
);
router.post(
  "/entreprises/:entreprise_id/contacts",
  requireAuth,
  createContactHandler,
);

// Routes pour un contact spécifique
router.get("/contacts/:id", requireAuth, getContact);
router.put("/contacts/:id", requireAuth, updateContactHandler);
router.delete("/contacts/:id", requireAuth, deleteContactHandler);

export default router;
