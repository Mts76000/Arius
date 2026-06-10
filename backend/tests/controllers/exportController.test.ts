import { beforeEach, describe, expect, it, vi } from "vitest";

const exportService = vi.hoisted(() => ({
  streamRgpdExport: vi.fn(),
}));

vi.mock("../../src/services/exportService.js", () => exportService);

import { downloadExport } from "../../src/controllers/exportController.js";

function mockResponse() {
  const res = {
    status: vi.fn(),
    json: vi.fn(),
    headersSent: false,
  };
  res.status.mockReturnValue(res);
  return res;
}

describe("export controller", () => {
  beforeEach(() => {
    exportService.streamRgpdExport.mockReset();
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  it("rejects unauthenticated export requests", async () => {
    const res = mockResponse();

    await downloadExport({ query: {} } as any, res as any);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(exportService.streamRgpdExport).not.toHaveBeenCalled();
  });

  it("streams selected export type", async () => {
    const res = mockResponse();

    await downloadExport(
      { userId: "user-1", query: { type: ["notes"] } } as any,
      res as any,
    );

    expect(exportService.streamRgpdExport).toHaveBeenCalledWith(
      "user-1",
      res,
      "notes",
    );
  });

  it("returns 500 when export generation fails before headers are sent", async () => {
    exportService.streamRgpdExport.mockRejectedValueOnce(new Error("boom"));
    const res = mockResponse();

    await downloadExport({ userId: "user-1", query: {} } as any, res as any);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: "Erreur lors de la génération de l'export",
    });
  });
});
