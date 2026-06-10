import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

const poolMock = vi.hoisted(() => ({
  query: vi.fn(),
}));

vi.mock("../src/db/mysql.js", () => ({ pool: poolMock }));
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

describe("app", () => {
  beforeEach(() => {
    poolMock.query.mockReset();
  });

  it("returns health ok when MySQL responds", async () => {
    poolMock.query.mockResolvedValueOnce([[]]);

    const response = await request(createApp()).get("/health");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: "ok", mysql: "connected" });
  });

  it("returns health error when MySQL is unavailable", async () => {
    poolMock.query.mockRejectedValueOnce(new Error("down"));

    const response = await request(createApp()).get("/health");

    expect(response.status).toBe(503);
    expect(response.body).toEqual({ status: "error", mysql: "disconnected" });
  });

  it("validates logo upload payload", async () => {
    const response = await request(createApp())
      .post("/v1/upload")
      .field("entrepriseId", "e1");

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: "Aucun fichier uploadé" });
  });
});
