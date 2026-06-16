import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import {
  createExportLink,
  downloadExport,
  downloadExportFromLink,
} from "../controllers/exportController.js";

const router = Router();

/**
 * @openapi
 * /v1/export/rgpd:
 *   get:
 *     summary: Telecharge l'export RGPD des donnees utilisateur
 *     tags: [Export]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Fichier d'export RGPD
 *         content:
 *           application/vnd.openxmlformats-officedocument.spreadsheetml.sheet:
 *             schema:
 *               type: string
 *               format: binary
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.get("/export/rgpd", requireAuth, downloadExport);

/**
 * @openapi
 * /v1/export/rgpd/link:
 *   get:
 *     summary: Cree un lien temporaire de telechargement RGPD
 *     tags: [Export]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [prospects, rdvs, notes, ca, objectifs]
 *     responses:
 *       200:
 *         description: Lien temporaire de telechargement
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required: [url, expiresInSeconds]
 *               properties:
 *                 url:
 *                   type: string
 *                   format: uri
 *                 expiresInSeconds:
 *                   type: number
 *                   example: 120
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.get("/export/rgpd/link", requireAuth, createExportLink);

/**
 * @openapi
 * /v1/export/rgpd/link/{token}:
 *   get:
 *     summary: Telecharge un export RGPD via un lien temporaire
 *     tags: [Export]
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Fichier d'export RGPD
 *         content:
 *           application/vnd.openxmlformats-officedocument.spreadsheetml.sheet:
 *             schema:
 *               type: string
 *               format: binary
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.get("/export/rgpd/link/:token", downloadExportFromLink);

export default router;
