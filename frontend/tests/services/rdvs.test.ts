import { beforeEach, describe, expect, it, vi } from "vitest";

const apiMock = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  delete: vi.fn(),
}));

vi.mock("../../services/api", () => ({ api: apiMock }));

import { rdvsService } from "../../services/rdvs";

describe("rdvsService", () => {
  beforeEach(() => {
    Object.values(apiMock).forEach((mock) => mock.mockReset());
  });

  it("builds filtered RDV list URL and normalizes unknown status", async () => {
    apiMock.get.mockResolvedValueOnce({
      data: { rdvs: [{ _id: "r1", statut: "legacy" }] },
    });

    const result = await rdvsService.getMyRdvs("token", {
      statut: "planifie",
      page: 2,
      limite: 5,
    });

    expect(result.rdvs[0].statut).toBe("planifie");
    expect(apiMock.get).toHaveBeenCalledWith(
      "/v1/rdvs?statut=planifie&page=2&limite=5",
      { headers: { Authorization: "Bearer token" } },
    );
  });

  it("creates, updates and deletes RDVs with bearer auth", async () => {
    apiMock.post.mockResolvedValueOnce({ data: { _id: "r1", statut: "termine" } });
    apiMock.put.mockResolvedValueOnce({ data: { _id: "r1", statut: "annule" } });
    apiMock.delete.mockResolvedValueOnce({});

    await rdvsService.createRdv("token", {
      entreprise_id: "e1",
      titre: "RDV",
      date_prevue: "2026-06-10T10:00:00.000Z",
      duree_minutes: 30,
    });
    await rdvsService.updateRdv("token", "r1", { statut: "annule" });
    await rdvsService.deleteRdv("token", "r1");

    expect(apiMock.post).toHaveBeenCalledWith(
      "/v1/rdvs",
      {
        entreprise_id: "e1",
        titre: "RDV",
        date_prevue: "2026-06-10T10:00:00.000Z",
        duree_minutes: 30,
      },
      { headers: { Authorization: "Bearer token" } },
    );
    expect(apiMock.put).toHaveBeenCalledWith(
      "/v1/rdvs/r1",
      { statut: "annule" },
      { headers: { Authorization: "Bearer token" } },
    );
    expect(apiMock.delete).toHaveBeenCalledWith("/v1/rdvs/r1", {
      headers: { Authorization: "Bearer token" },
    });
  });
});
