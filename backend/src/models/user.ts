import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import { pool } from "../db/mysql.js";
import { env } from "../config/env.js";

export interface User {
  id: string;
  email: string;
  password: string | null;
  google_sub: string | null;
  prenom: string | null;
  nom: string | null;
  created_at: string;
  updated_at: string;
}

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export function isAnonymizedUser(user: Pick<User, "id" | "email">): boolean {
  return user.email === getAnonymizedEmail(user.id);
}

export function getAnonymizedEmail(userId: string): string {
  return `anonymized-${userId}@deleted.local`;
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const [rows] = await pool.execute(
    "SELECT * FROM users WHERE email = ? LIMIT 1",
    [email],
  );
  const r = (rows as any[])[0];
  return r ?? null;
}

export async function getUserById(id: string): Promise<User | null> {
  const [rows] = await pool.execute(
    "SELECT * FROM users WHERE id = ? LIMIT 1",
    [id],
  );
  const r = (rows as any[])[0];
  return r ?? null;
}

export async function getUserByGoogleSub(sub: string): Promise<User | null> {
  const [rows] = await pool.execute(
    "SELECT * FROM users WHERE google_sub = ? LIMIT 1",
    [sub],
  );
  const r = (rows as any[])[0];
  return r ?? null;
}

export async function createUser(input: {
  email: string;
  password?: string | null;
  google_sub?: string | null;
  prenom?: string | null;
  nom?: string | null;
}): Promise<User> {
  const { v4: uuidv4 } = await import("uuid");
  const id = uuidv4();
  const values = [
    id,
    input.email,
    input.password ?? null,
    input.google_sub ?? null,
    input.prenom ?? null,
    input.nom ?? null,
  ];
  await pool.execute(
    "INSERT INTO users (id, email, password, google_sub, prenom, nom) VALUES (?, ?, ?, ?, ?, ?)",
    values,
  );
  const user = await getUserByEmail(input.email);
  if (!user) throw new Error("Failed to create user");
  return user;
}

export async function updateGoogleSubForEmail(
  email: string,
  sub: string,
): Promise<void> {
  await pool.execute("UPDATE users SET google_sub = ? WHERE email = ?", [
    sub,
    email,
  ]);
}

export async function anonymizeUser(userId: string): Promise<void> {
  const now = new Date().toISOString().slice(0, 19).replace("T", " ");
  await pool.execute(
    `UPDATE users
     SET email = ?, password = NULL, google_sub = NULL, prenom = NULL, nom = NULL, updated_at = ?
     WHERE id = ?`,
    [getAnonymizedEmail(userId), now, userId],
  );
}

export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
}

export async function comparePassword(
  password: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateJwt(userId: string): string {
  return jwt.sign({ sub: userId }, env.jwtSecret, {
    algorithm: "HS256",
    expiresIn: "7d",
  });
}

export function verifyJwt(token: string): { sub: string } {
  return jwt.verify(token, env.jwtSecret) as { sub: string };
}

export async function verifyGoogleIdToken(idToken: string): Promise<{
  sub: string;
  email?: string;
  given_name?: string;
  family_name?: string;
}> {
  const clientIds = (process.env.GOOGLE_CLIENT_ID ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const audience: string | string[] | undefined =
    clientIds.length === 0
      ? undefined
      : clientIds.length === 1
        ? clientIds[0]
        : clientIds;
  const ticket = await googleClient.verifyIdToken({ idToken, audience });
  const payload = ticket.getPayload();
  if (!payload || !payload.sub) throw new Error("Invalid Google token");
  return {
    sub: payload.sub,
    email: payload.email ?? undefined,
    given_name: (payload as any).given_name,
    family_name: (payload as any).family_name,
  };
}
