import { beforeEach, describe, expect, it, vi } from "vitest";

const noteModel = vi.hoisted(() => ({
  getNotesByEntreprise: vi.fn(),
  getNoteById: vi.fn(),
  createNote: vi.fn(),
  updateNote: vi.fn(),
  deleteNote: vi.fn(),
  searchNotes: vi.fn(),
  getTemplatesByType: vi.fn(),
  getNotesForDashboard: vi.fn(),
}));

vi.mock("../../src/models/note.js", () => noteModel);

import { create, getTemplates, listByEntreprise } from "../../src/controllers/noteController.js";

function mockResponse() {
  const res = {
    status: vi.fn(),
    json: vi.fn(),
  };
  res.status.mockReturnValue(res);
  return res;
}

describe("note controller", () => {
  beforeEach(() => {
    Object.values(noteModel).forEach((mock) => mock.mockReset());
  });

  it("lists notes with pagination defaults", async () => {
    noteModel.getNotesByEntreprise.mockResolvedValueOnce({
      notes: [{ _id: "n1" }],
      total: 1,
    });
    const res = mockResponse();

    await listByEntreprise(
      { userId: "user-1", params: { id: "e1" }, query: {} } as any,
      res as any,
    );

    expect(noteModel.getNotesByEntreprise).toHaveBeenCalledWith("e1", "user-1", {
      type: undefined,
      tag: undefined,
      page: 1,
      limite: 20,
    });
    expect(res.json).toHaveBeenCalledWith({ notes: [{ _id: "n1" }], total: 1 });
  });

  it("accepts legacy camelCase note payload and normalizes accented type", async () => {
    noteModel.createNote.mockResolvedValueOnce({ _id: "n1" });
    const res = mockResponse();

    await create(
      {
        userId: "user-1",
        body: {
          entrepriseId: "e1",
          contenu: "Message laisse",
          type: "Réunion",
          estTemplate: true,
          nomTemplate: "Relance",
        },
      } as any,
      res as any,
    );

    expect(noteModel.createNote).toHaveBeenCalledWith("user-1", {
      entreprise_id: "e1",
      contenu: "Message laisse",
      type: "reunion",
      est_template: true,
      nom_template: "Relance",
      tags: undefined,
    });
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ _id: "n1" });
  });

  it("rejects invalid template type", async () => {
    const res = mockResponse();

    await getTemplates(
      { userId: "user-1", query: { type: "invalid" } } as any,
      res as any,
    );

    expect(noteModel.getTemplatesByType).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "Valid type required" });
  });
});
