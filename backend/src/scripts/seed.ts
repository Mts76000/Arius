import { fakerFR as faker } from "@faker-js/faker";
import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { db } from "../db/drizzle.js";
import {
  caMensuel,
  contacts as contactsTable,
  entreprises as entreprisesTable,
  objectifsMensuels,
  passwordResetTokens,
  users,
} from "../db/schema.js";
import { pool } from "../db/mysql.js";
import { connectMongo, disconnectMongo } from "../db/mongo.js";
import { hashPassword } from "../models/user.js";
import { Note } from "../models/note.js";
import { Rdv } from "../models/rdv.js";
import { Devis } from "../models/devis.js";

const DEMO_USER_ID = "00000000-0000-4000-8000-000000000001";
const DEMO_EMAIL = "demo@arius.local";
const DEMO_PASSWORD = "Password123";

const statuts = ["client", "prospect", "fournisseur", "a_reactiver"] as const;
const postes = [
  "Directeur general",
  "Responsable achats",
  "Office manager",
  "Responsable commercial",
  "Responsable technique",
];
const noteTypes = ["appel", "reunion", "email", "info", "autre"] as const;

type SeedEntreprise = {
  id: string;
  nom: string;
  statut: (typeof statuts)[number];
  rue: string;
  codePostal: string;
  ville: string;
  pays: string;
  description: string;
  logo: string | null;
};

type SeedContact = {
  id: string;
  entrepriseId: string;
};

function monthOffset(date: Date, offset: number) {
  return new Date(date.getFullYear(), date.getMonth() + offset, 1);
}

async function cleanDemoData() {
  await Promise.all([
    Note.deleteMany({ user_id: DEMO_USER_ID }),
    Rdv.deleteMany({ user_id: DEMO_USER_ID }),
    Devis.deleteMany({ user_id: DEMO_USER_ID }),
  ]);

  await db.delete(caMensuel).where(eq(caMensuel.userId, DEMO_USER_ID));
  await db
    .delete(objectifsMensuels)
    .where(eq(objectifsMensuels.userId, DEMO_USER_ID));
  await db.delete(contactsTable).where(eq(contactsTable.userId, DEMO_USER_ID));
  await db
    .delete(entreprisesTable)
    .where(eq(entreprisesTable.userId, DEMO_USER_ID));
  await db
    .delete(passwordResetTokens)
    .where(eq(passwordResetTokens.userId, DEMO_USER_ID));
  await db.delete(users).where(eq(users.id, DEMO_USER_ID));
}

async function seedUser() {
  await db.insert(users).values({
    id: DEMO_USER_ID,
    email: DEMO_EMAIL,
    password: await hashPassword(DEMO_PASSWORD),
    prenom: "Demo",
    nom: "Arius",
  });
}

async function seedEntreprises() {
  const entreprises: SeedEntreprise[] = Array.from({ length: 14 }, () => ({
    id: uuidv4(),
    nom: faker.company.name(),
    statut: faker.helpers.arrayElement(statuts),
    rue: faker.location.streetAddress(),
    codePostal: faker.location.zipCode("#####"),
    ville: faker.location.city(),
    pays: "France",
    description: faker.company.catchPhrase(),
    logo: null,
  }));

  await db.insert(entreprisesTable).values(
    entreprises.map((entreprise) => ({
      id: entreprise.id,
      userId: DEMO_USER_ID,
      nom: entreprise.nom,
      statut: entreprise.statut,
      rue: entreprise.rue,
      codePostal: entreprise.codePostal,
      ville: entreprise.ville,
      pays: entreprise.pays,
      description: entreprise.description,
      logo: entreprise.logo,
    })),
  );

  return entreprises;
}

async function seedContacts(entreprises: SeedEntreprise[]) {
  const contacts: SeedContact[] = [];

  for (const entreprise of entreprises) {
    const contactCount = faker.number.int({ min: 1, max: 3 });

    for (let index = 0; index < contactCount; index += 1) {
      const id = uuidv4();
      const firstName = faker.person.firstName();
      const lastName = faker.person.lastName();

      await db.insert(contactsTable).values({
        id,
        userId: DEMO_USER_ID,
        entrepriseId: entreprise.id,
        prenom: firstName,
        nom: lastName,
        poste: faker.helpers.arrayElement(postes),
        email: faker.internet.email({ firstName, lastName }).toLowerCase(),
        telDirect: faker.phone.number(),
        telMobile: faker.phone.number(),
        contactPrincipal: index === 0,
        commentaire: faker.lorem.sentence(),
      });

      contacts.push({ id, entrepriseId: entreprise.id });
    }
  }

  return contacts;
}

async function seedObjectifsAndCA(entreprises: SeedEntreprise[]) {
  const now = new Date();
  const objectifs = [];
  const chiffresAffaires = [];

  for (let offset = -5; offset <= 2; offset += 1) {
    const date = monthOffset(now, offset);
    const annee = date.getFullYear();
    const mois = date.getMonth() + 1;

    objectifs.push({
      id: uuidv4(),
      userId: DEMO_USER_ID,
      annee,
      mois,
      objectifHt: String(faker.number.int({ min: 18_000, max: 65_000 })),
    });

    for (const entreprise of faker.helpers.arrayElements(entreprises, {
      min: 4,
      max: 8,
    })) {
      chiffresAffaires.push({
        id: uuidv4(),
        userId: DEMO_USER_ID,
        entrepriseId: entreprise.id,
        annee,
        mois,
        caHt: String(faker.number.int({ min: 1200, max: 16_000 })),
      });
    }
  }

  await db.insert(objectifsMensuels).values(objectifs);
  await db.insert(caMensuel).values(chiffresAffaires);

  return {
    objectifs: objectifs.length,
    ca: chiffresAffaires.length,
  };
}

async function seedNotes(entreprises: SeedEntreprise[]) {
  let total = 0;

  for (const entreprise of entreprises) {
    const notes = Array.from(
      { length: faker.number.int({ min: 2, max: 5 }) },
      () => ({
        _id: uuidv4(),
        user_id: DEMO_USER_ID,
        entreprise_id: entreprise.id,
        contenu: faker.lorem.sentences({ min: 1, max: 3 }),
        type: faker.helpers.arrayElement(noteTypes),
        est_template: false,
        nom_template: null,
      }),
    );

    await Note.insertMany(notes);
    total += notes.length;
  }

  return total;
}

async function seedRdvs(entreprises: SeedEntreprise[], contacts: SeedContact[]) {
  const rdvs = Array.from({ length: 22 }, () => {
    const entreprise = faker.helpers.arrayElement(entreprises);
    const contact = faker.helpers.arrayElement(
      contacts.filter((item) => item.entrepriseId === entreprise.id),
    );

    return {
      _id: uuidv4(),
      user_id: DEMO_USER_ID,
      entreprise_id: entreprise.id,
      contact_id: contact?.id,
      titre: faker.helpers.arrayElement([
        "Point commercial",
        "Demo produit",
        "Relance devis",
        "Rendez-vous de suivi",
      ]),
      description: faker.lorem.sentence(),
      date_prevue: faker.date.soon({ days: 45 }),
      duree_minutes: faker.helpers.arrayElement([30, 45, 60, 90]),
      statut: faker.helpers.arrayElement(["planifie", "planifie", "termine"]),
    };
  });

  await Rdv.insertMany(rdvs);

  return rdvs.length;
}

async function seedDevis(entreprises: SeedEntreprise[]) {
  const devis = faker.helpers.arrayElements(entreprises, { min: 5, max: 8 }).map(
    (entreprise) => ({
      _id: uuidv4(),
      user_id: DEMO_USER_ID,
      entreprise_id: entreprise.id,
      nom: `Devis ${entreprise.nom}`,
      notes: faker.lorem.sentence(),
      nom_fichier: "devis-demo.pdf",
      url_fichier: `/uploads/entreprises/${entreprise.id}/devis/devis-demo.pdf`,
      type_mime: "application/pdf",
      taille_octets: faker.number.int({ min: 80_000, max: 900_000 }),
    }),
  );

  await Devis.insertMany(devis);

  return devis.length;
}

async function main() {
  faker.seed(76000);
  await connectMongo();
  await cleanDemoData();
  await seedUser();
  const entreprises = await seedEntreprises();
  const contacts = await seedContacts(entreprises);
  const finances = await seedObjectifsAndCA(entreprises);
  const notes = await seedNotes(entreprises);
  const rdvs = await seedRdvs(entreprises, contacts);
  const devis = await seedDevis(entreprises);

  console.log("Fixtures Arius creees avec succes.");
  console.log(`Email: ${DEMO_EMAIL}`);
  console.log(`Mot de passe: ${DEMO_PASSWORD}`);
  console.log(
    [
      `Entreprises: ${entreprises.length}`,
      `Contacts: ${contacts.length}`,
      `Objectifs: ${finances.objectifs}`,
      `CA: ${finances.ca}`,
      `Notes: ${notes}`,
      `RDV: ${rdvs}`,
      `Devis: ${devis}`,
    ].join(" | "),
  );
}

main()
  .catch((error) => {
    console.error("Erreur pendant le seed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await disconnectMongo();
    await pool.end();
  });
