import { beforeEach, describe, expect, it, vi } from "vitest";

const apiMock = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  delete: vi.fn(),
}));

vi.mock("../../services/api", () => ({
  api: apiMock,
}));

vi.mock("react-native", () => ({
  Platform: { OS: "web" },
}));

import { entreprisesService } from "../../services/entreprises";

describe("entreprisesService", () => {
  beforeEach(() => {
    Object.values(apiMock).forEach((mock) => mock.mockReset());
  });

  it("fetches entreprises with auth header and filters", async () => {
    apiMock.get.mockResolvedValueOnce({
      data: { entreprises: [{ id: "e1" }], total: 1 },
    });

    const result = await entreprisesService.getAll("token", {
      recherche: "acme",
      statut: "client",
      page: 2,
      limite: 10,
    });

    expect(result).toEqual({ entreprises: [{ id: "e1" }], total: 1 });
    expect(apiMock.get).toHaveBeenCalledWith("/v1/entreprises", {
      headers: { Authorization: "Bearer token" },
      params: {
        recherche: "acme",
        statut: "client",
        page: 2,
        limite: 10,
      },
    });
  });

  it("creates, updates and deletes with bearer auth", async () => {
    apiMock.post.mockResolvedValueOnce({ data: { id: "e1" } });
    apiMock.put.mockResolvedValueOnce({ data: { id: "e1", nom: "New" } });
    apiMock.delete.mockResolvedValueOnce({});

    await expect(
      entreprisesService.create("token", { nom: "ACME", statut: "prospect" }),
    ).resolves.toEqual({ id: "e1" });
    await expect(
      entreprisesService.update("token", "e1", { nom: "New" }),
    ).resolves.toEqual({ id: "e1", nom: "New" });
    await expect(entreprisesService.delete("token", "e1")).resolves.toBeUndefined();

    expect(apiMock.post).toHaveBeenCalledWith(
      "/v1/entreprises",
      { nom: "ACME", statut: "prospect" },
      { headers: { Authorization: "Bearer token" } },
    );
    expect(apiMock.put).toHaveBeenCalledWith(
      "/v1/entreprises/e1",
      { nom: "New" },
      { headers: { Authorization: "Bearer token" } },
    );
    expect(apiMock.delete).toHaveBeenCalledWith("/v1/entreprises/e1", {
      headers: { Authorization: "Bearer token" },
    });
  });
});
