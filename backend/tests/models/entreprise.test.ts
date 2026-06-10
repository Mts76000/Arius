import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  execute: vi.fn(),
  query: vi.fn(),
  getConnection: vi.fn(),
}));

vi.mock("../../src/db/mysql.js", () => ({
  pool: mocks,
}));

vi.mock("uuid", () => ({
  v4: () => "entreprise-uuid",
}));

import {
  createEntreprise,
  getEntreprises,
  updateEntreprise,
} from "../../src/models/entreprise.js";

describe("entreprise model", () => {
  beforeEach(() => {
    mocks.execute.mockReset();
    mocks.query.mockReset();
    mocks.getConnection.mockReset();
  });

  it("lists only the current user's entreprises with search, status and pagination", async () => {
    mocks.execute
      .mockResolvedValueOnce([[{ id: "e1", nom: "ACME" }]])
      .mockResolvedValueOnce([[{ total: 1 }]]);

    const result = await getEntreprises("user-1", {
      recherche: "ac",
      statut: "client",
      page: 2,
      limite: 10,
    });

    expect(result).toEqual({ entreprises: [{ id: "e1", nom: "ACME" }], total: 1 });
    expect(mocks.execute).toHaveBeenNthCalledWith(
      1,
      expect.stringContaining("WHERE e.user_id = ?"),
      ["user-1", "%ac%", "client", 10, 10],
    );
    expect(mocks.execute).toHaveBeenNthCalledWith(
      2,
      expect.stringContaining("COUNT(*)"),
      ["user-1", "%ac%", "client"],
    );
  });

  it("creates an entreprise with a generated UUID and returns the created row", async () => {
    const created = {
      id: "entreprise-uuid",
      user_id: "user-1",
      nom: "ACME",
      statut: "prospect",
    };
    mocks.execute
      .mockResolvedValueOnce([{ affectedRows: 1 }])
      .mockResolvedValueOnce([[created]]);

    const result = await createEntreprise("user-1", {
      nom: "ACME",
      statut: "prospect",
    });

    expect(result).toEqual(created);
    expect(mocks.execute).toHaveBeenNthCalledWith(
      1,
      expect.stringContaining("INSERT INTO entreprises"),
      [
        "entreprise-uuid",
        "user-1",
        "ACME",
        "prospect",
        null,
        null,
        null,
        null,
        null,
        null,
      ],
    );
  });

  it("returns the existing entreprise when update has no changed fields", async () => {
    const existing = {
      id: "e1",
      user_id: "user-1",
      nom: "ACME",
      statut: "client",
    };
    mocks.execute.mockResolvedValueOnce([[existing]]);

    const result = await updateEntreprise("e1", "user-1", {});

    expect(result).toEqual(existing);
    expect(mocks.execute).toHaveBeenCalledTimes(1);
  });
});
