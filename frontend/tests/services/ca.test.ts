import { beforeEach, describe, expect, it, vi } from "vitest";

const apiMock = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  delete: vi.fn(),
}));

vi.mock("../../services/api", () => ({ api: apiMock }));

import { caService } from "../../services/ca";

describe("caService", () => {
  beforeEach(() => {
    Object.values(apiMock).forEach((mock) => mock.mockReset());
  });

  it("builds query parameters for CA listing", async () => {
    apiMock.get.mockResolvedValueOnce({ data: { data: [{ id: "ca1" }] } });

    await expect(
      caService.getCA({ annee: 2026, mois: 6, entreprise_id: "e1" }),
    ).resolves.toEqual([{ id: "ca1" }]);

    expect(apiMock.get).toHaveBeenCalledWith(
      "/v1/ca?annee=2026&mois=6&entreprise_id=e1",
    );
  });

  it("calls create, update, delete and stats endpoints", async () => {
    apiMock.post.mockResolvedValueOnce({ data: { data: { id: "ca1" } } });
    apiMock.put.mockResolvedValueOnce({ data: { data: { id: "ca1" } } });
    apiMock.delete.mockResolvedValueOnce({});
    apiMock.get
      .mockResolvedValueOnce({ data: { data: { ca_total: 1000 } } })
      .mockResolvedValueOnce({ data: { data: { ca_total: 2000 } } });

    await caService.createCA({
      entreprise_id: "e1",
      annee: 2026,
      mois: 6,
      ca_ht: 100,
    });
    await caService.updateCA("ca1", { ca_ht: 200 });
    await caService.deleteCA("ca1");
    await caService.getCAStats(2026, 6);
    await caService.getCAEntreprise("e1", 2026);

    expect(apiMock.post).toHaveBeenCalledWith("/v1/ca", {
      entreprise_id: "e1",
      annee: 2026,
      mois: 6,
      ca_ht: 100,
    });
    expect(apiMock.put).toHaveBeenCalledWith("/v1/ca/ca1", { ca_ht: 200 });
    expect(apiMock.delete).toHaveBeenCalledWith("/v1/ca/ca1");
    expect(apiMock.get).toHaveBeenNthCalledWith(
      1,
      "/v1/ca/stats?annee=2026&mois=6",
    );
    expect(apiMock.get).toHaveBeenNthCalledWith(
      2,
      "/v1/ca/entreprise/e1?annee=2026",
    );
  });
});
