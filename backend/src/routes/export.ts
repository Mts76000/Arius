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
router.get("/export/rgpd/link", requireAuth, createExportLink);
router.get("/export/rgpd/link/:token", downloadExportFromLink);

export default router;
