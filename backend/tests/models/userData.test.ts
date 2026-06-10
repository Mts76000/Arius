import { beforeEach, describe, expect, it, vi } from "vitest";

const poolMock = vi.hoisted(() => ({
  execute: vi.fn(),
}));

const googleVerify = vi.hoisted(() => vi.fn());

vi.mock("../../src/db/mysql.js", () => ({ pool: poolMock }));
vi.mock("uuid", () => ({ v4: () => "user-uuid" }));
vi.mock("google-auth-library", () => ({
  OAuth2Client: vi.fn().mockImplementation(() => ({
    verifyIdToken: googleVerify,
  })),
}));

import {
  anonymizeUser,
  createUser,
  getUserByEmail,
  getUserByGoogleSub,
  getUserById,
  updateGoogleSubForEmail,
  verifyGoogleIdToken,
} from "../../src/models/user.js";

describe("user data model", () => {
  beforeEach(() => {
    poolMock.execute.mockReset();
    googleVerify.mockReset();
  });

  it("loads users by email, id and google sub", async () => {
    poolMock.execute
      .mockResolvedValueOnce([[{ id: "u1", email: "a@b.com" }]])
      .mockResolvedValueOnce([[{ id: "u1" }]])
      .mockResolvedValueOnce([[{ id: "u1", google_sub: "sub" }]])
      .mockResolvedValueOnce([[]]);

    await expect(getUserByEmail("a@b.com")).resolves.toEqual({
      id: "u1",
      email: "a@b.com",
    });
    await expect(getUserById("u1")).resolves.toEqual({ id: "u1" });
    await expect(getUserByGoogleSub("sub")).resolves.toEqual({
      id: "u1",
      google_sub: "sub",
    });
    await expect(getUserByEmail("missing@b.com")).resolves.toBeNull();
  });

  it("creates users and links google sub", async () => {
    poolMock.execute
      .mockResolvedValueOnce([{ affectedRows: 1 }])
      .mockResolvedValueOnce([[{ id: "user-uuid", email: "a@b.com" }]])
      .mockResolvedValueOnce([{ affectedRows: 1 }]);

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
      ["user-uuid", "a@b.com", "hash", null, "A", "B"],
    );

    await updateGoogleSubForEmail("a@b.com", "google-sub");
    expect(poolMock.execute).toHaveBeenLastCalledWith(
      "UPDATE users SET google_sub = ? WHERE email = ?",
      ["google-sub", "a@b.com"],
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

  it("verifies google id token payload", async () => {
    googleVerify.mockResolvedValueOnce({
      getPayload: () => ({
        sub: "google-sub",
        email: "a@b.com",
        given_name: "A",
        family_name: "B",
      }),
    });

    await expect(verifyGoogleIdToken("id-token")).resolves.toEqual({
      sub: "google-sub",
      email: "a@b.com",
      given_name: "A",
      family_name: "B",
    });
  });
});
