import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { streamRgpdExport } from "../services/exportService.js";
import { sendError, sendInternalError } from "../http/apiResponse.js";
import { env } from "../config/env.js";

function normalizeExportType(value: unknown) {
  return typeof value === "string"
    ? value
    : Array.isArray(value) && typeof value[0] === "string"
      ? value[0]
      : undefined;
}

export async function downloadExport(req: Request, res: Response) {
  const userId = (req as any).userId;

  if (!userId) {
    return sendError(res, 401, "unauthorized", "Non authentifie");
  }

  const type = normalizeExportType(req.query.type);

  try {
    await streamRgpdExport(userId, res, type);
  } catch (error) {
    console.error("Erreur export RGPD:", error);
    if (!res.headersSent) {
      sendInternalError(res);
    }
  }
}

export async function createExportLink(req: Request, res: Response) {
  const userId = (req as any).userId;

  if (!userId) {
    return sendError(res, 401, "unauthorized", "Non authentifie");
  }

  const type = normalizeExportType(req.query.type);
  const token = jwt.sign({ sub: userId, type, scope: "export" }, env.jwtSecret, {
    expiresIn: "2m",
  });
  const url = `${req.protocol}://${req.get("host")}/v1/export/rgpd/link/${encodeURIComponent(token)}`;

  return res.json({ url });
}

export async function downloadExportFromLink(req: Request, res: Response) {
  try {
    const token = req.params.token;
    if (!token) {
      return sendError(res, 400, "validation_error", "Lien invalide");
    }

    const payload = jwt.verify(token, env.jwtSecret) as {
      sub?: string;
      type?: string;
      scope?: string;
    };

    if (!payload.sub || payload.scope !== "export") {
      return sendError(res, 401, "unauthorized", "Lien invalide ou expire");
    }

    await streamRgpdExport(payload.sub, res, payload.type);
  } catch (error) {
    console.error("Erreur export RGPD link:", error);
    if (!res.headersSent) {
      sendError(res, 401, "unauthorized", "Lien invalide ou expire");
    }
  }
}
