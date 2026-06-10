import { beforeEach, describe, expect, it, vi } from "vitest";

const contactModel = vi.hoisted(() => ({
  getContactsByEntreprise: vi.fn(),
  getContactById: vi.fn(),
  createContact: vi.fn(),
  updateContact: vi.fn(),
  deleteContact: vi.fn(),
}));

const entrepriseModel = vi.hoisted(() => ({
  getEntrepriseById: vi.fn(),
}));

vi.mock("../../src/models/contact.js", () => contactModel);
vi.mock("../../src/models/entreprise.js", () => entrepriseModel);

import {
  createContactHandler,
  listContactsByEntreprise,
  updateContactHandler,
} from "../../src/controllers/contactController.js";

function mockResponse() {
  const res = {
    status: vi.fn(),
    json: vi.fn(),
    send: vi.fn(),
  };
  res.status.mockReturnValue(res);
  return res;
}

describe("contact controller", () => {
  beforeEach(() => {
    Object.values(contactModel).forEach((mock) => mock.mockReset());
    entrepriseModel.getEntrepriseById.mockReset();
  });

  it("does not list contacts when entreprise is not owned by the user", async () => {
    entrepriseModel.getEntrepriseById.mockResolvedValueOnce(null);
    const res = mockResponse();

    await listContactsByEntreprise(
      { userId: "user-1", params: { entreprise_id: "e1" } } as any,
      res as any,
    );

    expect(contactModel.getContactsByEntreprise).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: "Entreprise non trouvée" });
  });

  it("validates email before creating a contact", async () => {
    entrepriseModel.getEntrepriseById.mockResolvedValueOnce({ id: "e1" });
    const res = mockResponse();

    await createContactHandler(
      {
        userId: "user-1",
        params: { entreprise_id: "e1" },
        body: { nom: "Durand", email: "not-an-email" },
      } as any,
      res as any,
    );

    expect(contactModel.createContact).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: expect.objectContaining({
        fieldErrors: expect.objectContaining({ email: ["Email invalide"] }),
      }),
    });
  });

  it("normalizes blank optional fields when creating a contact", async () => {
    entrepriseModel.getEntrepriseById.mockResolvedValueOnce({ id: "e1" });
    contactModel.createContact.mockResolvedValueOnce({ id: "c1" });
    const res = mockResponse();

    await createContactHandler(
      {
        userId: "user-1",
        params: { entreprise_id: "e1" },
        body: { nom: "Durand", prenom: "   ", poste: "" },
      } as any,
      res as any,
    );

    expect(contactModel.createContact).toHaveBeenCalledWith("user-1", {
      entreprise_id: "e1",
      nom: "Durand",
      prenom: null,
      poste: null,
      email: null,
      tel_direct: null,
      tel_mobile: null,
      contact_principal: false,
      commentaire: null,
    });
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ id: "c1" });
  });

  it("returns 404 when updating an unknown contact", async () => {
    contactModel.updateContact.mockResolvedValueOnce(null);
    const res = mockResponse();

    await updateContactHandler(
      { userId: "user-1", params: { id: "c1" }, body: { nom: "Durand" } } as any,
      res as any,
    );

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: "Contact non trouvé" });
  });
});
