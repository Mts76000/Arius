import { beforeEach, describe, expect, it, vi } from "vitest";

const apiMock = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  delete: vi.fn(),
}));

vi.mock("../../services/api", () => ({ api: apiMock }));

import { objectifsService } from "../../services/objectifs";

describe("objectifsService", () => {
  beforeEach(() => {
    Object.values(apiMock).forEach((mock) => mock.mockReset());
  });

  it("uses optional year query parameter", async () => {
    apiMock.get.mockResolvedValueOnce({ data: { data: [] } });
    await objectifsService.getObjectifs(2026);

    expect(apiMock.get).toHaveBeenCalledWith("/v1/objectifs?annee=2026");
  });

  it("calls mutation endpoints", async () => {
    apiMock.post.mockResolvedValueOnce({ data: { data: { id: "o1" } } });
    apiMock.put.mockResolvedValueOnce({ data: { data: { id: "o1" } } });
    apiMock.delete.mockResolvedValueOnce({});

    await objectifsService.createObjectif({
      annee: 2026,
      mois: 6,
      objectif_ht: 1000,
    });
    await objectifsService.updateObjectif("o1", { objectif_ht: 2000 });
    await objectifsService.deleteObjectif("o1");

    expect(apiMock.post).toHaveBeenCalledWith("/v1/objectifs", {
      annee: 2026,
      mois: 6,
      objectif_ht: 1000,
    });
    expect(apiMock.put).toHaveBeenCalledWith("/v1/objectifs/o1", {
      objectif_ht: 2000,
    });
    expect(apiMock.delete).toHaveBeenCalledWith("/v1/objectifs/o1");
  });
});
