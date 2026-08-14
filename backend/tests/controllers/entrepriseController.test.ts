import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const entrepriseModel = vi.hoisted(() => ({
  getEntreprises: vi.fn(),
  getEntrepriseById: vi.fn(),
  createEntreprise: vi.fn(),
  updateEntreprise: vi.fn(),
  deleteEntreprise: vi.fn(),
}));

vi.mock("../../src/models/entreprise.js", () => entrepriseModel);

import {
  create,
  get,
  list,
  remove,
  update,
} from "../../src/controllers/entrepriseController.js";

function mockResponse() {
  const res = { status: vi.fn(), json: vi.fn(), send: vi.fn() };
  res.status.mockReturnValue(res);
  return res;
}

describe("entreprise controller", () => {
  beforeEach(() => {
    Object.values(entrepriseModel).forEach((mock) => mock.mockReset());
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("rejects list without authenticated user", async () => {
    const res = mockResponse();

    await list({ userId: undefined, query: {} } as any, res as any);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(entrepriseModel.getEntreprises).not.toHaveBeenCalled();
  });

  it("parses and bounds pagination when listing entreprises", async () => {
    entrepriseModel.getEntreprises.mockResolvedValueOnce({
      entreprises: [{ id: "e1" }],
      total: 1,
    });
    const res = mockResponse();

    await list(
      {
        userId: "user-1",
        query: { recherche: "acme", statut: "client", page: "2", limite: "10" },
      } as any,
      res as any,
    );

    expect(entrepriseModel.getEntreprises).toHaveBeenCalledWith("user-1", {
      recherche: "acme",
      statut: "client",
      page: 2,
      limite: 10,
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      entreprises: [{ id: "e1" }],
      total: 1,
    });
  });

  it("rejects an out-of-range limite when listing entreprises", async () => {
    const res = mockResponse();

    await list(
      { userId: "user-1", query: { limite: "500" } } as any,
      res as any,
    );

    expect(entrepriseModel.getEntreprises).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("returns 404 when entreprise is not found", async () => {
    entrepriseModel.getEntrepriseById.mockResolvedValueOnce(null);
    const res = mockResponse();

    await get(
      { userId: "user-1", params: { id: "missing" } } as any,
      res as any,
    );

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it("creates an entreprise", async () => {
    entrepriseModel.createEntreprise.mockResolvedValueOnce({ id: "e1" });
    const res = mockResponse();

    await create(
      {
        userId: "user-1",
        body: { nom: "ACME", statut: "prospect" },
      } as any,
      res as any,
    );

    expect(entrepriseModel.createEntreprise).toHaveBeenCalledWith("user-1", {
      nom: "ACME",
      statut: "prospect",
      rue: null,
      code_postal: null,
      ville: null,
      pays: null,
      description: null,
      logo: null,
    });
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it("rejects creation with an invalid statut", async () => {
    const res = mockResponse();

    await create(
      { userId: "user-1", body: { nom: "ACME", statut: "invalide" } } as any,
      res as any,
    );

    expect(entrepriseModel.createEntreprise).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("updates an entreprise", async () => {
    entrepriseModel.updateEntreprise.mockResolvedValueOnce({
      id: "e1",
      nom: "ACME 2",
    });
    const res = mockResponse();

    await update(
      {
        userId: "user-1",
        params: { id: "e1" },
        body: { nom: "ACME 2" },
      } as any,
      res as any,
    );

    expect(entrepriseModel.updateEntreprise).toHaveBeenCalledWith(
      "e1",
      "user-1",
      { nom: "ACME 2" },
    );
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("deletes an entreprise", async () => {
    entrepriseModel.deleteEntreprise.mockResolvedValueOnce(true);
    const res = mockResponse();

    await remove(
      { userId: "user-1", params: { id: "e1" } } as any,
      res as any,
    );

    expect(entrepriseModel.deleteEntreprise).toHaveBeenCalledWith(
      "e1",
      "user-1",
    );
    expect(res.status).toHaveBeenCalledWith(204);
  });

  it("returns 404 when deleting an unknown entreprise", async () => {
    entrepriseModel.deleteEntreprise.mockResolvedValueOnce(false);
    const res = mockResponse();

    await remove(
      { userId: "user-1", params: { id: "missing" } } as any,
      res as any,
    );

    expect(res.status).toHaveBeenCalledWith(404);
  });
});
