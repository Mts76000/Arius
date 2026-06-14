import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import {
  getObjectifsHandler,
  createObjectifHandler,
  updateObjectifHandler,
  deleteObjectifHandler,
} from "../controllers/objectifController.js";
import { validateBody, validateQuery } from "../middleware/validate.js";
import {
  createObjectifSchema,
  objectifQuerySchema,
  updateObjectifSchema,
} from "../validation/objectifSchemas.js";

const router = Router();

/**
 * @openapi
 * /v1/objectifs:
 *   get:
 *     summary: Liste les objectifs
 *     tags: [Objectifs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des objectifs
 *   post:
 *     summary: Cree un objectif
 *     tags: [Objectifs]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ObjectifInput'
 *     responses:
 *       201:
 *         description: Objectif cree
 * /v1/objectifs/{id}:
 *   put:
 *     summary: Met a jour un objectif
 *     tags: [Objectifs]
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
 *             $ref: '#/components/schemas/ObjectifInput'
 *     responses:
 *       200:
 *         description: Objectif mis a jour
 *   delete:
 *     summary: Supprime un objectif
 *     tags: [Objectifs]
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
 *         description: Objectif supprime
 */
router.get(
  "/",
  requireAuth,
  validateQuery(objectifQuerySchema),
  getObjectifsHandler,
);
router.post(
  "/",
  requireAuth,
  validateBody(createObjectifSchema),
  createObjectifHandler,
);
router.put(
  "/:id",
  requireAuth,
  validateBody(updateObjectifSchema),
  updateObjectifHandler,
);
router.delete("/:id", requireAuth, deleteObjectifHandler);

export default router;
