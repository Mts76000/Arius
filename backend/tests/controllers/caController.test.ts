import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const caModel = vi.hoisted(() => ({
  getCA: vi.fn(),
  getCAByMois: vi.fn(),
  createCA: vi.fn(),
  updateCA: vi.fn(),
  deleteCA: vi.fn(),
  getCAStats: vi.fn(),
  getCAEntreprise: vi.fn(),
}));

vi.mock("../../src/models/ca.js", () => caModel);

import { createCAHandler, getCAHandler, getCAStatsHandler } from "../../src/controllers/caController.js";

function mockResponse() {
  const res = { status: vi.fn(), json: vi.fn() };
  res.status.mockReturnValue(res);
  return res;
}

describe("ca controller", () => {
  beforeEach(() => {
    Object.values(caModel).forEach((mock) => mock.mockReset());
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("parses filters when listing CA", async () => {
    caModel.getCA.mockResolvedValueOnce([{ id: "ca1" }]);
    const res = mockResponse();

    await getCAHandler(
      {
        userId: "user-1",
        query: { annee: "2026", mois: "6", entreprise_id: "e1" },
      } as any,
      res as any,
    );

    expect(caModel.getCA).toHaveBeenCalledWith("user-1", {
      annee: 2026,
      mois: 6,
      entreprise_id: "e1",
    });
    expect(res.json).toHaveBeenCalledWith({ success: true, data: [{ id: "ca1" }] });
  });

  it("rejects negative CA creation", async () => {
    const res = mockResponse();

    await createCAHandler(
      {
        userId: "user-1",
        body: { entreprise_id: "e1", annee: 2026, mois: 6, ca_ht: -1 },
      } as any,
      res as any,
    );

    expect(caModel.createCA).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("loads CA stats for a month", async () => {
    caModel.getCAStats.mockResolvedValueOnce({ ca_total: 1000 });
    const res = mockResponse();

    await getCAStatsHandler(
      { userId: "user-1", query: { annee: "2026", mois: "6" } } as any,
      res as any,
    );

    expect(caModel.getCAStats).toHaveBeenCalledWith("user-1", 2026, 6);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: { ca_total: 1000 },
    });
  });
});
