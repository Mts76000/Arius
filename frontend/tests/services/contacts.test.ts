import { beforeEach, describe, expect, it, vi } from "vitest";

const apiMock = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  delete: vi.fn(),
}));

vi.mock("../../services/api", () => ({ api: apiMock }));

import { contactsService } from "../../services/contacts";

describe("contactsService", () => {
  beforeEach(() => {
    Object.values(apiMock).forEach((mock) => mock.mockReset());
  });

  it("fetches contacts by entreprise with bearer auth", async () => {
    apiMock.get.mockResolvedValueOnce({ data: [{ id: "c1" }] });

    await expect(contactsService.getByEntreprise("token", "e1")).resolves.toEqual([
      { id: "c1" },
    ]);

    expect(apiMock.get).toHaveBeenCalledWith("/v1/entreprises/e1/contacts", {
      headers: { Authorization: "Bearer token" },
    });
  });

  it("creates and updates contacts with bearer auth", async () => {
    apiMock.post.mockResolvedValueOnce({ data: { id: "c1" } });
    apiMock.put.mockResolvedValueOnce({ data: { id: "c1", nom: "Durand" } });

    await contactsService.create("token", "e1", { nom: "Durand" });
    await contactsService.update("token", "c1", { nom: "Durand" });

    expect(apiMock.post).toHaveBeenCalledWith(
      "/v1/entreprises/e1/contacts",
      { nom: "Durand" },
      { headers: { Authorization: "Bearer token" } },
    );
    expect(apiMock.put).toHaveBeenCalledWith(
      "/v1/contacts/c1",
      { nom: "Durand" },
      { headers: { Authorization: "Bearer token" } },
    );
  });
});
