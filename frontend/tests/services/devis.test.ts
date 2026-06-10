import { beforeEach, describe, expect, it, vi } from "vitest";

const apiMock = vi.hoisted(() => ({
  defaults: { baseURL: "http://localhost:3000" },
  get: vi.fn(),
  post: vi.fn(),
  delete: vi.fn(),
}));

vi.mock("../../services/api", () => ({ api: apiMock }));

import { devisService } from "../../services/devis";

describe("devisService", () => {
  beforeEach(() => {
    apiMock.get.mockReset();
    apiMock.post.mockReset();
    apiMock.delete.mockReset();
  });

  it("lists and gets devis", async () => {
    apiMock.get
      .mockResolvedValueOnce({ data: { devis: [{ _id: "d1" }] } })
      .mockResolvedValueOnce({ data: { _id: "d1" } });

    await expect(devisService.getByEntreprise("e1", "propal")).resolves.toEqual([
      { _id: "d1" },
    ]);
    await expect(devisService.get("d1")).resolves.toEqual({ _id: "d1" });

    expect(apiMock.get).toHaveBeenNthCalledWith(1, "/v1/entreprises/e1/devis", {
      params: { search: "propal" },
    });
    expect(apiMock.get).toHaveBeenNthCalledWith(2, "/v1/devis/d1");
  });

  it("uploads and deletes devis", async () => {
    apiMock.post.mockResolvedValueOnce({ data: { _id: "d1" } });
    apiMock.delete.mockResolvedValueOnce({});
    const file = new File(["hello"], "devis.pdf", { type: "application/pdf" });

    await expect(
      devisService.upload("e1", { nom: "Devis", notes: "Note", file }),
    ).resolves.toEqual({ _id: "d1" });
    await expect(devisService.delete("d1")).resolves.toBeUndefined();

    expect(apiMock.post).toHaveBeenCalledWith(
      "/v1/entreprises/e1/devis",
      expect.any(FormData),
      { headers: { "Content-Type": undefined } },
    );
    expect(apiMock.delete).toHaveBeenCalledWith("/v1/devis/d1");
  });

  it("formats file URLs and sizes", () => {
    expect(devisService.getFileUrl("/uploads/a.pdf")).toBe(
      "http://localhost:3000/uploads/a.pdf",
    );
    expect(devisService.formatFileSize(0)).toBe("0 B");
    expect(devisService.formatFileSize(1024)).toBe("1 KB");
    expect(devisService.formatFileSize(1536)).toBe("1.5 KB");
  });
});
