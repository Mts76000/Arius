import { beforeEach, describe, expect, it, vi } from "vitest";

const apiMock = vi.hoisted(() => ({
  get: vi.fn(),
}));

vi.mock("react-native", () => ({
  Platform: { OS: "web" },
}));

vi.mock("../../services/api", () => ({ api: apiMock }));

import { exportService } from "../../services/export";

describe("exportService", () => {
  beforeEach(() => {
    apiMock.get.mockReset();
  });

  it("downloads selected export with filename from content disposition", async () => {
    apiMock.get.mockResolvedValueOnce({
      data: new Blob(["x"]),
      headers: {
        "content-type": "application/vnd.ms-excel",
        "content-disposition": 'attachment; filename="export_notes.xlsx"',
      },
    });

    await expect(exportService.download("token", "notes")).resolves.toMatchObject({
      filename: "export_notes.xlsx",
      contentType: "application/vnd.ms-excel",
    });

    expect(apiMock.get).toHaveBeenCalledWith("/v1/export/rgpd", {
      headers: { Authorization: "Bearer token" },
      params: { type: "notes" },
      responseType: "blob",
    });
  });

  it("builds fallback filename when header is missing", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-10T12:00:00.000Z"));
    apiMock.get.mockResolvedValueOnce({ data: new Blob(["x"]), headers: {} });

    await expect(exportService.download("token")).resolves.toMatchObject({
      filename: "export_complet_2026-06-10.xlsx",
      contentType: "application/zip",
    });

    vi.useRealTimers();
  });
});
