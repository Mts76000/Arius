import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  Note,
  createNote,
  deleteNote,
  getNoteById,
  getNotesByEntreprise,
  getNotesByTags,
  getNotesForDashboard,
  getTemplatesByType,
  searchNotes,
  updateNote,
} from "../../src/models/note.js";

function chain(finalValue: unknown) {
  const chainObject: any = {
    sort: vi.fn(() => chainObject),
    skip: vi.fn(() => chainObject),
    limit: vi.fn(() => Promise.resolve(finalValue)),
    then: undefined,
  };
  return chainObject;
}

describe("note model", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("lists notes by entreprise with pagination", async () => {
    const queryChain = chain([{ _id: "n1" }]);
    vi.spyOn(Note, "find").mockReturnValueOnce(queryChain as any);
    vi.spyOn(Note, "countDocuments").mockResolvedValueOnce(1 as any);

    const result = await getNotesByEntreprise("e1", "user-1", {
      type: "appel",
      page: 2,
      limite: 10,
    });

    expect(Note.find).toHaveBeenCalledWith({
      user_id: "user-1",
      entreprise_id: "e1",
      type: "appel",
    });
    expect(queryChain.skip).toHaveBeenCalledWith(10);
    expect(queryChain.limit).toHaveBeenCalledWith(10);
    expect(result).toEqual({ notes: [{ _id: "n1" }], total: 1 });
  });

  it("gets, updates and deletes by user scope", async () => {
    vi.spyOn(Note, "findOne").mockResolvedValueOnce({ _id: "n1" } as any);
    vi.spyOn(Note, "findOneAndUpdate").mockResolvedValueOnce({ _id: "n1" } as any);
    vi.spyOn(Note, "deleteOne").mockResolvedValueOnce({ deletedCount: 1 } as any);

    await expect(getNoteById("n1", "user-1")).resolves.toEqual({ _id: "n1" });
    await expect(updateNote("n1", "user-1", { contenu: "B" })).resolves.toEqual({
      _id: "n1",
    });
    await expect(deleteNote("n1", "user-1")).resolves.toBe(true);

    expect(Note.findOne).toHaveBeenCalledWith({ _id: "n1", user_id: "user-1" });
    expect(Note.findOneAndUpdate).toHaveBeenCalledWith(
      { _id: "n1", user_id: "user-1" },
      { contenu: "B" },
      { new: true },
    );
  });

  it("creates a note with defaults", async () => {
    const save = vi.spyOn(Note.prototype, "save").mockResolvedValueOnce(undefined as any);

    const note = await createNote("user-1", {
      entreprise_id: "e1",
      contenu: "A",
      type: "info",
    });

    expect(save).toHaveBeenCalled();
    expect(note.user_id).toBe("user-1");
    expect(note.est_template).toBe(false);
    expect(note.nom_template).toBeNull();
  });

  it("searches notes and templates with sorting", async () => {
    const searchChain = chain([{ _id: "n1" }]);
    vi.spyOn(Note, "find").mockReturnValueOnce(searchChain as any);

    await searchNotes("user-1", "relance");

    expect(Note.find).toHaveBeenCalledWith(
      { user_id: "user-1", contenu: { $regex: "relance", $options: "i" } },
      null,
      { limit: 50 },
    );
    expect(searchChain.sort).toHaveBeenCalledWith({ created_at: -1 });

    const maliciousChain = chain([]);
    vi.spyOn(Note, "find").mockReturnValueOnce(maliciousChain as any);

    await searchNotes("user-1", "(a+)+$.*");

    expect(Note.find).toHaveBeenCalledWith(
      {
        user_id: "user-1",
        contenu: { $regex: "\\(a\\+\\)\\+\\$\\.\\*", $options: "i" },
      },
      null,
      { limit: 50 },
    );

    const templateChain = chain([{ _id: "t1" }]);
    vi.spyOn(Note, "find").mockReturnValueOnce(templateChain as any);
    await getTemplatesByType("user-1", "appel");
    expect(Note.find).toHaveBeenLastCalledWith({
      user_id: "user-1",
      est_template: true,
      type: "appel",
    });
    expect(templateChain.sort).toHaveBeenCalledWith({ nom_template: 1 });
  });

  it("returns empty list when tag search has no tags", async () => {
    await expect(getNotesByTags("user-1", [])).resolves.toEqual([]);
  });

  it("builds dashboard aggregation pipeline", async () => {
    vi.spyOn(Note, "aggregate").mockResolvedValueOnce([{ _id: "e1" }] as any);

    await expect(getNotesForDashboard("user-1", 14)).resolves.toEqual([
      { _id: "e1" },
    ]);

    expect(Note.aggregate).toHaveBeenCalledWith(
      expect.arrayContaining([
        {
          $match: expect.objectContaining({
            user_id: "user-1",
            created_at: expect.objectContaining({ $lt: expect.any(Date) }),
          }),
        },
      ]),
    );
  });
});
