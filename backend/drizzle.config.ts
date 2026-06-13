import "dotenv/config";
import { defineConfig } from "drizzle-kit";

const host = process.env.MYSQL_HOST ?? "localhost";
const port = process.env.MYSQL_PORT ?? "3307";
const user = process.env.MYSQL_USER ?? "root";
const password = process.env.MYSQL_PASSWORD ?? "root";
const database = process.env.MYSQL_DATABASE ?? "arius";

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "mysql",
  dbCredentials: {
    url: `mysql://${user}:${password}@${host}:${port}/${database}`,
  },
});
