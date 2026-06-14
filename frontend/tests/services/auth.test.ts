import { beforeEach, describe, expect, it, vi } from "vitest";

const apiMock = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
}));

vi.mock("../../services/api", () => ({ api: apiMock }));

import { authService } from "../../services/auth";

describe("authService", () => {
  beforeEach(() => {
    Object.values(apiMock).forEach((mock) => mock.mockReset());
  });

  it("registers and logs in users", async () => {
    apiMock.post
      .mockResolvedValueOnce({ data: { token: "register-token" } })
      .mockResolvedValueOnce({ data: { token: "login-token" } });

    await expect(
      authService.register("a@b.com", "secret", "Mathis", "Lamotte"),
    ).resolves.toEqual({ token: "register-token" });
    await expect(authService.login("a@b.com", "secret")).resolves.toEqual({
      token: "login-token",
    });

    expect(apiMock.post).toHaveBeenNthCalledWith(1, "/v1/auth/register", {
      email: "a@b.com",
      password: "secret",
      prenom: "Mathis",
      nom: "Lamotte",
    });
    expect(apiMock.post).toHaveBeenNthCalledWith(2, "/v1/auth/login", {
      email: "a@b.com",
      password: "secret",
    });
  });

  it("requests and applies password reset", async () => {
    apiMock.post
      .mockResolvedValueOnce({ data: { message: "sent" } })
      .mockResolvedValueOnce({ data: { message: "reset" } });

    await expect(authService.forgotPassword("a@b.com")).resolves.toEqual({
      message: "sent",
    });
    await expect(
      authService.resetPassword("token", "new-secret"),
    ).resolves.toEqual({ message: "reset" });

    expect(apiMock.post).toHaveBeenNthCalledWith(
      1,
      "/v1/auth/forgot-password",
      { email: "a@b.com" },
    );
    expect(apiMock.post).toHaveBeenNthCalledWith(2, "/v1/auth/reset-password", {
      token: "token",
      password: "new-secret",
    });
  });

  it("loads current user with bearer token", async () => {
    apiMock.get.mockResolvedValueOnce({ data: { id: "user-1" } });

    await expect(authService.getMe("token")).resolves.toEqual({ id: "user-1" });

    expect(apiMock.get).toHaveBeenCalledWith("/v1/auth/me", {
      headers: { Authorization: "Bearer token" },
    });
  });
});
