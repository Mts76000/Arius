import { Request, Response } from "express";
import {
  comparePassword,
  createUser,
  generateJwt,
  getUserByEmail,
  getUserByGoogleSub,
  getUserById,
  hashPassword,
  updateGoogleSubForEmail,
  verifyGoogleIdToken,
} from "../models/user.js";

export async function register(req: Request, res: Response) {
  try {
    const { email, password, prenom, nom } = req.body ?? {};
    if (!email || typeof email !== "string")
      return res.status(400).json({ error: "email required" });
    if (!password || typeof password !== "string")
      return res.status(400).json({ error: "password required" });

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
    const { email, password } = req.body ?? {};
    if (!email || typeof email !== "string")
      return res.status(400).json({ error: "email required" });
    if (!password || typeof password !== "string")
      return res.status(400).json({ error: "password required" });

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

export async function google(req: Request, res: Response) {
  try {
    const { idToken } = req.body ?? {};
    if (!idToken || typeof idToken !== "string")
      return res.status(400).json({ error: "idToken required" });
    const payload = await verifyGoogleIdToken(idToken);
    const { sub, email, given_name, family_name } = payload;

    let user = await getUserByGoogleSub(sub);
    if (!user && email) {
      const byEmail = await getUserByEmail(email);
      if (byEmail) {
        await updateGoogleSubForEmail(email, sub);
        user = await getUserByEmail(email);
      }
    }
    if (!user) {
      user = await createUser({
        email: email ?? `${sub}@google.local`,
        google_sub: sub,
        prenom: given_name ?? null,
        nom: family_name ?? null,
      });
    }
    const token = generateJwt(user.id);
    return res.status(200).json({ token });
  } catch (e) {
    return res.status(401).json({ error: "invalid_google_token" });
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
