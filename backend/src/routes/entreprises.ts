import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import {
  list,
  get,
  create,
  update,
  remove,
} from "../controllers/entrepriseController.js";
import { validateBody, validateQuery } from "../middleware/validate.js";
import {
  createEntrepriseSchema,
  listEntreprisesQuerySchema,
  updateEntrepriseSchema,
} from "../validation/entrepriseSchemas.js";

const router = Router();

/**
 * @openapi
 * /v1/entreprises:
 *   get:
 *     summary: Liste les entreprises de l'utilisateur
 *     tags: [Entreprises]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des entreprises
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *   post:
 *     summary: Cree une entreprise
 *     tags: [Entreprises]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EntrepriseInput'
 *     responses:
 *       201:
 *         description: Entreprise creee
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 * /v1/entreprises/{id}:
 *   get:
 *     summary: Recupere une entreprise
 *     tags: [Entreprises]
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
 *         description: Entreprise trouvee
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *   put:
 *     summary: Met a jour une entreprise
 *     tags: [Entreprises]
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
 *             $ref: '#/components/schemas/EntrepriseInput'
 *     responses:
 *       200:
 *         description: Entreprise mise a jour
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *   delete:
 *     summary: Supprime une entreprise
 *     tags: [Entreprises]
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
 *         description: Entreprise supprimee
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.get("/", requireAuth, validateQuery(listEntreprisesQuerySchema), list);
router.get("/:id", requireAuth, get);
router.post("/", requireAuth, validateBody(createEntrepriseSchema), create);
router.put("/:id", requireAuth, validateBody(updateEntrepriseSchema), update);
router.delete("/:id", requireAuth, remove);

export default router;
