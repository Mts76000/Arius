import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import {
  anonymiserCompte,
  getProfil,
  updateProfil,
  changerMotdepasse,
} from "../controllers/profilController.js";

const router = Router();

/**
 * @openapi
 * /v1/utilisateurs/profil:
 *   get:
 *     summary: Recupere le profil utilisateur
 *     tags: [Profil]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profil utilisateur
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *   patch:
 *     summary: Met a jour le profil utilisateur
 *     tags: [Profil]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profil mis a jour
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 * /v1/utilisateurs/changer-motdepasse:
 *   post:
 *     summary: Change le mot de passe utilisateur
 *     tags: [Profil]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Mot de passe change
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 * /v1/utilisateurs/anonymiser-compte:
 *   post:
 *     summary: Anonymise le compte utilisateur
 *     tags: [Profil]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Compte anonymise
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.get("/profil", requireAuth, getProfil);
router.patch("/profil", requireAuth, updateProfil);
router.post("/changer-motdepasse", requireAuth, changerMotdepasse);
router.post("/anonymiser-compte", requireAuth, anonymiserCompte);

export default router;
