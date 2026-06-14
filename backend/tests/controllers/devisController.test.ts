import { beforeEach, describe, expect, it, vi } from "vitest";

const devisStatics = vi.hoisted(() => ({
  find: vi.fn(),
  findOne: vi.fn(),
  deleteOne: vi.fn(),
  save: vi.fn(),
}));

const DevisMock = vi.hoisted(() => {
  const ctor = vi.fn().mockImplementation(function MockDevis(data) {
    return {
      ...data,
      save: devisStatics.save,
    };
  });
  Object.assign(ctor, devisStatics);
  return ctor;
});

const fsMock = vi.hoisted(() => ({
  rmSync: vi.fn(),
  existsSync: vi.fn(),
  unlinkSync: vi.fn(),
}));

vi.mock("../../src/models/devis.js", () => ({ Devis: DevisMock }));
vi.mock("uuid", () => ({ v4: () => "devis-uuid" }));
vi.mock("fs", () => ({ default: fsMock, ...fsMock }));

import {
  get,
  listByEntreprise,
  remove,
  upload,
} from "../../src/controllers/devisController.js";

function mockResponse() {
  const res = { status: vi.fn(), json: vi.fn() };
  res.status.mockReturnValue(res);
  return res;
}

describe("devis controller", () => {
  beforeEach(() => {
    DevisMock.mockClear();
    DevisMock.mockImplementation(function MockDevis(data) {
      return {
        ...data,
        save: devisStatics.save,
      };
    });
    Object.values(devisStatics).forEach((mock) => mock.mockReset());
    Object.values(fsMock).forEach((mock) => mock.mockReset());
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  it("lists devis by entreprise with optional search", async () => {
    const sort = vi.fn().mockResolvedValueOnce([{ _id: "d1" }]);
    devisStatics.find.mockReturnValueOnce({ sort });
    const res = mockResponse();

    await listByEntreprise(
      { userId: "user-1", params: { id: "e1" }, query: { search: "propal" } } as any,
      res as any,
    );

    expect(devisStatics.find).toHaveBeenCalledWith({
      entreprise_id: "e1",
      user_id: "user-1",
      nom: { $regex: "propal", $options: "i" },
    });
    expect(sort).toHaveBeenCalledWith({ createdAt: -1 });
    expect(res.json).toHaveBeenCalledWith({ devis: [{ _id: "d1" }] });
  });

  it("gets one devis scoped to current user", async () => {
    devisStatics.findOne.mockResolvedValueOnce({ _id: "d1" });
    const res = mockResponse();

    await get({ userId: "user-1", params: { id: "d1" } } as any, res as any);

    expect(devisStatics.findOne).toHaveBeenCalledWith({
      _id: "d1",
      user_id: "user-1",
    });
    expect(res.json).toHaveBeenCalledWith({ _id: "d1" });
  });

  it("rejects upload without file or invalid name and removes temp file", async () => {
    const missing = mockResponse();
    await upload(
      { userId: "user-1", params: { id: "e1" }, body: { nom: "Devis" } } as any,
      missing as any,
    );
    expect(missing.status).toHaveBeenCalledWith(400);

    const invalid = mockResponse();
    await upload(
      {
        userId: "user-1",
        params: { id: "e1" },
        body: { nom: "aa" },
        file: { path: "/tmp/file.pdf" },
      } as any,
      invalid as any,
    );
    expect(fsMock.rmSync).toHaveBeenCalledWith("/tmp/file.pdf", { force: true });
    expect(invalid.status).toHaveBeenCalledWith(400);
  });

  it("uploads a valid devis", async () => {
    devisStatics.save.mockResolvedValueOnce(undefined);
    const res = mockResponse();

    await upload(
      {
        userId: "user-1",
        params: { id: "e1" },
        body: { nom: "Devis client", notes: " urgent " },
        file: {
          filename: "devis.pdf",
          mimetype: "application/pdf",
          size: 1234,
        },
      } as any,
      res as any,
    );

    expect(DevisMock).toHaveBeenCalledWith({
      _id: "devis-uuid",
      user_id: "user-1",
      entreprise_id: "e1",
      nom: "Devis client",
      notes: "urgent",
      nom_fichier: "devis.pdf",
      url_fichier: "/uploads/entreprises/e1/devis/devis.pdf",
      type_mime: "application/pdf",
      taille_octets: 1234,
    });
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it("removes devis metadata and linked file when present", async () => {
    devisStatics.findOne.mockResolvedValueOnce({
      entreprise_id: "e1",
      nom_fichier: "devis.pdf",
    });
    fsMock.existsSync.mockReturnValueOnce(true);
    devisStatics.deleteOne.mockResolvedValueOnce({ deletedCount: 1 });
    const res = mockResponse();

    await remove({ userId: "user-1", params: { id: "d1" } } as any, res as any);

    expect(fsMock.unlinkSync).toHaveBeenCalledWith(
      expect.stringContaining("uploads/entreprises/e1/devis/devis.pdf"),
    );
    expect(devisStatics.deleteOne).toHaveBeenCalledWith({ _id: "d1" });
    expect(res.json).toHaveBeenCalledWith({ message: "Devis supprimé" });
  });
});
