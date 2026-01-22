import express from "express";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import pinoHttp from "pino-http";
import { pool } from "./db/mysql.js";
import authRoutes from "./routes/auth.js";

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(cors());
  app.use(express.json({ limit: "1mb" }));
  app.use(pinoHttp({ level: "info" }));
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

  return app;
}
