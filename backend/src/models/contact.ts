import { pool } from "../db/mysql.js";
import { v4 as uuidv4 } from "uuid";

export interface Contact {
  id: string;
  user_id: string;
  entreprise_id: string;
  prenom: string | null;
  nom: string;
  poste: string | null;
  email: string | null;
  tel_direct: string | null;
  tel_mobile: string | null;
  contact_principal: boolean;
  commentaire: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateContactInput {
  entreprise_id: string;
  prenom?: string | null;
  nom: string;
  poste?: string | null;
  email?: string | null;
  tel_direct?: string | null;
  tel_mobile?: string | null;
  contact_principal?: boolean;
  commentaire?: string | null;
}

export interface UpdateContactInput {
  prenom?: string | null;
  nom?: string;
  poste?: string | null;
  email?: string | null;
  tel_direct?: string | null;
  tel_mobile?: string | null;
  contact_principal?: boolean;
  commentaire?: string | null;
}

export async function getContactsByEntreprise(
  entrepriseId: string,
  userId: string,
): Promise<Contact[]> {
  const [rows] = await pool.execute(
    `SELECT c.* FROM contacts c
     INNER JOIN entreprises e ON c.entreprise_id = e.id
     WHERE c.entreprise_id = ? AND c.user_id = ?
     ORDER BY c.contact_principal DESC, c.nom ASC`,
    [entrepriseId, userId],
  );
  // Convertir contact_principal de 0/1 en boolean
  return (rows as any[]).map((row) => ({
    ...row,
    contact_principal: Boolean(row.contact_principal),
  })) as Contact[];
}

export async function getContactById(
  id: string,
  userId: string,
): Promise<Contact | null> {
  const [rows] = await pool.execute(
    `SELECT c.* FROM contacts c
     WHERE c.id = ? AND c.user_id = ?
     LIMIT 1`,
    [id, userId],
  );
  const r = (rows as any[])[0];
  if (!r) return null;
  // Convertir contact_principal de 0/1 en boolean
  return {
    ...r,
    contact_principal: Boolean(r.contact_principal),
  } as Contact;
}

export async function createContact(
  userId: string,
  data: CreateContactInput,
): Promise<Contact> {
  const id = uuidv4();

  // Si on marque ce contact comme principal, on retire le statut des autres
  if (data.contact_principal) {
    await pool.execute(
      `UPDATE contacts SET contact_principal = FALSE 
       WHERE entreprise_id = ? AND user_id = ?`,
      [data.entreprise_id, userId],
    );
  }

  const [result] = await pool.execute(
    `INSERT INTO contacts (
      id, user_id, entreprise_id, prenom, nom, poste,
      email, tel_direct, tel_mobile, contact_principal, commentaire
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      userId,
      data.entreprise_id,
      data.prenom ?? null,
      data.nom,
      data.poste ?? null,
      data.email ?? null,
      data.tel_direct ?? null,
      data.tel_mobile ?? null,
      data.contact_principal ?? false,
      data.commentaire ?? null,
    ],
  );

  const contact = await getContactById(id, userId);
  if (!contact) {
    throw new Error("Failed to create contact");
  }
  return contact;
}

export async function updateContact(
  id: string,
  userId: string,
  data: UpdateContactInput,
): Promise<Contact | null> {
  const contact = await getContactById(id, userId);
  if (!contact) {
    return null;
  }

  // Si on marque ce contact comme principal, on retire le statut des autres
  if (data.contact_principal) {
    await pool.execute(
      `UPDATE contacts SET contact_principal = FALSE 
       WHERE entreprise_id = ? AND user_id = ? AND id != ?`,
      [contact.entreprise_id, userId, id],
    );
  }

  const updates: string[] = [];
  const params: any[] = [];

  if (data.prenom !== undefined) {
    updates.push("prenom = ?");
    params.push(data.prenom);
  }
  if (data.nom !== undefined) {
    updates.push("nom = ?");
    params.push(data.nom);
  }
  if (data.poste !== undefined) {
    updates.push("poste = ?");
    params.push(data.poste);
  }
  if (data.email !== undefined) {
    updates.push("email = ?");
    params.push(data.email);
  }
  if (data.tel_direct !== undefined) {
    updates.push("tel_direct = ?");
    params.push(data.tel_direct);
  }
  if (data.tel_mobile !== undefined) {
    updates.push("tel_mobile = ?");
    params.push(data.tel_mobile);
  }
  if (data.contact_principal !== undefined) {
    updates.push("contact_principal = ?");
    params.push(data.contact_principal);
  }
  if (data.commentaire !== undefined) {
    updates.push("commentaire = ?");
    params.push(data.commentaire);
  }

  if (updates.length === 0) {
    return contact;
  }

  params.push(id, userId);

  await pool.execute(
    `UPDATE contacts SET ${updates.join(", ")} WHERE id = ? AND user_id = ?`,
    params,
  );

  return getContactById(id, userId);
}

export async function deleteContact(
  id: string,
  userId: string,
): Promise<boolean> {
  const [result] = await pool.execute(
    "DELETE FROM contacts WHERE id = ? AND user_id = ?",
    [id, userId],
  );
  return (result as any).affectedRows > 0;
}

export async function deleteContactsByEntreprise(
  entrepriseId: string,
  userId: string,
): Promise<void> {
  await pool.execute(
    "DELETE FROM contacts WHERE entreprise_id = ? AND user_id = ?",
    [entrepriseId, userId],
  );
}
