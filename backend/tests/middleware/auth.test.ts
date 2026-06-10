import { beforeEach, describe, expect, it, vi } from "vitest";

const userModel = vi.hoisted(() => ({
  getUserById: vi.fn(),
  isAnonymizedUser: vi.fn(),
  verifyJwt: vi.fn(),
}));

vi.mock("../../src/models/user.js", () => userModel);

import { requireAuth } from "../../src/middleware/auth.js";

function mockResponse() {
  const res = {
    status: vi.fn(),
    json: vi.fn(),
  };
  res.status.mockReturnValue(res);
  return res;
}

describe("requireAuth middleware", () => {
  beforeEach(() => {
    Object.values(userModel).forEach((mock) => mock.mockReset());
  });

  it("rejects requests without bearer token", async () => {
    const res = mockResponse();
    const next = vi.fn();

    await requireAuth({ headers: {} } as any, res as any, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it("attaches userId when token is valid", async () => {
    userModel.verifyJwt.mockReturnValueOnce({ sub: "user-1" });
    userModel.getUserById.mockResolvedValueOnce({ id: "user-1" });
    userModel.isAnonymizedUser.mockReturnValueOnce(false);
    const req = { headers: { authorization: "Bearer token" } } as any;
    const res = mockResponse();
    const next = vi.fn();

    await requireAuth(req, res as any, next);

    expect(req.userId).toBe("user-1");
    expect(next).toHaveBeenCalledOnce();
  });

  it("rejects anonymized users", async () => {
    userModel.verifyJwt.mockReturnValueOnce({ sub: "user-1" });
    userModel.getUserById.mockResolvedValueOnce({ id: "user-1" });
    userModel.isAnonymizedUser.mockReturnValueOnce(true);
    const res = mockResponse();

    await requireAuth(
      { headers: { authorization: "Bearer token" } } as any,
      res as any,
      vi.fn(),
    );

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: "Invalid or expired token" });
  });
});
