import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import {
  getCAHandler,
  createCAHandler,
  updateCAHandler,
  deleteCAHandler,
  getCAStatsHandler,
  getCAEntrepriseHandler,
} from "../controllers/caController.js";
import { validateBody, validateQuery } from "../middleware/validate.js";
import {
  caEntrepriseQuerySchema,
  caQuerySchema,
  caStatsQuerySchema,
  createCASchema,
  updateCASchema,
} from "../validation/caSchemas.js";

const router = Router();

/**
 * @openapi
 * /v1/ca:
 *   get:
 *     summary: Liste les entrees de chiffre d'affaires
 *     tags: [CA]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste du chiffre d'affaires
 *   post:
 *     summary: Cree une entree de chiffre d'affaires
 *     tags: [CA]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CAInput'
 *     responses:
 *       201:
 *         description: Entree creee
 * /v1/ca/stats:
 *   get:
 *     summary: Recupere les statistiques de chiffre d'affaires
 *     tags: [CA]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistiques CA
 * /v1/ca/entreprise/{entreprise_id}:
 *   get:
 *     summary: Recupere le chiffre d'affaires d'une entreprise
 *     tags: [CA]
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
 *         description: CA de l'entreprise
 * /v1/ca/{id}:
 *   put:
 *     summary: Met a jour une entree de chiffre d'affaires
 *     tags: [CA]
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
 *             $ref: '#/components/schemas/CAInput'
 *     responses:
 *       200:
 *         description: Entree mise a jour
 *   delete:
 *     summary: Supprime une entree de chiffre d'affaires
 *     tags: [CA]
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
 *         description: Entree supprimee
 */
router.get("/", requireAuth, validateQuery(caQuerySchema), getCAHandler);
router.post("/", requireAuth, validateBody(createCASchema), createCAHandler);

// CA Stats & Analytics
router.get(
  "/stats",
  requireAuth,
  validateQuery(caStatsQuerySchema),
  getCAStatsHandler,
);
router.get(
  "/entreprise/:entreprise_id",
  requireAuth,
  validateQuery(caEntrepriseQuerySchema),
  getCAEntrepriseHandler,
);

router.put("/:id", requireAuth, validateBody(updateCASchema), updateCAHandler);
router.delete("/:id", requireAuth, deleteCAHandler);

export default router;
