import { Request, Response } from "express";
import {
  comparePassword,
  createUser,
  generateJwt,
  generatePasswordResetToken,
  getUserByEmail,
  getUserById,
  hashPassword,
  updateUserPassword,
  verifyPasswordResetToken,
} from "../models/user.js";
import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
} from "../validation/authSchemas.js";
import { sendPasswordResetEmail } from "../services/emailService.js";
import { env } from "../config/env.js";
import {
  sendError,
  sendInternalError,
  sendValidationError,
} from "../http/apiResponse.js";

export async function register(req: Request, res: Response) {
  try {
    const parsed = registerSchema.safeParse(
      req.validatedBody ?? req.body ?? {},
    );
    if (!parsed.success) {
      return sendValidationError(res, parsed.error);
    }
    const { email, password, prenom, nom } = parsed.data;

    const existing = await getUserByEmail(email);
    if (existing)
      return sendError(res, 409, "conflict", "Email deja utilise");

    const hashed = await hashPassword(password);
    const user = await createUser({
      email,
      password: hashed,
      prenom: prenom ?? null,
      nom: nom ?? null,
    });
    const token = generateJwt(user.id);
    return res.status(201).json({ token });
  } catch {
    return sendInternalError(res);
  }
}

export async function login(req: Request, res: Response) {
  try {
    const parsed = loginSchema.safeParse(req.validatedBody ?? req.body ?? {});
    if (!parsed.success) {
      return sendValidationError(res, parsed.error);
    }
    const { email, password } = parsed.data;

    const user = await getUserByEmail(email);
    if (!user || !user.password)
      return sendError(
        res,
        401,
        "invalid_credentials",
        "Identifiants invalides",
      );
    const ok = await comparePassword(password, user.password);
    if (!ok) {
      return sendError(
        res,
        401,
        "invalid_credentials",
        "Identifiants invalides",
      );
    }
    const token = generateJwt(user.id);
    return res.status(200).json({ token });
  } catch {
    return sendInternalError(res);
  }
}

export async function forgotPassword(req: Request, res: Response) {
  try {
    const parsed = forgotPasswordSchema.safeParse(
      req.validatedBody ?? req.body ?? {},
    );
    if (!parsed.success) {
      return sendValidationError(res, parsed.error);
    }

    const { email } = parsed.data;
    const user = await getUserByEmail(email);

    if (user?.password) {
      const token = await generatePasswordResetToken(user.id);
      const resetUrl = `${env.frontendUrl}/reset-password?token=${encodeURIComponent(token)}`;
      await sendPasswordResetEmail(email, resetUrl);
    }

    return res.status(200).json({
      message:
        "Si un compte existe avec cet email, un lien de réinitialisation a été envoyé.",
    });
  } catch {
    return sendInternalError(res);
  }
}

export async function resetPassword(req: Request, res: Response) {
  try {
    const parsed = resetPasswordSchema.safeParse(
      req.validatedBody ?? req.body ?? {},
    );
    if (!parsed.success) {
      return sendValidationError(res, parsed.error);
    }

    const { token, password } = parsed.data;
    const { sub: userId } = await verifyPasswordResetToken(token);
    const user = await getUserById(userId);

    if (!user) {
      return sendError(
        res,
        400,
        "invalid_reset_token",
        "Lien invalide ou expire",
      );
    }

    const hashed = await hashPassword(password);
    await updateUserPassword(userId, hashed);

    return res.status(200).json({ message: "password_reset_success" });
  } catch {
    return sendError(
      res,
      400,
      "invalid_reset_token",
      "Lien invalide ou expire",
    );
  }
}

export async function me(req: Request, res: Response) {
  try {
    const userId = (req as any).userId as string | undefined;
    if (!userId) return sendError(res, 401, "unauthorized", "Non authentifie");
    const user = await getUserById(userId);
    if (!user) return sendError(res, 404, "not_found", "Utilisateur introuvable");
    return res.status(200).json({
      id: user.id,
      email: user.email,
      prenom: user.prenom,
      nom: user.nom,
    });
  } catch {
    return sendInternalError(res);
  }
}
