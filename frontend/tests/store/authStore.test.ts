import { beforeEach, describe, expect, it, vi } from "vitest";

const authServiceMock = vi.hoisted(() => ({
  login: vi.fn(),
  register: vi.fn(),
  forgotPassword: vi.fn(),
  resetPassword: vi.fn(),
  getMe: vi.fn(),
}));

const storageMock = vi.hoisted(() => ({
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
}));

const apiMock = vi.hoisted(() => ({
  setupAuthInterceptors: vi.fn(),
}));

vi.mock("../../services/auth", () => ({
  authService: authServiceMock,
}));
vi.mock("../../utils/storage", () => ({
  storage: storageMock,
}));
vi.mock("../../services/api", () => apiMock);

import { useAuthStore } from "../../store/authStore";

describe("authStore", () => {
  beforeEach(() => {
    useAuthStore.setState({
      token: null,
      user: null,
      isLoading: false,
      error: null,
      isInitialized: false,
    });
    Object.values(authServiceMock).forEach((mock) => mock.mockReset());
    Object.values(storageMock).forEach((mock) => mock.mockReset());
    apiMock.setupAuthInterceptors.mockReset();
  });

  it("logs in, stores token and loads user", async () => {
    authServiceMock.login.mockResolvedValueOnce({ token: "token" });
    authServiceMock.getMe.mockResolvedValueOnce({ id: "user-1" });

    await useAuthStore.getState().login("a@b.com", "secret");

    expect(storageMock.setItem).toHaveBeenCalledWith("auth_token", "token");
    expect(useAuthStore.getState()).toMatchObject({
      token: "token",
      user: { id: "user-1" },
      isLoading: false,
      error: null,
    });
  });

  it("sets french error on invalid login", async () => {
    const error = { response: { data: { error: "invalid credentials" } } };
    authServiceMock.login.mockRejectedValueOnce(error);

    await expect(useAuthStore.getState().login("a@b.com", "bad")).rejects.toBe(error);

    expect(useAuthStore.getState().error).toBe("Email ou mot de passe incorrect.");
  });

  it("requests password reset email", async () => {
    authServiceMock.forgotPassword.mockResolvedValueOnce({ message: "sent" });

    await useAuthStore.getState().forgotPassword("a@b.com");

    expect(authServiceMock.forgotPassword).toHaveBeenCalledWith("a@b.com");
    expect(useAuthStore.getState()).toMatchObject({
      isLoading: false,
      error: null,
    });
  });

  it("resets password with token", async () => {
    authServiceMock.resetPassword.mockResolvedValueOnce({ message: "reset" });

    await useAuthStore.getState().resetPassword("token", "new-secret");

    expect(authServiceMock.resetPassword).toHaveBeenCalledWith(
      "token",
      "new-secret",
    );
    expect(useAuthStore.getState()).toMatchObject({
      isLoading: false,
      error: null,
    });
  });

  it("initializes auth from saved token", async () => {
    storageMock.getItem.mockResolvedValueOnce("saved-token");
    authServiceMock.getMe.mockResolvedValueOnce({ id: "user-1" });

    await useAuthStore.getState().initializeAuth();

    expect(apiMock.setupAuthInterceptors).toHaveBeenCalled();
    expect(useAuthStore.getState()).toMatchObject({
      token: "saved-token",
      user: { id: "user-1" },
      isInitialized: true,
    });
  });

  it("logs out and clears local token", () => {
    useAuthStore.setState({ token: "token", user: { id: "user-1" } as any });

    useAuthStore.getState().logout();

    expect(storageMock.removeItem).toHaveBeenCalledWith("auth_token");
    expect(useAuthStore.getState()).toMatchObject({ token: null, user: null });
  });
});
