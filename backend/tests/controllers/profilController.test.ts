import { beforeEach, describe, expect, it, vi } from "vitest";

const poolMock = vi.hoisted(() => ({
  execute: vi.fn(),
}));

const userModel = vi.hoisted(() => ({
  anonymizeUser: vi.fn(),
  comparePassword: vi.fn(),
  getUserById: vi.fn(),
  hashPassword: vi.fn(),
  isAnonymizedUser: vi.fn(),
}));

const mongoModels = vi.hoisted(() => ({
  Note: { deleteMany: vi.fn() },
  Rdv: { deleteMany: vi.fn() },
  Devis: { deleteMany: vi.fn() },
}));

const fsMock = vi.hoisted(() => ({
  existsSync: vi.fn(),
  rmSync: vi.fn(),
}));

vi.mock("../../src/db/mysql.js", () => ({ pool: poolMock }));
vi.mock("../../src/models/user.js", () => userModel);
vi.mock("../../src/models/note.js", () => ({ Note: mongoModels.Note }));
vi.mock("../../src/models/rdv.js", () => ({ Rdv: mongoModels.Rdv }));
vi.mock("../../src/models/devis.js", () => ({ Devis: mongoModels.Devis }));
vi.mock("fs", () => ({ default: fsMock, ...fsMock }));

import {
  anonymiserCompte,
  changerMotdepasse,
  getProfil,
  updateProfil,
} from "../../src/controllers/profilController.js";

function mockResponse() {
  const res = { status: vi.fn(), json: vi.fn() };
  res.status.mockReturnValue(res);
  return res;
}

describe("profil controller", () => {
  beforeEach(() => {
    poolMock.execute.mockReset();
    Object.values(userModel).forEach((mock) => mock.mockReset());
    mongoModels.Note.deleteMany.mockReset();
    mongoModels.Rdv.deleteMany.mockReset();
    mongoModels.Devis.deleteMany.mockReset();
    Object.values(fsMock).forEach((mock) => mock.mockReset());
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  it("returns current profile without password", async () => {
    userModel.getUserById.mockResolvedValueOnce({
      id: "user-1",
      email: "test@example.com",
      prenom: "Mathis",
      nom: "Lamotte",
      password: "secret",
      created_at: "2026-01-01",
    });
    userModel.isAnonymizedUser.mockReturnValueOnce(false);
    const res = mockResponse();

    await getProfil({ userId: "user-1" } as any, res as any);

    expect(res.json).toHaveBeenCalledWith({
      id: "user-1",
      email: "test@example.com",
      prenom: "Mathis",
      nom: "Lamotte",
      created_at: "2026-01-01",
    });
  });

  it("rejects invalid profile update payload", async () => {
    const res = mockResponse();

    await updateProfil({ userId: "user-1", body: { prenom: "M" } } as any, res as any);

    expect(poolMock.execute).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("updates profile fields", async () => {
    poolMock.execute.mockResolvedValueOnce([{ affectedRows: 1 }]);
    userModel.getUserById.mockResolvedValueOnce({
      id: "user-1",
      email: "test@example.com",
      prenom: "Mathis",
      nom: "Lamotte",
    });
    const res = mockResponse();

    await updateProfil(
      { userId: "user-1", body: { prenom: "Mathis", nom: "Lamotte" } } as any,
      res as any,
    );

    expect(poolMock.execute).toHaveBeenCalledWith(
      "UPDATE users SET prenom = ?, nom = ?, updated_at = ? WHERE id = ?",
      ["Mathis", "Lamotte", expect.any(String), "user-1"],
    );
    expect(res.json).toHaveBeenCalledWith({
      id: "user-1",
      email: "test@example.com",
      prenom: "Mathis",
      nom: "Lamotte",
    });
  });

  it("changes password after old password validation", async () => {
    userModel.getUserById.mockResolvedValueOnce({
      id: "user-1",
      password: "old-hash",
    });
    userModel.comparePassword.mockResolvedValueOnce(true);
    userModel.hashPassword.mockResolvedValueOnce("new-hash");
    poolMock.execute.mockResolvedValueOnce([{ affectedRows: 1 }]);
    const res = mockResponse();

    await changerMotdepasse(
      {
        userId: "user-1",
        body: {
          ancienMotdepasse: "old",
          nouveauMotdepasse: "newpass",
          confirmation: "newpass",
        },
      } as any,
      res as any,
    );

    expect(poolMock.execute).toHaveBeenCalledWith(
      "UPDATE users SET password = ?, updated_at = ? WHERE id = ?",
      ["new-hash", expect.any(String), "user-1"],
    );
    expect(res.json).toHaveBeenCalledWith({
      message: "password updated successfully",
    });
  });

  it("rejects password change when confirmation differs", async () => {
    const res = mockResponse();

    await changerMotdepasse(
      {
        userId: "user-1",
        body: {
          ancienMotdepasse: "old",
          nouveauMotdepasse: "newpass",
          confirmation: "other",
        },
      } as any,
      res as any,
    );

    expect(userModel.getUserById).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("anonymizes account and deletes user data", async () => {
    userModel.getUserById.mockResolvedValueOnce({
      id: "user-1",
      password: "hash",
      email: "test@example.com",
    });
    userModel.isAnonymizedUser.mockReturnValueOnce(false);
    userModel.comparePassword.mockResolvedValueOnce(true);
    poolMock.execute
      .mockResolvedValueOnce([[{ id: "e1" }]])
      .mockResolvedValue([{ affectedRows: 1 }]);
    fsMock.existsSync.mockReturnValueOnce(true);
    mongoModels.Note.deleteMany.mockResolvedValueOnce({ deletedCount: 1 });
    mongoModels.Rdv.deleteMany.mockResolvedValueOnce({ deletedCount: 1 });
    mongoModels.Devis.deleteMany.mockResolvedValueOnce({ deletedCount: 1 });
    const res = mockResponse();

    await anonymiserCompte(
      { userId: "user-1", body: { motdepasse: "secret" } } as any,
      res as any,
    );

    expect(fsMock.rmSync).toHaveBeenCalledWith(
      expect.stringContaining("uploads/entreprises/e1"),
      { recursive: true, force: true },
    );
    expect(mongoModels.Note.deleteMany).toHaveBeenCalledWith({ user_id: "user-1" });
    expect(poolMock.execute).toHaveBeenCalledWith(
      "DELETE FROM entreprises WHERE user_id = ?",
      ["user-1"],
    );
    expect(userModel.anonymizeUser).toHaveBeenCalledWith("user-1");
    expect(res.json).toHaveBeenCalledWith({
      message: "account deleted and anonymized successfully",
    });
  });
});
