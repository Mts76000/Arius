import dotenv from "dotenv";

dotenv.config();

function required(name: string, fallback?: string) {
  const v = process.env[name] ?? fallback;
  if (!v) throw new Error(`Missing required env var ${name}`);
  return v;
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: Number(process.env.PORT ?? 3000),
  mysqlHost: required("MYSQL_HOST", "localhost"),
  mysqlPort: Number(process.env.MYSQL_PORT ?? 3306),
  mysqlUser: required("MYSQL_USER", "root"),
  mysqlPassword: process.env.MYSQL_PASSWORD ?? "",
  mysqlDatabase: required("MYSQL_DATABASE", "arius"),
  mongoUrl: required("MONGO_URL", "mongodb://localhost:27017/arius"),
  jwtSecret: required("JWT_SECRET", "change-me-in-prod"),
  frontendUrl: process.env.FRONTEND_URL ?? "http://localhost:8081",
  resendApiKey: process.env.RESEND_API_KEY ?? "",
  resendFromEmail: process.env.RESEND_FROM_EMAIL ?? "",
};
