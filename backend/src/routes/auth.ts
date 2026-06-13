import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { login, me, register } from "../controllers/authController.js";

const router = Router();

/**
 * @openapi
 * /v1/auth/register:
 *   post:
 *     summary: Cree un compte utilisateur
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             allOf:
 *               - $ref: '#/components/schemas/AuthCredentials'
 *               - type: object
 *                 properties:
 *                   nom:
 *                     type: string
 *                     example: Marie Dupont
 *     responses:
 *       201:
 *         description: Compte cree
 *       400:
 *         description: Payload invalide
 */
router.post("/register", register);

/**
 * @openapi
 * /v1/auth/login:
 *   post:
 *     summary: Connecte un utilisateur
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AuthCredentials'
 *     responses:
 *       200:
 *         description: Connexion reussie
 *       401:
 *         description: Identifiants invalides
 */
router.post("/login", login);

/**
 * @openapi
 * /v1/auth/me:
 *   get:
 *     summary: Retourne l'utilisateur courant
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Utilisateur courant
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.get("/me", requireAuth, me);

export default router;
