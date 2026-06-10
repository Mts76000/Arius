import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const objectifModel = vi.hoisted(() => ({
  getObjectifs: vi.fn(),
  getObjectifByMois: vi.fn(),
  createObjectif: vi.fn(),
  updateObjectif: vi.fn(),
  deleteObjectif: vi.fn(),
}));

vi.mock("../../src/models/objectif.js", () => objectifModel);

import {
  createObjectifHandler,
  getObjectifsHandler,
  updateObjectifHandler,
} from "../../src/controllers/objectifController.js";

function mockResponse() {
  const res = { status: vi.fn(), json: vi.fn() };
  res.status.mockReturnValue(res);
  return res;
}

describe("objectif controller", () => {
  beforeEach(() => {
    Object.values(objectifModel).forEach((mock) => mock.mockReset());
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("parses year filter when listing objectifs", async () => {
    objectifModel.getObjectifs.mockResolvedValueOnce([{ id: "o1" }]);
    const res = mockResponse();

    await getObjectifsHandler(
      { userId: "user-1", query: { annee: "2026" } } as any,
      res as any,
    );

    expect(objectifModel.getObjectifs).toHaveBeenCalledWith("user-1", 2026);
    expect(res.json).toHaveBeenCalledWith({ success: true, data: [{ id: "o1" }] });
  });

  it("rejects invalid monthly objective payload", async () => {
    const res = mockResponse();

    await createObjectifHandler(
      { userId: "user-1", body: { annee: 1999, mois: 13, objectif_ht: -1 } } as any,
      res as any,
    );

    expect(objectifModel.createObjectif).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("returns 404 when objective update target does not exist", async () => {
    objectifModel.updateObjectif.mockResolvedValueOnce(null);
    const res = mockResponse();

    await updateObjectifHandler(
      { userId: "user-1", params: { id: "o1" }, body: { objectif_ht: 1000 } } as any,
      res as any,
    );

    expect(res.status).toHaveBeenCalledWith(404);
  });
});
