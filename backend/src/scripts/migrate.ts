import path from "path";
import { fileURLToPath } from "url";
import { migrate } from "drizzle-orm/mysql2/migrator";
import { db } from "../db/drizzle.js";
import { pool } from "../db/mysql.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const migrationsFolder = path.resolve(__dirname, "../../drizzle");

async function tableExists(tableName: string) {
  const [rows] = await pool.query(
    `
      SELECT COUNT(*) AS count
      FROM information_schema.tables
      WHERE table_schema = DATABASE()
        AND table_name = ?
    `,
    [tableName],
  );

  return Number((rows as { count: number }[])[0]?.count ?? 0) > 0;
}

async function hasAppSchema() {
  const [rows] = await pool.query(
    `
      SELECT COUNT(*) AS count
      FROM information_schema.tables
      WHERE table_schema = DATABASE()
        AND table_name IN (
          'users',
          'entreprises',
          'contacts',
          'objectifs_mensuels',
          'ca_mensuel',
          'password_reset_tokens'
        )
    `,
  );

  return Number((rows as { count: number }[])[0]?.count ?? 0) > 0;
}

async function main() {
  const appSchemaExists = await hasAppSchema();
  const drizzleMigrationsExist = await tableExists("__drizzle_migrations");

  if (appSchemaExists && !drizzleMigrationsExist) {
    console.log(
      "Schema MySQL existant detecte sans table Drizzle. Migration initiale ignoree pour ne pas casser le volume actuel.",
    );
    console.log(
      "Pour une DB 100% Drizzle neuve: docker compose down -v puis docker compose up --build.",
    );
    return;
  }

  await migrate(db, { migrationsFolder });
  console.log("Migrations Drizzle appliquees.");
}

main()
  .catch((error) => {
    console.error("Erreur migration Drizzle:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });
