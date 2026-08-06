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

vi.mock("axios", () => ({ default: axiosMock }));
vi.mock("expo-constants", () => ({
  default: { expoConfig: { extra: { apiUrl: "http://api.test" } } },
}));

describe("api service", () => {
  beforeEach(() => {
    vi.resetModules();
    axiosMock.create.mockClear();
    axiosMock.requestUse.mockClear();
    axiosMock.responseUse.mockClear();
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
    const getToken = vi.fn().mockReturnValue("token");
    const logout = vi.fn();

    setupAuthInterceptors({ getToken, logout });

    const requestHandler = axiosMock.requestUse.mock.calls[0][0];
    const responseErrorHandler = axiosMock.responseUse.mock.calls[0][1];

    const config = requestHandler({ headers: {} });
    expect(getToken).toHaveBeenCalled();
    expect(config.headers.Authorization).toBe("Bearer token");

    await expect(
      responseErrorHandler({ response: { status: 401 } }),
    ).rejects.toEqual({ response: { status: 401 } });
    expect(logout).toHaveBeenCalledOnce();
  });
});
