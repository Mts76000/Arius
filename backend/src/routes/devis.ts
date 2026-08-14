import { Router } from "express";
import rateLimit from "express-rate-limit";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { requireAuth } from "../middleware/auth.js";
import * as devisController from "../controllers/devisController.js";
import { sendError } from "../http/apiResponse.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = Router();

const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) =>
    sendError(
      res,
      429,
      "too_many_requests",
      "Trop d'uploads, reessaie plus tard",
    ),
});

const uploadsDir = path.join(path.dirname(path.dirname(__dirname)), "uploads");

const storage = multer.diskStorage({
  destination: (req, _file, cb) => {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const devisDir = path.join(uploadsDir, "entreprises", id, "devis");

    // Create directory if it doesn't exist
    fs.mkdirSync(devisDir, { recursive: true });

    cb(null, devisDir);
  },
  filename: (_req, file, cb) => {
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    cb(null, `devis_${timestamp}${ext}`);
  },
});

const uploadPdf = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Seuls les fichiers PDF sont autorisés"));
    }
  },
});

/**
 * @openapi
 * /v1/entreprises/{id}/devis:
 *   get:
 *     summary: Liste les devis d'une entreprise
 *     tags: [Devis]
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
 *         description: Liste des devis
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *   post:
 *     summary: Upload un devis PDF pour une entreprise
 *     tags: [Devis]
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
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [file]
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Devis uploade
 *       400:
 *         description: Fichier invalide
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 * /v1/devis/{id}:
 *   get:
 *     summary: Recupere un devis
 *     tags: [Devis]
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
 *         description: Devis trouve
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *   delete:
 *     summary: Supprime un devis
 *     tags: [Devis]
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
 *         description: Devis supprime
 */
router.get(
  "/entreprises/:id/devis",
  requireAuth,
  devisController.listByEntreprise,
);
router.get("/devis/:id", requireAuth, devisController.get);
router.post(
  "/entreprises/:id/devis",
  requireAuth,
  uploadLimiter,
  uploadPdf.single("file"),
  (err: any, req: any, res: any, next: any) => {
    if (err instanceof multer.MulterError) {
      return sendError(
        res,
        400,
        "validation_error",
        `Erreur upload: ${err.message}`,
      );
    } else if (err) {
      return sendError(
        res,
        400,
        "validation_error",
        err.message || "Erreur upload",
      );
    }
    next();
  },
  devisController.upload,
);
router.delete("/devis/:id", requireAuth, devisController.remove);

export default router;
