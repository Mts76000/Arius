import { Response } from "express";
import { ZodError } from "zod";

export type ApiErrorCode =
  | "validation_error"
  | "unauthorized"
  | "forbidden"
  | "not_found"
  | "conflict"
  | "invalid_credentials"
  | "invalid_reset_token"
  | "too_many_requests"
  | "internal_error";

export function sendError(
  res: Response,
  status: number,
  code: ApiErrorCode,
  message: string,
  details?: unknown,
) {
  return res.status(status).json({
    success: false,
    error: code,
    message,
    details,
  });
}

export function sendValidationError(res: Response, error: ZodError) {
  return sendError(
    res,
    400,
    "validation_error",
    "Payload invalide",
    error.flatten(),
  );
}

export function sendInternalError(res: Response) {
  return sendError(res, 500, "internal_error", "Erreur serveur");
}
