import { beforeEach, describe, expect, it, vi } from "vitest";

const poolMock = vi.hoisted(() => ({
  query: vi.fn(),
}));

vi.mock("../../src/db/mysql.js", () => ({ pool: poolMock }));
vi.mock("uuid", () => ({ v4: () => "ca-uuid" }));

import {
  createCA,
  deleteCA,
  getCA,
  getCAByMois,
  getCAEntreprise,
  getCAStats,
  updateCA,
} from "../../src/models/ca.js";

describe("ca model", () => {
  beforeEach(() => {
    poolMock.query.mockReset();
  });

  it("lists CA with filters and converts decimals", async () => {
    poolMock.query.mockResolvedValueOnce([[{ id: "ca1", ca_ht: "123.45" }]]);

    const rows = await getCA("user-1", {
      annee: 2026,
      mois: 6,
      entreprise_id: "e1",
    });

    expect(rows[0].ca_ht).toBe(123.45);
    expect(poolMock.query).toHaveBeenCalledWith(
      expect.stringContaining("AND cm.entreprise_id = ?"),
      ["user-1", 2026, 6, "e1"],
    );
  });

  it("returns null when monthly CA is missing", async () => {
    poolMock.query.mockResolvedValueOnce([[]]);
    await expect(getCAByMois("user-1", "e1", 2026, 6)).resolves.toBeNull();
  });

  it("updates existing CA instead of inserting duplicate month", async () => {
    poolMock.query
      .mockResolvedValueOnce([[{ id: "existing", ca_ht: 100 }]])
      .mockResolvedValueOnce([{ affectedRows: 1 }])
      .mockResolvedValueOnce([[{ id: "existing", ca_ht: 200 }]]);

    const result = await createCA("user-1", {
      entreprise_id: "e1",
      annee: 2026,
      mois: 6,
      ca_ht: 200,
    });

    expect(result).toEqual({ id: "existing", ca_ht: 200 });
    expect(poolMock.query).toHaveBeenNthCalledWith(
      2,
      "UPDATE ca_mensuel SET ca_ht = ?, updated_at = NOW() WHERE id = ?",
      [200, "existing"],
    );
  });

  it("inserts CA when no existing month is found", async () => {
    poolMock.query
      .mockResolvedValueOnce([[]])
      .mockResolvedValueOnce([{ affectedRows: 1 }])
      .mockResolvedValueOnce([[{ id: "ca-uuid", ca_ht: 300 }]]);

    await createCA("user-1", {
      entreprise_id: "e1",
      annee: 2026,
      mois: 6,
      ca_ht: 300,
    });

    expect(poolMock.query).toHaveBeenNthCalledWith(
      2,
      expect.stringContaining("INSERT INTO ca_mensuel"),
      ["ca-uuid", "user-1", "e1", 2026, 6, 300],
    );
  });

  it("updates and deletes CA by user scope", async () => {
    poolMock.query
      .mockResolvedValueOnce([{ affectedRows: 1 }])
      .mockResolvedValueOnce([[{ id: "ca1" }]])
      .mockResolvedValueOnce([{ affectedRows: 0 }]);

    await expect(updateCA("user-1", "ca1", { ca_ht: 100 })).resolves.toEqual({
      id: "ca1",
    });
    await expect(deleteCA("user-1", "missing")).resolves.toBe(false);
  });

  it("computes monthly CA stats", async () => {
    poolMock.query
      .mockResolvedValueOnce([[{ ca_total: "1000" }]])
      .mockResolvedValueOnce([[{ objectif_ht: "2000" }]])
      .mockResolvedValueOnce([
        [{ entreprise_id: "e1", entreprise_nom: "ACME", entreprise_logo: null, ca_total: "1000" }],
      ]);

    await expect(getCAStats("user-1", 2026, 6)).resolves.toEqual({
      ca_total: 1000,
      objectif: 2000,
      progression: 50,
      ca_par_entreprise: [
        {
          entreprise_id: "e1",
          entreprise_nom: "ACME",
          entreprise_logo: null,
          ca_total: 1000,
        },
      ],
    });
  });

  it("computes yearly CA for one entreprise", async () => {
    poolMock.query.mockResolvedValueOnce([
      [
        { id: "ca1", ca_ht: "100" },
        { id: "ca2", ca_ht: "300" },
      ],
    ]);

    await expect(getCAEntreprise("user-1", "e1", 2026)).resolves.toMatchObject({
      ca_total: 400,
      moyenne_mensuelle: 200,
    });
  });
});
