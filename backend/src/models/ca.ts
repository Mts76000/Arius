import { pool } from "../db/mysql.js";
import { v4 as uuidv4 } from "uuid";
import { ResultSetHeader, RowDataPacket } from "mysql2";

export interface CAMensuel {
  id: string;
  user_id: string;
  entreprise_id: string;
  annee: number;
  mois: number;
  ca_ht: number;
  created_at: string;
  updated_at: string;
}

export interface CAMensuelAvecEntreprise extends CAMensuel {
  entreprise_nom: string;
  entreprise_logo?: string;
}

export interface CreateCAInput {
  entreprise_id: string;
  annee: number;
  mois: number;
  ca_ht: number;
}

export interface UpdateCAInput {
  ca_ht?: number;
}

export interface GetCAFilters {
  annee?: number;
  mois?: number;
  entreprise_id?: string;
}

export interface CAStats {
  ca_total: number;
  objectif: number | null;
  progression: number | null;
  ca_par_entreprise: {
    entreprise_id: string;
    entreprise_nom: string;
    entreprise_logo: string | null;
    ca_total: number;
  }[];
}

export async function getCA(
  userId: string,
  filters: GetCAFilters = {},
): Promise<CAMensuelAvecEntreprise[]> {
  let query = `
    SELECT cm.*, e.nom as entreprise_nom, e.logo as entreprise_logo
    FROM ca_mensuel cm
    LEFT JOIN entreprises e ON cm.entreprise_id = e.id
    WHERE cm.user_id = ?
  `;
  const params: any[] = [userId];

  if (filters.annee) {
    query += " AND cm.annee = ?";
    params.push(filters.annee);
  }

  if (filters.mois) {
    query += " AND cm.mois = ?";
    params.push(filters.mois);
  }

  if (filters.entreprise_id) {
    query += " AND cm.entreprise_id = ?";
    params.push(filters.entreprise_id);
  }

  query += " ORDER BY cm.annee DESC, cm.mois DESC";

  const [rows] = await pool.query<RowDataPacket[]>(query, params);
  // Convert ca_ht from string to number (MySQL returns DECIMAL as string)
  return (rows as CAMensuelAvecEntreprise[]).map((row) => ({
    ...row,
    ca_ht: parseFloat(String(row.ca_ht)),
  }));
}

export async function getCAByMois(
  userId: string,
  entrepriseId: string,
  annee: number,
  mois: number,
): Promise<CAMensuel | null> {
  const [rows] = await pool.query<RowDataPacket[]>(
    "SELECT * FROM ca_mensuel WHERE user_id = ? AND entreprise_id = ? AND annee = ? AND mois = ?",
    [userId, entrepriseId, annee, mois],
  );

  if (rows.length === 0) {
    return null;
  }

  return rows[0] as CAMensuel;
}

export async function createCA(
  userId: string,
  input: CreateCAInput,
): Promise<CAMensuel> {
  const id = uuidv4();

  // Check if CA already exists for this month
  const existing = await getCAByMois(
    userId,
    input.entreprise_id,
    input.annee,
    input.mois,
  );

  if (existing) {
    // Update instead
    await pool.query(
      "UPDATE ca_mensuel SET ca_ht = ?, updated_at = NOW() WHERE id = ?",
      [input.ca_ht, existing.id],
    );
    return getCAByMois(
      userId,
      input.entreprise_id,
      input.annee,
      input.mois,
    ) as Promise<CAMensuel>;
  }

  await pool.query(
    "INSERT INTO ca_mensuel (id, user_id, entreprise_id, annee, mois, ca_ht) VALUES (?, ?, ?, ?, ?, ?)",
    [id, userId, input.entreprise_id, input.annee, input.mois, input.ca_ht],
  );

  return getCAByMois(
    userId,
    input.entreprise_id,
    input.annee,
    input.mois,
  ) as Promise<CAMensuel>;
}

export async function updateCA(
  userId: string,
  caId: string,
  input: UpdateCAInput,
): Promise<CAMensuel | null> {
  const [result] = await pool.query<ResultSetHeader>(
    "UPDATE ca_mensuel SET ca_ht = ?, updated_at = NOW() WHERE id = ? AND user_id = ?",
    [input.ca_ht, caId, userId],
  );

  if (result.affectedRows === 0) {
    return null;
  }

  const [rows] = await pool.query<RowDataPacket[]>(
    "SELECT * FROM ca_mensuel WHERE id = ?",
    [caId],
  );

  return rows[0] as CAMensuel;
}

export async function deleteCA(userId: string, caId: string): Promise<boolean> {
  const [result] = await pool.query<ResultSetHeader>(
    "DELETE FROM ca_mensuel WHERE id = ? AND user_id = ?",
    [caId, userId],
  );

  return result.affectedRows > 0;
}

export async function getCAStats(
  userId: string,
  annee: number,
  mois: number,
): Promise<CAStats> {
  // Get CA total for the month
  const [caRows] = await pool.query<RowDataPacket[]>(
    "SELECT SUM(ca_ht) as ca_total FROM ca_mensuel WHERE user_id = ? AND annee = ? AND mois = ?",
    [userId, annee, mois],
  );

  const caTotal = parseFloat(String(caRows[0]?.ca_total || 0));

  // Get objectif for the month
  const [objectifRows] = await pool.query<RowDataPacket[]>(
    "SELECT objectif_ht FROM objectifs_mensuels WHERE user_id = ? AND annee = ? AND mois = ?",
    [userId, annee, mois],
  );

  const objectif = objectifRows[0]?.objectif_ht
    ? parseFloat(String(objectifRows[0].objectif_ht))
    : null;
  const progression = objectif ? (caTotal / objectif) * 100 : null;

  // Get CA par entreprise
  const [entrepriseRows] = await pool.query<RowDataPacket[]>(
    `
    SELECT 
      e.id as entreprise_id,
      e.nom as entreprise_nom,
      e.logo as entreprise_logo,
      SUM(cm.ca_ht) as ca_total
    FROM ca_mensuel cm
    LEFT JOIN entreprises e ON cm.entreprise_id = e.id
    WHERE cm.user_id = ? AND cm.annee = ? AND cm.mois = ?
    GROUP BY e.id, e.nom, e.logo
    ORDER BY ca_total DESC
    `,
    [userId, annee, mois],
  );

  return {
    ca_total: caTotal,
    objectif,
    progression,
    ca_par_entreprise: (entrepriseRows as Array<{ entreprise_id: string; entreprise_nom: string; entreprise_logo: string | null; ca_total: number }>).map((row) => ({
      entreprise_id: row.entreprise_id,
      entreprise_nom: row.entreprise_nom,
      entreprise_logo: row.entreprise_logo,
      ca_total: parseFloat(String(row.ca_total || 0)),
    })),
  };
}

export async function getCAEntreprise(
  userId: string,
  entrepriseId: string,
  annee: number,
): Promise<{
  ca_total: number;
  moyenne_mensuelle: number;
  ca_mensuel: CAMensuel[];
}> {
  // Get CA mensuel for the year
  const caMensuel = await getCA(userId, { entreprise_id: entrepriseId, annee });

  // Calculate total and average - ensure ca_ht is converted to number
  const caTotal = caMensuel.reduce(
    (sum, ca) => sum + parseFloat(String(ca.ca_ht)),
    0,
  );
  const moyenneMensuelle =
    caMensuel.length > 0 ? caTotal / caMensuel.length : 0;

  return {
    ca_total: caTotal,
    moyenne_mensuelle: moyenneMensuelle,
    ca_mensuel: caMensuel,
  };
}
