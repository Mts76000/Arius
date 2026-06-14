import express from "express";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import pinoHttp from "pino-http";
import swaggerUi from "swagger-ui-express";
import path from "path";
import fs from "fs";
import crypto from "node:crypto";
import multer from "multer";
import { fileURLToPath } from "url";
import { env } from "./config/env.js";
import { swaggerSpec } from "./config/swagger.js";
import authRoutes from "./routes/auth.js";
import entreprisesRoutes from "./routes/entreprises.js";
import contactsRoutes from "./routes/contacts.js";
import notesRoutes from "./routes/notes.js";
import rdvsRoutes from "./routes/rdvs.js";
import devisRoutes from "./routes/devis.js";
import objectifsRoutes from "./routes/objectifs.js";
import caRoutes from "./routes/ca.js";
import profilRoutes from "./routes/profil.js";
import exportRoutes from "./routes/export.js";
import { requireAuth } from "./middleware/auth.js";
import { runHealthChecks } from "./services/healthService.js";
import { sendError, sendInternalError } from "./http/apiResponse.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function createApp() {
  const app = express();

  if (env.nodeEnv !== "production") {
    app.get("/docs.json", (_req, res) => {
      res.status(200).json(swaggerSpec);
    });
    app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  }

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

  const allowedLogoMimes: Record<string, string> = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
  };

  function getSafeLogoDir(entrepriseId: string) {
    if (!/^[a-zA-Z0-9_-]{1,80}$/.test(entrepriseId)) {
      throw new Error("entrepriseId invalid");
    }

    const logoDir = path.resolve(
      uploadsDir,
      "entreprises",
      entrepriseId,
      "logos",
    );
    const allowedRoot = path.resolve(uploadsDir, "entreprises");

    if (!logoDir.startsWith(`${allowedRoot}${path.sep}`)) {
      throw new Error("invalid upload path");
    }

    return logoDir;
  }

  const storage = multer.diskStorage({
    destination: (req: any, _file, cb) => {
      const { entrepriseId } = req.body;
      if (!entrepriseId) {
        return cb(new Error("entrepriseId required"), "");
      }
      const id = Array.isArray(entrepriseId) ? entrepriseId[0] : entrepriseId;
      try {
        const logoDir = getSafeLogoDir(String(id));
        fs.mkdirSync(logoDir, { recursive: true });
        cb(null, logoDir);
      } catch (error) {
        cb(error as Error, "");
      }
    },
    filename: (_req, file, cb) => {
      const ext = allowedLogoMimes[file.mimetype];
      cb(null, `logo_${crypto.randomUUID()}${ext}`);
    },
  });

  const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
      const originalExt = path.extname(file.originalname).toLowerCase();
      const expectedExt = allowedLogoMimes[file.mimetype];
      const acceptedExts =
        file.mimetype === "image/jpeg" ? [".jpg", ".jpeg"] : [expectedExt];

      if (expectedExt && acceptedExts.includes(originalExt)) {
        cb(null, true);
      } else {
        cb(new Error("Format d'image non autorisé"));
      }
    },
  });

  /**
   * @openapi
   * /v1/upload:
   *   post:
   *     summary: Upload le logo d'une entreprise
   *     tags: [Upload]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         multipart/form-data:
   *           schema:
   *             type: object
   *             required: [entrepriseId, image]
   *             properties:
   *               entrepriseId:
   *                 type: string
   *               image:
   *                 type: string
   *                 format: binary
   *     responses:
   *       200:
   *         description: Logo uploade
   *       400:
   *         description: Payload invalide
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   */
  app.post(
    "/v1/upload",
    requireAuth,
    async (req: any, res: any) => {
      await new Promise<void>((resolve) => {
        upload.single("image")(req, res, (error: unknown) => {
          if (error) {
            const message =
              error instanceof multer.MulterError && error.code === "LIMIT_FILE_SIZE"
                ? "Logo trop lourd, taille max 5 MB"
                : error instanceof Error
                  ? error.message
                  : "Upload invalide";
            sendError(res, 400, "validation_error", message);
            resolve();
            return;
          }
          resolve();
        });
      });

      if (res.headersSent) return;

      if (!req.file) {
        return sendError(res, 400, "validation_error", "Aucun fichier uploade");
      }

      let { entrepriseId } = req.body;
      if (!entrepriseId) {
        return sendError(res, 400, "validation_error", "entrepriseId requis");
      }

      // Convertir en string si tableau
      if (Array.isArray(entrepriseId)) {
        entrepriseId = entrepriseId[0];
      }

      try {
        const logoDir = getSafeLogoDir(String(entrepriseId));
        const filename = req.file.filename;

        for (const entry of fs.readdirSync(logoDir)) {
          if (entry !== filename) {
            fs.rmSync(path.join(logoDir, entry), { force: true });
          }
        }

        const fileUrl = `/uploads/entreprises/${entrepriseId}/logos/${filename}`;
        res.json({ url: fileUrl });
      } catch (error) {
        console.error("Upload processing error:", error);
        sendInternalError(res);
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

  /**
   * @openapi
   * /:
   *   get:
   *     summary: Verifie l'etat complet de l'API
   *     tags: [Health]
   *     responses:
   *       200:
   *         description: API et dependances disponibles
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/HealthResponse'
   *       503:
   *         description: Une dependance est indisponible
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/HealthResponse'
   * /health:
   *   get:
   *     summary: Verifie l'etat complet de l'API
   *     tags: [Health]
   *     responses:
   *       200:
   *         description: API et dependances disponibles
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/HealthResponse'
   *       503:
   *         description: Une dependance est indisponible
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/HealthResponse'
  */
  app.get(["/", "/health"], async (_req, res) => {
    const payload = await runHealthChecks();

    res.status(payload.status === "ok" ? 200 : 503).json(payload);
  });
  app.use("/v1/auth", authRoutes);
  app.use("/v1/utilisateurs", profilRoutes);
  app.use("/v1/entreprises", entreprisesRoutes);
  app.use("/v1", contactsRoutes);
  app.use("/v1", notesRoutes);
  app.use("/v1", rdvsRoutes);
  app.use("/v1", devisRoutes);
  app.use("/v1/objectifs", objectifsRoutes);
  app.use("/v1/ca", caRoutes);
  app.use("/v1", exportRoutes);

  return app;
}
