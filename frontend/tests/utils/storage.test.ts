import { afterEach, describe, expect, it, vi } from "vitest";

describe("storage utility", () => {
  afterEach(() => {
    vi.resetModules();
    vi.doUnmock("react-native");
    vi.doUnmock("expo-secure-store");
  });

  it("uses localStorage on web", async () => {
    const localStorageMock = {
      getItem: vi.fn().mockReturnValue("value"),
      setItem: vi.fn(),
      removeItem: vi.fn(),
    };
    vi.stubGlobal("localStorage", localStorageMock);
    vi.doMock("react-native", () => ({ Platform: { OS: "web" } }));
    vi.doMock("expo-secure-store", () => ({
      getItemAsync: vi.fn(),
      setItemAsync: vi.fn(),
      deleteItemAsync: vi.fn(),
    }));

    const { storage } = await import("../../utils/storage");

    await expect(storage.getItem("key")).resolves.toBe("value");
    await storage.setItem("key", "value");
    await storage.removeItem("key");

    expect(localStorageMock.getItem).toHaveBeenCalledWith("key");
    expect(localStorageMock.setItem).toHaveBeenCalledWith("key", "value");
    expect(localStorageMock.removeItem).toHaveBeenCalledWith("key");
  });

  it("uses SecureStore on native platforms", async () => {
    const secureStoreMock = {
      getItemAsync: vi.fn().mockResolvedValue("value"),
      setItemAsync: vi.fn().mockResolvedValue(undefined),
      deleteItemAsync: vi.fn().mockResolvedValue(undefined),
    };
    vi.doMock("react-native", () => ({ Platform: { OS: "ios" } }));
    vi.doMock("expo-secure-store", () => secureStoreMock);

    const { storage } = await import("../../utils/storage");

    await expect(storage.getItem("key")).resolves.toBe("value");
    await storage.setItem("key", "value");
    await storage.removeItem("key");

    expect(secureStoreMock.getItemAsync).toHaveBeenCalledWith("key");
    expect(secureStoreMock.setItemAsync).toHaveBeenCalledWith("key", "value");
    expect(secureStoreMock.deleteItemAsync).toHaveBeenCalledWith("key");
  });
});
