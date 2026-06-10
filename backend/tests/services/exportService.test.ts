import { beforeEach, describe, expect, it, vi } from "vitest";

const poolMock = vi.hoisted(() => ({
  query: vi.fn(),
}));

const mongoMocks = vi.hoisted(() => ({
  Note: { find: vi.fn() },
  Rdv: { find: vi.fn() },
}));

vi.mock("../../src/db/mysql.js", () => ({ pool: poolMock }));
vi.mock("../../src/models/note.js", () => ({ Note: mongoMocks.Note }));
vi.mock("../../src/models/rdv.js", () => ({ Rdv: mongoMocks.Rdv }));

import { streamRgpdExport } from "../../src/services/exportService.js";

function lean(value: unknown[]) {
  return { lean: vi.fn().mockResolvedValue(value) };
}

function mockResponse() {
  return {
    setHeader: vi.fn(),
    end: vi.fn(),
  };
}

describe("export service", () => {
  beforeEach(() => {
    poolMock.query.mockReset();
    mongoMocks.Note.find.mockReset();
    mongoMocks.Rdv.find.mockReset();
  });

  it("streams a complete XLSX export with expected headers", async () => {
    poolMock.query
      .mockResolvedValueOnce([[{ id: "e1", nom: "ACME", statut: "client" }]])
      .mockResolvedValueOnce([[{ id: "c1", entreprise_id: "e1", nom: "Durand" }]])
      .mockResolvedValueOnce([[{ annee: 2026, mois: 6, objectif_ht: 1000 }]])
      .mockResolvedValueOnce([[{ entreprise_id: "e1", annee: 2026, mois: 6, ca_ht: 500 }]]);
    mongoMocks.Note.find.mockReturnValueOnce(
      lean([{ entreprise_id: "e1", type: "info", contenu: "Note" }]) as any,
    );
    mongoMocks.Rdv.find.mockReturnValueOnce(
      lean([{ entreprise_id: "e1", contact_id: "c1", titre: "RDV" }]) as any,
    );
    const res = mockResponse();

    await streamRgpdExport("user-1", res as any);

    expect(poolMock.query).toHaveBeenCalledTimes(4);
    expect(mongoMocks.Note.find).toHaveBeenCalledWith({ user_id: "user-1" });
    expect(res.setHeader).toHaveBeenCalledWith(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    expect(res.setHeader).toHaveBeenCalledWith(
      "Content-Disposition",
      expect.stringContaining("export_complet_"),
    );
    expect(res.end).toHaveBeenCalledWith(expect.any(Buffer));
  });

  it("streams a selected sheet export", async () => {
    poolMock.query
      .mockResolvedValueOnce([[{ id: "e1", nom: "ACME" }]])
      .mockResolvedValueOnce([[]])
      .mockResolvedValueOnce([[]])
      .mockResolvedValueOnce([[]]);
    mongoMocks.Note.find.mockReturnValueOnce(lean([]) as any);
    mongoMocks.Rdv.find.mockReturnValueOnce(lean([]) as any);
    const res = mockResponse();

    await streamRgpdExport("user-1", res as any, "notes");

    expect(res.setHeader).toHaveBeenCalledWith(
      "Content-Disposition",
      expect.stringContaining("export_notes_"),
    );
  });
});
