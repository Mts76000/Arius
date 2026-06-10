import { beforeEach, describe, expect, it, vi } from "vitest";

const poolMock = vi.hoisted(() => ({
  query: vi.fn(),
}));

vi.mock("../../src/db/mysql.js", () => ({ pool: poolMock }));
vi.mock("uuid", () => ({ v4: () => "objectif-uuid" }));

import {
  createObjectif,
  deleteObjectif,
  getObjectifByMois,
  getObjectifs,
  updateObjectif,
} from "../../src/models/objectif.js";

describe("objectif model", () => {
  beforeEach(() => {
    poolMock.query.mockReset();
  });

  it("lists objectifs and converts decimals", async () => {
    poolMock.query.mockResolvedValueOnce([[{ id: "o1", objectif_ht: "1200.50" }]]);

    const rows = await getObjectifs("user-1", 2026);

    expect(rows[0].objectif_ht).toBe(1200.5);
    expect(poolMock.query).toHaveBeenCalledWith(
      expect.stringContaining("AND annee = ?"),
      ["user-1", 2026],
    );
  });

  it("returns null when monthly objectif is missing", async () => {
    poolMock.query.mockResolvedValueOnce([[]]);
    await expect(getObjectifByMois("user-1", 2026, 6)).resolves.toBeNull();
  });

  it("updates existing objectif instead of inserting duplicate month", async () => {
    poolMock.query
      .mockResolvedValueOnce([[{ id: "o1", objectif_ht: "1000" }]])
      .mockResolvedValueOnce([{ affectedRows: 1 }])
      .mockResolvedValueOnce([[{ id: "o1", objectif_ht: "2000" }]]);

    await expect(
      createObjectif("user-1", { annee: 2026, mois: 6, objectif_ht: 2000 }),
    ).resolves.toMatchObject({ id: "o1", objectif_ht: 2000 });
  });

  it("inserts new objectif when missing", async () => {
    poolMock.query
      .mockResolvedValueOnce([[]])
      .mockResolvedValueOnce([{ affectedRows: 1 }])
      .mockResolvedValueOnce([[{ id: "objectif-uuid", objectif_ht: "1000" }]]);

    await createObjectif("user-1", { annee: 2026, mois: 6, objectif_ht: 1000 });

    expect(poolMock.query).toHaveBeenNthCalledWith(
      2,
      expect.stringContaining("INSERT INTO objectifs_mensuels"),
      ["objectif-uuid", "user-1", 2026, 6, 1000],
    );
  });

  it("updates and deletes objectif by user scope", async () => {
    poolMock.query
      .mockResolvedValueOnce([{ affectedRows: 0 }])
      .mockResolvedValueOnce([{ affectedRows: 1 }]);

    await expect(updateObjectif("user-1", "missing", { objectif_ht: 100 })).resolves.toBeNull();
    await expect(deleteObjectif("user-1", "o1")).resolves.toBe(true);
  });
});
