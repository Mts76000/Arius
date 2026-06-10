import { beforeEach, describe, expect, it, vi } from "vitest";

const axiosMock = vi.hoisted(() => ({
  requestUse: vi.fn(),
  responseUse: vi.fn(),
  create: vi.fn(() => ({
    interceptors: {
      request: { use: axiosMock.requestUse },
      response: { use: axiosMock.responseUse },
    },
  })),
}));

const authStoreMock = vi.hoisted(() => ({
  state: {
    token: "token",
    logout: vi.fn(),
  },
  useAuthStore: {
    getState: vi.fn(() => authStoreMock.state),
  },
}));

vi.mock("axios", () => ({ default: axiosMock }));
vi.mock("expo-constants", () => ({
  default: { expoConfig: { extra: { apiUrl: "http://api.test" } } },
}));
vi.mock("../../store/authStore", () => ({
  useAuthStore: authStoreMock.useAuthStore,
}));

describe("api service", () => {
  beforeEach(() => {
    vi.resetModules();
    axiosMock.create.mockClear();
    axiosMock.requestUse.mockClear();
    axiosMock.responseUse.mockClear();
    authStoreMock.state.logout.mockClear();
    authStoreMock.state.token = "token";
  });

  it("creates axios instance with configured base URL", async () => {
    await import("../../services/api");

    expect(axiosMock.create).toHaveBeenCalledWith({
      baseURL: "http://api.test",
      timeout: 10000,
      headers: { "Content-Type": "application/json" },
    });
  });

  it("adds authorization header and logs out on 401", async () => {
    const { setupAuthInterceptors } = await import("../../services/api");

    setupAuthInterceptors();

    const requestHandler = axiosMock.requestUse.mock.calls[0][0];
    const responseErrorHandler = axiosMock.responseUse.mock.calls[0][1];

    const config = requestHandler({ headers: {} });
    expect(config.headers.Authorization).toBe("Bearer token");

    await expect(
      responseErrorHandler({ response: { status: 401 } }),
    ).rejects.toEqual({ response: { status: 401 } });
    expect(authStoreMock.state.logout).toHaveBeenCalledOnce();
  });
});
