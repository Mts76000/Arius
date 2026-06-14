import mongoose from "mongoose";
import { connectMongo } from "../db/mongo.js";
import { pool } from "../db/mysql.js";

export type HealthLine = {
  name: "api" | "mysql" | "mongo";
  status: "ok" | "error";
  message: string;
  latencyMs: number;
};

const requiredMysqlTables = [
  "users",
  "password_reset_tokens",
  "entreprises",
  "contacts",
  "objectifs_mensuels",
  "ca_mensuel",
];

export function checkApi(): HealthLine {
  return { name: "api", status: "ok", message: "running", latencyMs: 0 };
}

export async function checkMysql(): Promise<HealthLine> {
  const startedAt = performance.now();

  try {
    await pool.query("SELECT 1");
    const [rows] = await pool.query(
      `SELECT table_name
       FROM information_schema.tables
       WHERE table_schema = DATABASE()
         AND table_name IN (?)`,
      [requiredMysqlTables],
    );
    const existingTables = new Set(
      (rows as Array<{ TABLE_NAME?: string; table_name?: string }>).map(
        (row) => row.TABLE_NAME ?? row.table_name,
      ),
    );
    const missingTables = requiredMysqlTables.filter(
      (table) => !existingTables.has(table),
    );

    if (missingTables.length > 0) {
      return {
        name: "mysql",
        status: "error",
        message: `schema incomplete: ${missingTables.join(", ")}`,
        latencyMs: Math.round(performance.now() - startedAt),
      };
    }

    return {
      name: "mysql",
      status: "ok",
      message: "connected, schema ready",
      latencyMs: Math.round(performance.now() - startedAt),
    };
  } catch {
    return {
      name: "mysql",
      status: "error",
      message: "disconnected",
      latencyMs: Math.round(performance.now() - startedAt),
    };
  }
}

export async function checkMongo(): Promise<HealthLine> {
  const startedAt = performance.now();

  try {
    await connectMongo();
    if (mongoose.connection.db) {
      await mongoose.connection.db.admin().ping();
    }
    return {
      name: "mongo",
      status: "ok",
      message: "connected",
      latencyMs: Math.round(performance.now() - startedAt),
    };
  } catch {
    return {
      name: "mongo",
      status: "error",
      message: "disconnected",
      latencyMs: Math.round(performance.now() - startedAt),
    };
  }
}

export function buildHealthPayload(checks: HealthLine[]) {
  const isOk = checks.every((check) => check.status === "ok");

  return {
    status: isOk ? "ok" : "error",
    service: "arius-api",
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.round(process.uptime()),
    lines: checks.map(
      (check) =>
        `${check.name}: ${check.status} (${check.message}, ${check.latencyMs}ms)`,
    ),
    checks,
  };
}

export async function runHealthChecks() {
  const checks = [
    checkApi(),
    ...(await Promise.all([checkMysql(), checkMongo()])),
  ];

  return buildHealthPayload(checks);
}
