import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { pool } from "../db/mysql.js";
import { env } from "../config/env.js";

export interface User {
  id: string;
  email: string;
  password: string | null;
  prenom: string | null;
  nom: string | null;
  created_at: string;
  updated_at: string;
}

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

export async function createUser(input: {
  email: string;
  password?: string | null;
  prenom?: string | null;
  nom?: string | null;
}): Promise<User> {
  const { v4: uuidv4 } = await import("uuid");
  const id = uuidv4();
  const values = [
    id,
    input.email,
    input.password ?? null,
    input.prenom ?? null,
    input.nom ?? null,
  ];
  await pool.execute(
    "INSERT INTO users (id, email, password, prenom, nom) VALUES (?, ?, ?, ?, ?)",
    values,
  );
  const user = await getUserByEmail(input.email);
  if (!user) throw new Error("Failed to create user");
  return user;
}

export async function anonymizeUser(userId: string): Promise<void> {
  const now = new Date().toISOString().slice(0, 19).replace("T", " ");
  await pool.execute(
    `UPDATE users
     SET email = ?, password = NULL, prenom = NULL, nom = NULL, updated_at = ?
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
