import { beforeEach, describe, expect, it, vi } from "vitest";

const apiMock = vi.hoisted(() => ({
  get: vi.fn(),
  patch: vi.fn(),
  post: vi.fn(),
}));

vi.mock("../../services/api", () => ({ api: apiMock }));

import {
  anonymiserCompte,
  changerMotdepasse,
  getProfil,
  updateProfil,
} from "../../services/profil";

describe("profil service", () => {
  beforeEach(() => {
    Object.values(apiMock).forEach((mock) => mock.mockReset());
  });

  it("calls profile endpoints", async () => {
    apiMock.get.mockResolvedValueOnce({ data: { id: "user-1" } });
    apiMock.patch.mockResolvedValueOnce({ data: { prenom: "Mathis" } });
    apiMock.post
      .mockResolvedValueOnce({ data: { message: "password updated" } })
      .mockResolvedValueOnce({ data: { message: "deleted" } });

    await expect(getProfil()).resolves.toEqual({ id: "user-1" });
    await expect(updateProfil({ prenom: "Mathis", nom: "Lamotte" })).resolves.toEqual({
      prenom: "Mathis",
    });
    await expect(
      changerMotdepasse({
        ancienMotdepasse: "old",
        nouveauMotdepasse: "newpass",
        confirmation: "newpass",
      }),
    ).resolves.toEqual({ message: "password updated" });
    await expect(anonymiserCompte({ motdepasse: "secret" })).resolves.toEqual({
      message: "deleted",
    });

    expect(apiMock.get).toHaveBeenCalledWith("/v1/utilisateurs/profil");
    expect(apiMock.patch).toHaveBeenCalledWith("/v1/utilisateurs/profil", {
      prenom: "Mathis",
      nom: "Lamotte",
    });
    expect(apiMock.post).toHaveBeenNthCalledWith(
      1,
      "/v1/utilisateurs/changer-motdepasse",
      {
        ancienMotdepasse: "old",
        nouveauMotdepasse: "newpass",
        confirmation: "newpass",
      },
    );
    expect(apiMock.post).toHaveBeenNthCalledWith(
      2,
      "/v1/utilisateurs/anonymiser-compte",
      { motdepasse: "secret" },
    );
  });
});
