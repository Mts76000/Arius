import { afterEach, describe, expect, it, vi } from "vitest";

describe("storage utility", () => {
  afterEach(() => {
    vi.resetModules();
    vi.doUnmock("react-native");
    vi.doUnmock("@react-native-async-storage/async-storage");
  });

  it("uses localStorage on web", async () => {
    const localStorageMock = {
      getItem: vi.fn().mockReturnValue("value"),
      setItem: vi.fn(),
      removeItem: vi.fn(),
    };
    vi.stubGlobal("localStorage", localStorageMock);
    vi.doMock("react-native", () => ({ Platform: { OS: "web" } }));
    vi.doMock("@react-native-async-storage/async-storage", () => ({
      default: {
        getItem: vi.fn(),
        setItem: vi.fn(),
        removeItem: vi.fn(),
      },
    }));

    const { storage } = await import("../../utils/storage");

    await expect(storage.getItem("key")).resolves.toBe("value");
    await storage.setItem("key", "value");
    await storage.removeItem("key");

    expect(localStorageMock.getItem).toHaveBeenCalledWith("key");
    expect(localStorageMock.setItem).toHaveBeenCalledWith("key", "value");
    expect(localStorageMock.removeItem).toHaveBeenCalledWith("key");
  });

  it("uses AsyncStorage on native platforms", async () => {
    const asyncStorageMock = {
      getItem: vi.fn().mockResolvedValue("value"),
      setItem: vi.fn().mockResolvedValue(undefined),
      removeItem: vi.fn().mockResolvedValue(undefined),
    };
    vi.doMock("react-native", () => ({ Platform: { OS: "ios" } }));
    vi.doMock("@react-native-async-storage/async-storage", () => ({
      default: asyncStorageMock,
    }));

    const { storage } = await import("../../utils/storage");

    await expect(storage.getItem("key")).resolves.toBe("value");
    await storage.setItem("key", "value");
    await storage.removeItem("key");

    expect(asyncStorageMock.getItem).toHaveBeenCalledWith("key");
    expect(asyncStorageMock.setItem).toHaveBeenCalledWith("key", "value");
    expect(asyncStorageMock.removeItem).toHaveBeenCalledWith("key");
  });
});
