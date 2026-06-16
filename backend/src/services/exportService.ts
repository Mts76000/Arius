import type { Response } from "express";
import ExcelJS from "exceljs";
import { pool } from "../db/mysql.js";
import { Note } from "../models/note.js";
import { Rdv } from "../models/rdv.js";

async function fetchMySqlRows(userId: string, table: string) {
  const [rows] = await pool.query(`SELECT * FROM ${table} WHERE user_id = ?`, [
    userId,
  ]);
  return rows as any[];
}

export async function streamRgpdExport(
  userId: string,
  res: Response,
  type?: string,
) {
  const [entreprises, contacts, objectifs, ca, notes, rdvs] = await Promise.all(
    [
      fetchMySqlRows(userId, "entreprises"),
      fetchMySqlRows(userId, "contacts"),
      fetchMySqlRows(userId, "objectifs_mensuels"),
      fetchMySqlRows(userId, "ca_mensuel"),
      Note.find({ user_id: userId }).lean(),
      Rdv.find({ user_id: userId }).lean(),
    ],
  );

  const entrepriseById = new Map(
    entreprises.map((entreprise: any) => [entreprise.id, entreprise]),
  );
  const contactById = new Map(
    contacts.map((contact: any) => [contact.id, contact]),
  );

  const moisLibelles = [
    "Janvier",
    "Février",
    "Mars",
    "Avril",
    "Mai",
    "Juin",
    "Juillet",
    "Août",
    "Septembre",
    "Octobre",
    "Novembre",
    "Décembre",
  ];
  const formatMois = (mois: number) => moisLibelles[mois - 1] ?? String(mois);
  const formatDate = (value: any) =>
    value ? new Date(value).toLocaleString("fr-FR") : "";

  const contactsByEntreprise = new Map<string, any[]>();
  for (const contact of contacts) {
    const key = contact.entreprise_id;
    if (!contactsByEntreprise.has(key)) contactsByEntreprise.set(key, []);
    contactsByEntreprise.get(key)!.push(contact);
  }

  const prospects = entreprises.flatMap((entreprise) => {
    const entrepriseContacts = contactsByEntreprise.get(entreprise.id) ?? [];
    if (entrepriseContacts.length === 0) {
      return [
        {
          Entreprise: entreprise.nom ?? "",
          Statut: entreprise.statut,
          Contact: "",
          Fonction: "",
          "Tél. Mobile": "",
          "Tél. Fixe": "",
          Email: "",
          Adresse: entreprise.rue ?? "",
          CP: entreprise.code_postal ?? "",
          Ville: entreprise.ville ?? "",
        },
      ];
    }

    return entrepriseContacts.map((contact: any) => ({
      Entreprise: entreprise.nom ?? "",
      Statut: entreprise.statut,
      Contact: `${contact.prenom ?? ""} ${contact.nom ?? ""}`.trim(),
      Fonction: contact.poste ?? "",
      "Tél. Mobile": contact.tel_mobile ?? "",
      "Tél. Fixe": contact.tel_direct ?? "",
      Email: contact.email ?? "",
      Adresse: entreprise.rue ?? "",
      CP: entreprise.code_postal ?? "",
      Ville: entreprise.ville ?? "",
    }));
  });

  const rdvSheets = rdvs.map((item: any) => {
    const entreprise = entrepriseById.get(item.entreprise_id);
    const contact = item.contact_id ? contactById.get(item.contact_id) : null;
    return {
      Entreprise: entreprise?.nom ?? "",
      Contact: contact
        ? `${contact.prenom ?? ""} ${contact.nom ?? ""}`.trim()
        : "",
      Titre: item.titre ?? "",
      Date: formatDate(item.date_prevue),
      Statut: item.statut ?? "",
      Lieu: item.lieu ?? "",
    };
  });

  const notesSheets = notes.map((item: any) => {
    const entreprise = entrepriseById.get(item.entreprise_id);
    return {
      Entreprise: entreprise?.nom ?? "",
      Type: item.type ?? "",
      Contenu: item.contenu ?? "",
      Date: formatDate(item.createdAt ?? item.created_at),
    };
  });

  const caSheets = ca.map((item: any) => {
    const entreprise = entrepriseById.get(item.entreprise_id);
    return {
      Année: item.annee,
      Mois: formatMois(item.mois),
      Entreprise: entreprise?.nom ?? "",
      "CA HT": item.ca_ht,
    };
  });

  const objectifsSheets = objectifs.map((item: any) => ({
    Année: item.annee,
    Mois: formatMois(item.mois),
    "Objectif HT": item.objectif_ht,
  }));

  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Arius";
  workbook.created = new Date();
  const sheets: Record<string, any[]> = {
    prospects,
    rdvs: rdvSheets,
    notes: notesSheets,
    ca: caSheets,
    objectifs: objectifsSheets,
  };

  const normalizedType = type?.toLowerCase();
  const selectedSheets =
    normalizedType && sheets[normalizedType]
      ? { [normalizedType]: sheets[normalizedType] }
      : sheets;

  Object.entries(selectedSheets).forEach(([name, data]) => {
    if (!data) return;
    const sheet = workbook.addWorksheet(name);
    const columns = Object.keys(data[0] ?? {});

    sheet.columns = columns.map((column) => ({
      header: column,
      key: column,
      width: Math.min(Math.max(column.length + 4, 14), 32),
    }));
    sheet.addRows(data);
  });

  const buffer = Buffer.from(await workbook.xlsx.writeBuffer());

  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  );
  res.setHeader("Access-Control-Expose-Headers", "Content-Disposition");
  const typeLabels: Record<string, string> = {
    prospects: "prospects",
    rdvs: "rdvs",
    notes: "notes",
    ca: "chiffre-affaires",
    objectifs: "objectifs",
  };
  const label = normalizedType
    ? (typeLabels[normalizedType] ?? normalizedType)
    : "complet";
  const date = new Date().toISOString().slice(0, 10);
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="export_${label}_${date}.xlsx"`,
  );

  res.end(buffer);
}
