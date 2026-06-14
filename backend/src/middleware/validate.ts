import { NextFunction, Request, Response } from "express";
import { z } from "zod";
import { sendValidationError } from "../http/apiResponse.js";

declare module "express-serve-static-core" {
  interface Request {
    validatedBody?: unknown;
    validatedQuery?: unknown;
  }
}

export function validateBody<T extends z.ZodTypeAny>(schema: T) {
  return (req: Request, res: Response, next: NextFunction) => {
    const parsed = schema.safeParse(req.body ?? {});
    if (!parsed.success) return sendValidationError(res, parsed.error);

    req.validatedBody = parsed.data;
    return next();
  };
}

export function validateQuery<T extends z.ZodTypeAny>(schema: T) {
  return (req: Request, res: Response, next: NextFunction) => {
    const parsed = schema.safeParse(req.query ?? {});
    if (!parsed.success) return sendValidationError(res, parsed.error);

    req.validatedQuery = parsed.data;
    return next();
  };
}

export function getValidatedBody<T>(req: Request): T {
  return req.validatedBody as T;
}

export function getValidatedQuery<T>(req: Request): T {
  return req.validatedQuery as T;
}
