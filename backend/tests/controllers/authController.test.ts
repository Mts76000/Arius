import { beforeEach, describe, expect, it, vi } from "vitest";

const userModel = vi.hoisted(() => ({
  comparePassword: vi.fn(),
  createUser: vi.fn(),
  generateJwt: vi.fn(),
  generatePasswordResetToken: vi.fn(),
  getUserByEmail: vi.fn(),
  getUserById: vi.fn(),
  hashPassword: vi.fn(),
  updateUserPassword: vi.fn(),
  verifyPasswordResetToken: vi.fn(),
}));

vi.mock("../../src/models/user.js", () => userModel);

const emailService = vi.hoisted(() => ({
  sendPasswordResetEmail: vi.fn(),
}));

vi.mock("../../src/services/emailService.js", () => emailService);

import {
  forgotPassword,
  login,
  me,
  register,
  resetPassword,
} from "../../src/controllers/authController.js";

function mockResponse() {
  const res = {
    status: vi.fn(),
    json: vi.fn(),
  };
  res.status.mockReturnValue(res);
  return res;
}

describe("auth controller", () => {
  beforeEach(() => {
    Object.values(userModel).forEach((mock) => mock.mockReset());
    Object.values(emailService).forEach((mock) => mock.mockReset());
  });

  it("rejects registration without email", async () => {
    const res = mockResponse();

    await register({ body: { password: "secret" } } as any, res as any);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: "validation_error" }),
    );
  });

  it("rejects registration when email already exists", async () => {
    userModel.getUserByEmail.mockResolvedValueOnce({ id: "existing" });
    const res = mockResponse();

    await register(
      { body: { email: "test@example.com", password: "secret" } } as any,
      res as any,
    );

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({ error: "email already in use" });
  });

  it("registers a user and returns a token", async () => {
    userModel.getUserByEmail.mockResolvedValueOnce(null);
    userModel.hashPassword.mockResolvedValueOnce("hashed");
    userModel.createUser.mockResolvedValueOnce({ id: "user-1" });
    userModel.generateJwt.mockReturnValueOnce("jwt-token");
    const res = mockResponse();

    await register(
      {
        body: {
          email: "test@example.com",
          password: "secret",
          prenom: "Mathis",
        },
      } as any,
      res as any,
    );

    expect(userModel.createUser).toHaveBeenCalledWith({
      email: "test@example.com",
      password: "hashed",
      prenom: "Mathis",
      nom: null,
    });
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ token: "jwt-token" });
  });

  it("rejects login with invalid credentials", async () => {
    userModel.getUserByEmail.mockResolvedValueOnce({
      id: "user-1",
      password: "hashed",
    });
    userModel.comparePassword.mockResolvedValueOnce(false);
    const res = mockResponse();

    await login(
      { body: { email: "test@example.com", password: "bad" } } as any,
      res as any,
    );

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: "invalid credentials" });
  });

  it("returns the current user without leaking password fields", async () => {
    userModel.getUserById.mockResolvedValueOnce({
      id: "user-1",
      email: "test@example.com",
      password: "hashed",
      prenom: "Mathis",
      nom: "Lamotte",
    });
    const res = mockResponse();

    await me({ userId: "user-1" } as any, res as any);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      id: "user-1",
      email: "test@example.com",
      prenom: "Mathis",
      nom: "Lamotte",
    });
  });

  it("sends a reset email when forgot password matches a user", async () => {
    userModel.getUserByEmail.mockResolvedValueOnce({
      id: "user-1",
      password: "hashed",
    });
    userModel.generatePasswordResetToken.mockReturnValueOnce("reset-token");
    emailService.sendPasswordResetEmail.mockResolvedValueOnce(undefined);
    const res = mockResponse();

    await forgotPassword(
      { body: { email: "test@example.com" } } as any,
      res as any,
    );

    expect(emailService.sendPasswordResetEmail).toHaveBeenCalledWith(
      "test@example.com",
      expect.stringContaining("reset-token"),
    );
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("does not reveal unknown emails on forgot password", async () => {
    userModel.getUserByEmail.mockResolvedValueOnce(null);
    const res = mockResponse();

    await forgotPassword(
      { body: { email: "missing@example.com" } } as any,
      res as any,
    );

    expect(emailService.sendPasswordResetEmail).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("resets password with a valid reset token", async () => {
    userModel.verifyPasswordResetToken.mockReturnValueOnce({ sub: "user-1" });
    userModel.getUserById.mockResolvedValueOnce({ id: "user-1" });
    userModel.hashPassword.mockResolvedValueOnce("new-hash");
    userModel.updateUserPassword.mockResolvedValueOnce(undefined);
    const res = mockResponse();

    await resetPassword(
      { body: { token: "reset-token", password: "new-secret" } } as any,
      res as any,
    );

    expect(userModel.updateUserPassword).toHaveBeenCalledWith(
      "user-1",
      "new-hash",
    );
    expect(res.status).toHaveBeenCalledWith(200);
  });
});
