import { Request, Response } from "express";
import {
  comparePassword,
  createUser,
  generateJwt,
  getUserByEmail,
  getUserById,
  hashPassword,
} from "../models/user.js";
import { loginSchema, registerSchema } from "../validation/authSchemas.js";

export async function register(req: Request, res: Response) {
  try {
    const parsed = registerSchema.safeParse(req.body ?? {});
    if (!parsed.success) {
      return res.status(400).json({
        error: "validation_error",
        details: parsed.error.flatten(),
      });
    }
    const { email, password, prenom, nom } = parsed.data;

    const existing = await getUserByEmail(email);
    if (existing)
      return res.status(409).json({ error: "email already in use" });

    const hashed = await hashPassword(password);
    const user = await createUser({
      email,
      password: hashed,
      prenom: prenom ?? null,
      nom: nom ?? null,
    });
    const token = generateJwt(user.id);
    return res.status(201).json({ token });
  } catch (e) {
    return res.status(500).json({ error: "internal_error" });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const parsed = loginSchema.safeParse(req.body ?? {});
    if (!parsed.success) {
      return res.status(400).json({
        error: "validation_error",
        details: parsed.error.flatten(),
      });
    }
    const { email, password } = parsed.data;

    const user = await getUserByEmail(email);
    if (!user || !user.password)
      return res.status(401).json({ error: "invalid credentials" });
    const ok = await comparePassword(password, user.password);
    if (!ok) return res.status(401).json({ error: "invalid credentials" });
    const token = generateJwt(user.id);
    return res.status(200).json({ token });
  } catch {
    return res.status(500).json({ error: "internal_error" });
  }
}

export async function me(req: Request, res: Response) {
  try {
    const userId = (req as any).userId as string | undefined;
    if (!userId) return res.status(401).json({ error: "unauthorized" });
    const user = await getUserById(userId);
    if (!user) return res.status(404).json({ error: "not_found" });
    return res.status(200).json({
      id: user.id,
      email: user.email,
      prenom: user.prenom,
      nom: user.nom,
    });
  } catch {
    return res.status(500).json({ error: "internal_error" });
  }
}
