import { beforeEach, describe, expect, it, vi } from "vitest";

const poolMock = vi.hoisted(() => ({
  execute: vi.fn(),
}));

vi.mock("../../src/db/mysql.js", () => ({ pool: poolMock }));
vi.mock("uuid", () => ({ v4: () => "user-uuid" }));

import {
  anonymizeUser,
  createUser,
  getUserByEmail,
  getUserById,
} from "../../src/models/user.js";

describe("user data model", () => {
  beforeEach(() => {
    poolMock.execute.mockReset();
  });

  it("loads users by email and id", async () => {
    poolMock.execute
      .mockResolvedValueOnce([[{ id: "u1", email: "a@b.com" }]])
      .mockResolvedValueOnce([[{ id: "u1" }]])
      .mockResolvedValueOnce([[]]);

    await expect(getUserByEmail("a@b.com")).resolves.toEqual({
      id: "u1",
      email: "a@b.com",
    });
    await expect(getUserById("u1")).resolves.toEqual({ id: "u1" });
    await expect(getUserByEmail("missing@b.com")).resolves.toBeNull();
  });

  it("creates users", async () => {
    poolMock.execute
      .mockResolvedValueOnce([{ affectedRows: 1 }])
      .mockResolvedValueOnce([[{ id: "user-uuid", email: "a@b.com" }]]);

    await expect(
      createUser({
        email: "a@b.com",
        password: "hash",
        prenom: "A",
        nom: "B",
      }),
    ).resolves.toEqual({ id: "user-uuid", email: "a@b.com" });

    expect(poolMock.execute).toHaveBeenNthCalledWith(
      1,
      expect.stringContaining("INSERT INTO users"),
      ["user-uuid", "a@b.com", "hash", "A", "B"],
    );
  });

  it("anonymizes user personal data", async () => {
    poolMock.execute.mockResolvedValueOnce([{ affectedRows: 1 }]);

    await anonymizeUser("u1");

    expect(poolMock.execute).toHaveBeenCalledWith(
      expect.stringContaining("UPDATE users"),
      ["anonymized-u1@deleted.local", expect.any(String), "u1"],
    );
  });
});
