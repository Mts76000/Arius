import express from "express";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import pinoHttp from "pino-http";
import path from "path";
import fs from "fs";
import multer from "multer";
import { fileURLToPath } from "url";
import { pool } from "./db/mysql.js";
import authRoutes from "./routes/auth.js";
import entreprisesRoutes from "./routes/entreprises.js";
import contactsRoutes from "./routes/contacts.js";
import notesRoutes from "./routes/notes.js";
import rdvsRoutes from "./routes/rdvs.js";
import { requireAuth } from "./middleware/auth.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function createApp() {
  const app = express();

  // Autoriser le chargement des images depuis un autre port (expo web)
  app.use(helmet({ crossOriginResourcePolicy: false }));
  app.use(cors());
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ limit: "10mb", extended: true }));

  // Logs HTTP simplifiés
  app.use(
    pinoHttp({
      level: "info",
      transport: {
        target: "pino-pretty",
        options: {
          colorize: true,
          translateTime: "HH:MM:ss",
          ignore: "pid,hostname",
          messageFormat:
            "{req.method} {req.url} → {res.statusCode} ({responseTime}ms)",
        },
      },
      customLogLevel: (_req, res, err) => {
        if (res.statusCode >= 400 && res.statusCode < 500) return "warn";
        if (res.statusCode >= 500 || err) return "error";
        return "silent"; // Ne log que les erreurs
      },
    }),
  );

  // Servir les fichiers uploadés
  const uploadsDir = path.join(path.dirname(__dirname), "uploads");
  app.use("/uploads", express.static(uploadsDir));

  // Configuration multer
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
      cb(null, uploadsDir);
    },
    filename: (_req, file, cb) => {
      const timestamp = Date.now();
      const ext = path.extname(file.originalname);
      cb(null, `${timestamp}${ext}`);
    },
  });

  const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
      const allowedMimes = ["image/jpeg", "image/png", "image/webp"];
      if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error("Format d'image non autorisé"));
      }
    },
  });

  // Route d'upload
  app.post(
    "/v1/upload",
    requireAuth,
    upload.single("image"),
    async (req: any, res: any) => {
      if (!req.file) {
        return res.status(400).json({ error: "Aucun fichier uploadé" });
      }

      try {
        // TEMPORAIRE: Désactiver la conversion pour test
        let finalFilename: string;
        const originalPath = req.file.path;

        // Juste assurer qu'il y a une extension
        let filename = req.file.filename;
        const ext = path.extname(filename);

        if (!ext) {
          // Si pas d'extension, l'ajouter selon le mimetype
          let extFromMime = ".jpg";
          if (req.file.mimetype === "image/png") {
            extFromMime = ".png";
          } else if (req.file.mimetype === "image/webp") {
            extFromMime = ".webp";
          } else if (
            req.file.mimetype === "image/heic" ||
            req.file.mimetype === "image/heif"
          ) {
            extFromMime = ".heic";
          }
          filename = filename + extFromMime;

          // Renommer le fichier
          const newPath = path.join(uploadsDir, filename);
          fs.renameSync(originalPath, newPath);
        }
        finalFilename = filename;

        const fileUrl = `/uploads/${finalFilename}`;
        res.json({ url: fileUrl });
      } catch (error) {
        console.error("Upload processing error:", error);
        res.status(500).json({ error: "Erreur lors du traitement de l'image" });
      }
    },
  );

  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000,
      limit: 300,
      standardHeaders: true,
      legacyHeaders: false,
    }),
  );

  app.get("/health", async (_req, res) => {
    try {
      await pool.query("SELECT 1");
      res.status(200).json({ status: "ok", mysql: "connected" });
    } catch (err) {
      res.status(503).json({ status: "error", mysql: "disconnected" });
    }
  });
  app.use("/v1/auth", authRoutes);
  app.use("/v1/entreprises", entreprisesRoutes);
  app.use("/v1", contactsRoutes);
  app.use("/v1", notesRoutes);
  app.use("/v1", rdvsRoutes);

  return app;
}
