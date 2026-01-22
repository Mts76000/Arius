import type { Request, Response, NextFunction } from "express";
import { verifyJwt } from "../models/user.js";

interface AuthenticatedRequest extends Request {
  userId?: string;
}

export function requireAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) {
  const header = req.headers["authorization"];
  if (!header || Array.isArray(header)) {
    return res.status(401).json({ error: "Missing Authorization header" });
  }
  const [scheme, token] = header.split(" ");
  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({ error: "Invalid Authorization format" });
  }
  try {
    const payload = verifyJwt(token);
    req.userId = payload.sub;
    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}
