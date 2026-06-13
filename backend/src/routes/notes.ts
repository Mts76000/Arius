import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import {
  listByEntreprise,
  get,
  create,
  update,
  remove,
  search,
  getTemplates,
  getDashboard,
} from "../controllers/noteController.js";

const router = Router();

/**
 * @openapi
 * /v1/entreprises/{id}/notes:
 *   get:
 *     summary: Liste les notes d'une entreprise
 *     tags: [Notes]
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
 *         description: Liste des notes
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 * /v1/notes:
 *   post:
 *     summary: Cree une note
 *     tags: [Notes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NoteInput'
 *     responses:
 *       201:
 *         description: Note creee
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 * /v1/notes/{id}:
 *   get:
 *     summary: Recupere une note
 *     tags: [Notes]
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
 *         description: Note trouvee
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *   put:
 *     summary: Met a jour une note
 *     tags: [Notes]
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
 *             $ref: '#/components/schemas/NoteInput'
 *     responses:
 *       200:
 *         description: Note mise a jour
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *   delete:
 *     summary: Supprime une note
 *     tags: [Notes]
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
 *         description: Note supprimee
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.get("/entreprises/:id/notes", requireAuth, listByEntreprise);
router.get("/notes/:id", requireAuth, get);
router.post("/notes", requireAuth, create);
router.put("/notes/:id", requireAuth, update);
router.delete("/notes/:id", requireAuth, remove);

/**
 * @openapi
 * /v1/notes/search:
 *   get:
 *     summary: Recherche des notes
 *     tags: [Notes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Resultats de recherche
 * /v1/templates/notes:
 *   get:
 *     summary: Liste les templates de notes
 *     tags: [Notes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Templates disponibles
 * /v1/dashboard/clients-suivi:
 *   get:
 *     summary: Recupere les donnees de suivi clients
 *     tags: [Notes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Donnees du dashboard
 */
router.get("/notes/search", requireAuth, search);
router.get("/templates/notes", requireAuth, getTemplates);
router.get("/dashboard/clients-suivi", requireAuth, getDashboard);

export default router;
