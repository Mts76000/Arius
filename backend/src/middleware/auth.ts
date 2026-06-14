import type { Request, Response, NextFunction } from "express";
import { getUserById, isAnonymizedUser, verifyJwt } from "../models/user.js";
import { sendError } from "../http/apiResponse.js";

interface AuthenticatedRequest extends Request {
  userId?: string;
}

export async function requireAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) {
  const header = req.headers["authorization"];
  if (!header || Array.isArray(header)) {
    return sendError(res, 401, "unauthorized", "Token manquant");
  }
  const [scheme, token] = header.split(" ");
  if (scheme !== "Bearer" || !token) {
    return sendError(res, 401, "unauthorized", "Format Authorization invalide");
  }
  try {
    const payload = verifyJwt(token);
    const user = await getUserById(payload.sub);
    if (!user || isAnonymizedUser(user)) {
      return sendError(res, 401, "unauthorized", "Token invalide ou expire");
    }
    req.userId = payload.sub;
    next();
  } catch {
    return sendError(res, 401, "unauthorized", "Token invalide ou expire");
  }
}
