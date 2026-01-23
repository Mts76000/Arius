import { pool } from "../db/mysql.js";
import { v4 as uuidv4 } from "uuid";

export interface Entreprise {
  id: string;
  user_id: string;
  nom: string;
  statut: "client" | "prospect" | "fournisseur" | "a_reactiver";
  rue: string | null;
  code_postal: string | null;
  ville: string | null;
  pays: string | null;
  description: string | null;
  logo: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateEntrepriseInput {
  nom: string;
  statut: "client" | "prospect" | "fournisseur" | "a_reactiver";
  rue?: string | null;
  code_postal?: string | null;
  ville?: string | null;
  pays?: string | null;
  description?: string | null;
  logo?: string | null;
}

export interface UpdateEntrepriseInput {
  nom?: string;
  statut?: "client" | "prospect" | "fournisseur" | "a_reactiver";
  rue?: string | null;
  code_postal?: string | null;
  ville?: string | null;
  pays?: string | null;
  description?: string | null;
  logo?: string | null;
}

export interface GetEntreprisesFilters {
  recherche?: string;
  statut?: "client" | "prospect" | "fournisseur" | "a_reactiver";
  page?: number;
  limite?: number;
}

export async function getEntreprises(
  userId: string,
  filters: GetEntreprisesFilters = {},
): Promise<{ entreprises: Entreprise[]; total: number }> {
  const { recherche, statut, page = 1, limite = 20 } = filters;
  const offset = (page - 1) * limite;

  let query = "SELECT * FROM entreprises WHERE user_id = ?";
  const params: any[] = [userId];

  if (recherche) {
    query += " AND nom LIKE ?";
    params.push(`%${recherche}%`);
  }

  if (statut) {
    query += " AND statut = ?";
    params.push(statut);
  }

  query += " ORDER BY nom ASC LIMIT ? OFFSET ?";
  params.push(limite, offset);

  const [rows] = await pool.execute(query, params);

  // Count total
  let countQuery =
    "SELECT COUNT(*) as total FROM entreprises WHERE user_id = ?";
  const countParams: any[] = [userId];
  if (recherche) {
    countQuery += " AND nom LIKE ?";
    countParams.push(`%${recherche}%`);
  }
  if (statut) {
    countQuery += " AND statut = ?";
    countParams.push(statut);
  }
  const [countRows] = await pool.execute(countQuery, countParams);
  const total = (countRows as any[])[0]?.total || 0;

  return { entreprises: rows as Entreprise[], total };
}

export async function getEntrepriseById(
  id: string,
  userId: string,
): Promise<Entreprise | null> {
  const [rows] = await pool.execute(
    "SELECT * FROM entreprises WHERE id = ? AND user_id = ? LIMIT 1",
    [id, userId],
  );
  const r = (rows as any[])[0];
  return r ?? null;
}

export async function createEntreprise(
  userId: string,
  input: CreateEntrepriseInput,
): Promise<Entreprise> {
  const id = uuidv4();
  const values = [
    id,
    userId,
    input.nom,
    input.statut,
    input.rue ?? null,
    input.code_postal ?? null,
    input.ville ?? null,
    input.pays ?? null,
    input.description ?? null,
    input.logo ?? null,
  ];

  await pool.execute(
    "INSERT INTO entreprises (id, user_id, nom, statut, rue, code_postal, ville, pays, description, logo) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
    values,
  );

  const created = await getEntrepriseById(id, userId);
  if (!created) throw new Error("Failed to create entreprise");
  return created;
}

export async function updateEntreprise(
  id: string,
  userId: string,
  input: UpdateEntrepriseInput,
): Promise<Entreprise | null> {
  const existing = await getEntrepriseById(id, userId);
  if (!existing) return null;

  const fields: string[] = [];
  const values: any[] = [];

  if (input.nom !== undefined) {
    fields.push("nom = ?");
    values.push(input.nom);
  }
  if (input.statut !== undefined) {
    fields.push("statut = ?");
    values.push(input.statut);
  }
  if (input.rue !== undefined) {
    fields.push("rue = ?");
    values.push(input.rue);
  }
  if (input.code_postal !== undefined) {
    fields.push("code_postal = ?");
    values.push(input.code_postal);
  }
  if (input.ville !== undefined) {
    fields.push("ville = ?");
    values.push(input.ville);
  }
  if (input.pays !== undefined) {
    fields.push("pays = ?");
    values.push(input.pays);
  }
  if (input.description !== undefined) {
    fields.push("description = ?");
    values.push(input.description);
  }
  if (input.logo !== undefined) {
    fields.push("logo = ?");
    values.push(input.logo);
  }

  if (fields.length === 0) return existing;

  values.push(id, userId);
  await pool.execute(
    `UPDATE entreprises SET ${fields.join(", ")} WHERE id = ? AND user_id = ?`,
    values,
  );

  return await getEntrepriseById(id, userId);
}

export async function deleteEntreprise(
  id: string,
  userId: string,
): Promise<boolean> {
  const existing = await getEntrepriseById(id, userId);
  if (!existing) return false;

  await pool.execute("DELETE FROM entreprises WHERE id = ? AND user_id = ?", [
    id,
    userId,
  ]);
  return true;
}
