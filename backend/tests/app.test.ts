import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

const poolMock = vi.hoisted(() => ({
  query: vi.fn(),
}));
const mongoMock = vi.hoisted(() => ({
  connectMongo: vi.fn(),
}));

vi.mock("../src/db/mysql.js", () => ({ pool: poolMock }));
vi.mock("../src/db/mongo.js", () => ({
  connectMongo: mongoMock.connectMongo,
}));
vi.mock("pino-http", () => ({
  default: () => (_req: any, _res: any, next: any) => next(),
}));
vi.mock("../src/middleware/auth.js", () => ({
  requireAuth: (req: any, _res: any, next: any) => {
    req.userId = "user-1";
    next();
  },
}));

import { createApp } from "../src/app.js";

const mysqlTables = [
  "users",
  "password_reset_tokens",
  "entreprises",
  "contacts",
  "objectifs_mensuels",
  "ca_mensuel",
];

function mockMysqlReady() {
  poolMock.query
    .mockResolvedValueOnce([[]])
    .mockResolvedValueOnce([mysqlTables.map((table_name) => ({ table_name }))]);
}

describe("app", () => {
  beforeEach(() => {
    poolMock.query.mockReset();
    mongoMock.connectMongo.mockReset();
  });

  it("serves the OpenAPI specification", async () => {
    const response = await request(createApp()).get("/docs.json");

    expect(response.status).toBe(200);
    expect(response.body.openapi).toBe("3.0.3");
    expect(response.body.info.title).toBe("Arius API");
    expect(response.body.paths).toHaveProperty("/health");
  });

  it("returns detailed health ok on root when dependencies respond", async () => {
    mockMysqlReady();
    mongoMock.connectMongo.mockResolvedValueOnce(undefined);

    const response = await request(createApp()).get("/");

    expect(response.status).toBe(200);
    expect(response.body.status).toBe("ok");
    expect(response.body.service).toBe("arius-api");
    expect(response.body.timestamp).toEqual(expect.any(String));
    expect(response.body.uptimeSeconds).toEqual(expect.any(Number));
    expect(response.body.lines).toEqual([
      expect.stringMatching(/^api: ok \(running, 0ms\)$/),
      expect.stringMatching(/^mysql: ok \(connected, schema ready, \d+ms\)$/),
      expect.stringMatching(/^mongo: ok \(connected, \d+ms\)$/),
    ]);
    expect(response.body.checks).toEqual([
      { name: "api", status: "ok", message: "running", latencyMs: 0 },
      {
        name: "mysql",
        status: "ok",
        message: "connected, schema ready",
        latencyMs: expect.any(Number),
      },
      {
        name: "mongo",
        status: "ok",
        message: "connected",
        latencyMs: expect.any(Number),
      },
    ]);
  });

  it("returns detailed health error when MySQL schema is incomplete", async () => {
    poolMock.query
      .mockResolvedValueOnce([[]])
      .mockResolvedValueOnce([[{ table_name: "users" }]]);
    mongoMock.connectMongo.mockResolvedValueOnce(undefined);

    const response = await request(createApp()).get("/");

    expect(response.status).toBe(503);
    expect(response.body.status).toBe("error");
    expect(response.body.lines).toEqual([
      expect.stringMatching(/^api: ok \(running, 0ms\)$/),
      expect.stringMatching(
        /^mysql: error \(schema incomplete: password_reset_tokens, entreprises, contacts, objectifs_mensuels, ca_mensuel, \d+ms\)$/,
      ),
      expect.stringMatching(/^mongo: ok \(connected, \d+ms\)$/),
    ]);
  });

  it("returns detailed health error on root when one dependency fails", async () => {
    poolMock.query.mockRejectedValueOnce(new Error("down"));
    mongoMock.connectMongo.mockResolvedValueOnce(undefined);

    const response = await request(createApp()).get("/");

    expect(response.status).toBe(503);
    expect(response.body.status).toBe("error");
    expect(response.body.lines).toEqual([
      expect.stringMatching(/^api: ok \(running, 0ms\)$/),
      expect.stringMatching(/^mysql: error \(disconnected, \d+ms\)$/),
      expect.stringMatching(/^mongo: ok \(connected, \d+ms\)$/),
    ]);
  });

  it("returns health ok when dependencies respond", async () => {
    mockMysqlReady();
    mongoMock.connectMongo.mockResolvedValueOnce(undefined);

    const response = await request(createApp()).get("/health");

    expect(response.status).toBe(200);
    expect(response.body.status).toBe("ok");
  });

  it("returns health error when MySQL is unavailable", async () => {
    poolMock.query.mockRejectedValueOnce(new Error("down"));
    mongoMock.connectMongo.mockResolvedValueOnce(undefined);

    const response = await request(createApp()).get("/health");

    expect(response.status).toBe(503);
    expect(response.body.status).toBe("error");
  });

  it("validates logo upload payload", async () => {
    const response = await request(createApp())
      .post("/v1/upload")
      .field("entrepriseId", "e1");

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: "Aucun fichier uploadé" });
  });
});
