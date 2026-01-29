import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { requireAuth } from "../middleware/auth.js";
import * as devisController from "../controllers/devisController.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = Router();

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

router.get(
  "/entreprises/:id/devis",
  requireAuth,
  devisController.listByEntreprise,
);
router.get("/devis/:id", requireAuth, devisController.get);
router.post(
  "/entreprises/:id/devis",
  requireAuth,
  uploadPdf.single("file"),
  (err: any, req: any, res: any, next: any) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ error: `Erreur upload: ${err.message}` });
    } else if (err) {
      return res.status(400).json({ error: err.message || "Erreur upload" });
    }
    next();
  },
  devisController.upload,
);
router.delete("/devis/:id", requireAuth, devisController.remove);

export default router;
