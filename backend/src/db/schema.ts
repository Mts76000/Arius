import {
  boolean,
  char,
  decimal,
  index,
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  unique,
  varchar,
} from "drizzle-orm/mysql-core";

export const users = mysqlTable(
  "users",
  {
    id: char("id", { length: 36 }).primaryKey(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    password: varchar("password", { length: 255 }),
    prenom: varchar("prenom", { length: 100 }),
    nom: varchar("nom", { length: 100 }),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
  },
  (table) => [index("idx_email").on(table.email)],
);

export const entreprises = mysqlTable(
  "entreprises",
  {
    id: char("id", { length: 36 }).primaryKey(),
    userId: char("user_id", { length: 36 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    nom: varchar("nom", { length: 255 }).notNull(),
    statut: mysqlEnum("statut", [
      "client",
      "prospect",
      "fournisseur",
      "a_reactiver",
    ]).notNull(),
    rue: varchar("rue", { length: 255 }),
    codePostal: varchar("code_postal", { length: 10 }),
    ville: varchar("ville", { length: 100 }),
    pays: varchar("pays", { length: 100 }),
    description: text("description"),
    logo: varchar("logo", { length: 500 }),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
  },
  (table) => [index("idx_user_statut_nom").on(table.userId, table.statut, table.nom)],
);

export const contacts = mysqlTable(
  "contacts",
  {
    id: char("id", { length: 36 }).primaryKey(),
    userId: char("user_id", { length: 36 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    entrepriseId: char("entreprise_id", { length: 36 })
      .notNull()
      .references(() => entreprises.id, { onDelete: "cascade" }),
    prenom: varchar("prenom", { length: 100 }),
    nom: varchar("nom", { length: 100 }).notNull(),
    poste: varchar("poste", { length: 150 }),
    email: varchar("email", { length: 255 }),
    telDirect: varchar("tel_direct", { length: 50 }),
    telMobile: varchar("tel_mobile", { length: 50 }),
    contactPrincipal: boolean("contact_principal").default(false),
    commentaire: text("commentaire"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
  },
  (table) => [
    index("idx_user_entreprise").on(
      table.userId,
      table.entrepriseId,
      table.contactPrincipal,
    ),
  ],
);

export const objectifsMensuels = mysqlTable(
  "objectifs_mensuels",
  {
    id: char("id", { length: 36 }).primaryKey(),
    userId: char("user_id", { length: 36 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    annee: int("annee").notNull(),
    mois: int("mois").notNull(),
    objectifHt: decimal("objectif_ht", { precision: 10, scale: 2 }).notNull(),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
  },
  (table) => [unique("idx_user_mois_annee").on(table.userId, table.annee, table.mois)],
);

export const caMensuel = mysqlTable(
  "ca_mensuel",
  {
    id: char("id", { length: 36 }).primaryKey(),
    userId: char("user_id", { length: 36 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    entrepriseId: char("entreprise_id", { length: 36 })
      .notNull()
      .references(() => entreprises.id, { onDelete: "cascade" }),
    annee: int("annee").notNull(),
    mois: int("mois").notNull(),
    caHt: decimal("ca_ht", { precision: 10, scale: 2 }).notNull(),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
  },
  (table) => [
    unique("idx_user_entreprise_mois_annee").on(
      table.userId,
      table.entrepriseId,
      table.annee,
      table.mois,
    ),
  ],
);
