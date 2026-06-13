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

/**
 * @openapi
 * /v1/entreprises/{entreprise_id}/contacts:
 *   get:
 *     summary: Liste les contacts d'une entreprise
 *     tags: [Contacts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: entreprise_id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Liste des contacts
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *   post:
 *     summary: Cree un contact pour une entreprise
 *     tags: [Contacts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: entreprise_id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ContactInput'
 *     responses:
 *       201:
 *         description: Contact cree
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 * /v1/contacts/{id}:
 *   get:
 *     summary: Recupere un contact
 *     tags: [Contacts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Contact trouve
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *   put:
 *     summary: Met a jour un contact
 *     tags: [Contacts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ContactInput'
 *     responses:
 *       200:
 *         description: Contact mis a jour
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *   delete:
 *     summary: Supprime un contact
 *     tags: [Contacts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Contact supprime
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
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
