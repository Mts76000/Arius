import { describe, expect, it } from "vitest";
import {
  comparePassword,
  generateJwt,
  getAnonymizedEmail,
  hashPassword,
  isAnonymizedUser,
  verifyJwt,
} from "../../src/models/user.js";

describe("user security helpers", () => {
  it("hashes and verifies passwords without storing the raw password", async () => {
    const password = "secret-123";

    const hash = await hashPassword(password);

    expect(hash).not.toBe(password);
    expect(await comparePassword(password, hash)).toBe(true);
    expect(await comparePassword("wrong-password", hash)).toBe(false);
  });

  it("creates JWT tokens scoped to the user id", () => {
    const token = generateJwt("user-1");

    expect(verifyJwt(token)).toMatchObject({ sub: "user-1" });
  });

  it("detects anonymized users", () => {
    const id = "user-42";

    expect(getAnonymizedEmail(id)).toBe("anonymized-user-42@deleted.local");
    expect(isAnonymizedUser({ id, email: getAnonymizedEmail(id) })).toBe(true);
    expect(isAnonymizedUser({ id, email: "real@example.com" })).toBe(false);
  });
});
