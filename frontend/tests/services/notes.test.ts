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

import { notesService } from "../../services/notes";

describe("notesService", () => {
  beforeEach(() => {
    Object.values(apiMock).forEach((mock) => mock.mockReset());
  });

  it("builds query string for filtered company notes", async () => {
    apiMock.get.mockResolvedValueOnce({
      data: { notes: [{ _id: "n1" }], total: 1 },
    });

    const result = await notesService.getNotesByEntreprise("token", "e1", {
      type: "appel",
      tag: "urgent",
      page: 2,
      limite: 5,
    });

    expect(result).toEqual({ notes: [{ _id: "n1" }], total: 1 });
    expect(apiMock.get).toHaveBeenCalledWith(
      "/v1/entreprises/e1/notes?type=appel&tag=urgent&page=2&limite=5",
      { headers: { Authorization: "Bearer token" } },
    );
  });

  it("creates and updates notes with auth headers", async () => {
    apiMock.post.mockResolvedValueOnce({ data: { _id: "n1" } });
    apiMock.put.mockResolvedValueOnce({ data: { _id: "n1", contenu: "B" } });

    await expect(
      notesService.createNote("token", {
        entreprise_id: "e1",
        contenu: "A",
        type: "info",
      }),
    ).resolves.toEqual({ _id: "n1" });
    await expect(
      notesService.updateNote("token", "n1", { contenu: "B" }),
    ).resolves.toEqual({ _id: "n1", contenu: "B" });

    expect(apiMock.post).toHaveBeenCalledWith(
      "/v1/notes",
      { entreprise_id: "e1", contenu: "A", type: "info" },
      { headers: { Authorization: "Bearer token" } },
    );
    expect(apiMock.put).toHaveBeenCalledWith(
      "/v1/notes/n1",
      { contenu: "B" },
      { headers: { Authorization: "Bearer token" } },
    );
  });

  it("encodes search query parameters", async () => {
    apiMock.get.mockResolvedValueOnce({ data: [] });

    await notesService.searchNotes("token", "relance client + devis");

    expect(apiMock.get).toHaveBeenCalledWith(
      "/v1/notes/search?q=relance%20client%20%2B%20devis",
      { headers: { Authorization: "Bearer token" } },
    );
  });
});
