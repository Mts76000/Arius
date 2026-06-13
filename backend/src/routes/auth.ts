import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import {
  forgotPassword,
  login,
  me,
  register,
  resetPassword,
} from "../controllers/authController.js";

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
 * /v1/auth/forgot-password:
 *   post:
 *     summary: Envoie un lien de réinitialisation de mot de passe
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Demande prise en compte
 */
router.post("/forgot-password", forgotPassword);

/**
 * @openapi
 * /v1/auth/reset-password:
 *   post:
 *     summary: Réinitialise le mot de passe avec un token temporaire
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [token, password]
 *             properties:
 *               token:
 *                 type: string
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Mot de passe modifié
 *       400:
 *         description: Token invalide ou expiré
 */
router.post("/reset-password", resetPassword);

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
