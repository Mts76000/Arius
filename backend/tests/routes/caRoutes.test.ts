import express from "express";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

const authMock = vi.hoisted(() => ({
  requireAuth: vi.fn((_req, _res, next) => next()),
}));

const controllerMock = vi.hoisted(() => ({
  getCAHandler: vi.fn((_req, res) => res.json({ handler: "list" })),
  createCAHandler: vi.fn((_req, res) => res.json({ handler: "create" })),
  updateCAHandler: vi.fn((_req, res) => res.json({ handler: "update" })),
  deleteCAHandler: vi.fn((_req, res) => res.json({ handler: "delete" })),
  getCAStatsHandler: vi.fn((_req, res) => res.json({ handler: "stats" })),
  getCAEntrepriseHandler: vi.fn((_req, res) =>
    res.json({ handler: "entreprise" }),
  ),
}));

vi.mock("../../src/middleware/auth.js", () => authMock);
vi.mock("../../src/controllers/caController.js", () => controllerMock);

import caRoutes from "../../src/routes/ca.js";

describe("ca routes", () => {
  beforeEach(() => {
    Object.values(controllerMock).forEach((mock) => mock.mockClear());
    authMock.requireAuth.mockClear();
  });

  function app() {
    const application = express();
    application.use(express.json());
    application.use("/v1/ca", caRoutes);
    return application;
  }

  it("routes stats before id routes", async () => {
    const response = await request(app()).get("/v1/ca/stats");

    expect(response.body).toEqual({ handler: "stats" });
    expect(controllerMock.getCAStatsHandler).toHaveBeenCalledOnce();
    expect(controllerMock.updateCAHandler).not.toHaveBeenCalled();
  });

  it("routes CRUD and entreprise analytics", async () => {
    await expect(request(app()).get("/v1/ca")).resolves.toMatchObject({
      body: { handler: "list" },
    });
    await expect(request(app()).post("/v1/ca").send({})).resolves.toMatchObject({
      body: { handler: "create" },
    });
    await expect(request(app()).put("/v1/ca/ca1").send({})).resolves.toMatchObject({
      body: { handler: "update" },
    });
    await expect(request(app()).delete("/v1/ca/ca1")).resolves.toMatchObject({
      body: { handler: "delete" },
    });
    await expect(request(app()).get("/v1/ca/entreprise/e1")).resolves.toMatchObject({
      body: { handler: "entreprise" },
    });
  });
});
