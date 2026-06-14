import { Router } from "express";
import rateLimit from "express-rate-limit";
import { requireAuth } from "../middleware/auth.js";
import {
  forgotPassword,
  login,
  me,
  register,
  resetPassword,
} from "../controllers/authController.js";
import { validateBody } from "../middleware/validate.js";
import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
} from "../validation/authSchemas.js";
import { sendError } from "../http/apiResponse.js";

const router = Router();

const passwordResetLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) =>
    sendError(
      res,
      429,
      "too_many_requests",
      "Trop de demandes de reinitialisation, reessaie plus tard",
    ),
});

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
router.post("/register", validateBody(registerSchema), register);

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
router.post("/login", validateBody(loginSchema), login);

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
router.post(
  "/forgot-password",
  passwordResetLimiter,
  validateBody(forgotPasswordSchema),
  forgotPassword,
);

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
router.post(
  "/reset-password",
  passwordResetLimiter,
  validateBody(resetPasswordSchema),
  resetPassword,
);

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
