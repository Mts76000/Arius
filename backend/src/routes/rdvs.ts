import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import {
  listMyRdvs,
  listByEntreprise,
  get,
  create,
  update,
  remove,
} from "../controllers/rdvController.js";

const router = Router();

/**
 * @openapi
 * /v1/rdvs:
 *   get:
 *     summary: Liste les RDVs de l'utilisateur
 *     tags: [RDVs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des RDVs
 *   post:
 *     summary: Cree un RDV
 *     tags: [RDVs]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RdvInput'
 *     responses:
 *       201:
 *         description: RDV cree
 * /v1/entreprises/{id}/rdvs:
 *   get:
 *     summary: Liste les RDVs d'une entreprise
 *     tags: [RDVs]
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
 *         description: Liste des RDVs
 * /v1/rdvs/{id}:
 *   get:
 *     summary: Recupere un RDV
 *     tags: [RDVs]
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
 *         description: RDV trouve
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *   put:
 *     summary: Met a jour un RDV
 *     tags: [RDVs]
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
 *             $ref: '#/components/schemas/RdvInput'
 *     responses:
 *       200:
 *         description: RDV mis a jour
 *   delete:
 *     summary: Supprime un RDV
 *     tags: [RDVs]
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
 *         description: RDV supprime
 */
router.get("/rdvs", requireAuth, listMyRdvs);
router.get("/entreprises/:id/rdvs", requireAuth, listByEntreprise);
router.get("/rdvs/:id", requireAuth, get);
router.post("/rdvs", requireAuth, create);
router.put("/rdvs/:id", requireAuth, update);
router.delete("/rdvs/:id", requireAuth, remove);

export default router;
