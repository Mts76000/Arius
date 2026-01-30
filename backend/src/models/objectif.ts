import { pool } from "../db/mysql.js";
import { v4 as uuidv4 } from "uuid";
import { ResultSetHeader, RowDataPacket } from "mysql2";

export interface Objectif {
  id: string;
  user_id: string;
  annee: number;
  mois: number;
  objectif_ht: number;
  created_at: string;
  updated_at: string;
}

export interface CreateObjectifInput {
  annee: number;
  mois: number;
  objectif_ht: number;
}

export interface UpdateObjectifInput {
  objectif_ht?: number;
}

export async function getObjectifs(
  userId: string,
  annee?: number,
): Promise<Objectif[]> {
  let query = "SELECT * FROM objectifs_mensuels WHERE user_id = ?";
  const params: any[] = [userId];

  if (annee) {
    query += " AND annee = ?";
    params.push(annee);
  }

  query += " ORDER BY annee DESC, mois DESC";

  const [rows] = await pool.query<RowDataPacket[]>(query, params);
  // Convert objectif_ht from string to number (MySQL returns DECIMAL as string)
  return (rows as Objectif[]).map((row) => ({
    ...row,
    objectif_ht: parseFloat(String(row.objectif_ht)),
  }));
}

export async function getObjectifByMois(
  userId: string,
  annee: number,
  mois: number,
): Promise<Objectif | null> {
  const [rows] = await pool.query<RowDataPacket[]>(
    "SELECT * FROM objectifs_mensuels WHERE user_id = ? AND annee = ? AND mois = ?",
    [userId, annee, mois],
  );

  if (rows.length === 0) {
    return null;
  }

  const row = rows[0] as Objectif;
  return {
    ...row,
    objectif_ht: parseFloat(String(row.objectif_ht)),
  };
}

export async function createObjectif(
  userId: string,
  input: CreateObjectifInput,
): Promise<Objectif> {
  const id = uuidv4();

  // Check if objectif already exists for this month
  const existing = await getObjectifByMois(userId, input.annee, input.mois);
  if (existing) {
    // Update instead
    await pool.query(
      "UPDATE objectifs_mensuels SET objectif_ht = ?, updated_at = NOW() WHERE id = ?",
      [input.objectif_ht, existing.id],
    );
    return getObjectifByMois(
      userId,
      input.annee,
      input.mois,
    ) as Promise<Objectif>;
  }

  await pool.query(
    "INSERT INTO objectifs_mensuels (id, user_id, annee, mois, objectif_ht) VALUES (?, ?, ?, ?, ?)",
    [id, userId, input.annee, input.mois, input.objectif_ht],
  );

  return getObjectifByMois(
    userId,
    input.annee,
    input.mois,
  ) as Promise<Objectif>;
}

export async function updateObjectif(
  userId: string,
  objectifId: string,
  input: UpdateObjectifInput,
): Promise<Objectif | null> {
  const [result] = await pool.query<ResultSetHeader>(
    "UPDATE objectifs_mensuels SET objectif_ht = ?, updated_at = NOW() WHERE id = ? AND user_id = ?",
    [input.objectif_ht, objectifId, userId],
  );

  if (result.affectedRows === 0) {
    return null;
  }

  const [rows] = await pool.query<RowDataPacket[]>(
    "SELECT * FROM objectifs_mensuels WHERE id = ?",
    [objectifId],
  );

  return rows[0] as Objectif;
}

export async function deleteObjectif(
  userId: string,
  objectifId: string,
): Promise<boolean> {
  const [result] = await pool.query<ResultSetHeader>(
    "DELETE FROM objectifs_mensuels WHERE id = ? AND user_id = ?",
    [objectifId, userId],
  );

  return result.affectedRows > 0;
}
